"use server";

import {
  CreateSourceInputSchema,
  SourceKindSchema,
  SourceSnapshotStorageKindSchema,
} from "@pocket-cto/domain";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createSource,
  ingestSourceFile,
  uploadSourceFile,
} from "../../lib/api";

const sourceRegistrationFormSchema = z.object({
  capturedAt: z.string().trim().optional(),
  checksumSha256: z.string().trim().min(1),
  createdBy: z.string().trim().min(1),
  description: z.string().trim().optional(),
  kind: SourceKindSchema,
  mediaType: z.string().trim().min(1),
  name: z.string().trim().min(1),
  originalFileName: z.string().trim().min(1),
  sizeBytes: z.coerce.number().int().nonnegative(),
  storageKind: z.union([
    z.literal("external_url"),
    z.literal("local_path"),
    z.literal("connector_ref"),
  ]),
  storageRef: z.string().trim().min(1),
});

const sourceFileUploadSchema = z.object({
  capturedAt: z.string().trim().optional(),
  createdBy: z.string().trim().min(1),
  sourceId: z.string().uuid(),
});

const sourceFileIngestSchema = z.object({
  sourceFileId: z.string().uuid(),
  sourceId: z.string().uuid(),
});

export async function submitSourceRegistration(formData: FormData) {
  const rawInput = sourceRegistrationFormSchema.parse({
    capturedAt: formData.get("capturedAt"),
    checksumSha256: formData.get("checksumSha256"),
    createdBy: formData.get("createdBy"),
    description: formData.get("description"),
    kind: formData.get("kind"),
    mediaType: formData.get("mediaType"),
    name: formData.get("name"),
    originalFileName: formData.get("originalFileName"),
    sizeBytes: formData.get("sizeBytes"),
    storageKind: formData.get("storageKind"),
    storageRef: formData.get("storageRef"),
  });

  const created = await createSource(
    CreateSourceInputSchema.parse({
      createdBy: rawInput.createdBy,
      description: normalizeOptionalText(rawInput.description),
      kind: rawInput.kind,
      name: rawInput.name,
      snapshot: {
        capturedAt: normalizeOptionalText(rawInput.capturedAt) ?? undefined,
        checksumSha256: rawInput.checksumSha256,
        mediaType: rawInput.mediaType,
        originalFileName: rawInput.originalFileName,
        sizeBytes: rawInput.sizeBytes,
        storageKind: SourceSnapshotStorageKindSchema.parse(rawInput.storageKind),
        storageRef: rawInput.storageRef,
      },
    }),
  );

  revalidatePath("/");
  revalidatePath("/sources");
  redirect(`/sources/${created.source.id}` as Route);
}

export async function submitSourceFileUpload(formData: FormData) {
  const input = sourceFileUploadSchema.parse({
    capturedAt: formData.get("capturedAt"),
    createdBy: formData.get("createdBy"),
    sourceId: formData.get("sourceId"),
  });
  const file = requireFile(formData.get("file"));
  const body = new Uint8Array(await file.arrayBuffer());
  const uploaded = await uploadSourceFile({
    body,
    capturedAt: normalizeOptionalText(input.capturedAt) ?? undefined,
    createdBy: input.createdBy,
    mediaType: normalizeFileMediaType(file.type),
    originalFileName: file.name,
    sourceId: input.sourceId,
  });

  revalidatePath("/");
  revalidatePath("/sources");
  revalidatePath(`/sources/${input.sourceId}`);
  redirect(`/sources/${input.sourceId}#file-${uploaded.sourceFile.id}` as Route);
}

export async function submitSourceFileIngest(formData: FormData) {
  const input = sourceFileIngestSchema.parse({
    sourceFileId: formData.get("sourceFileId"),
    sourceId: formData.get("sourceId"),
  });
  const ingested = await ingestSourceFile({
    sourceFileId: input.sourceFileId,
  });

  revalidatePath("/");
  revalidatePath("/sources");
  revalidatePath(`/sources/${input.sourceId}`);
  redirect(
    `/sources/${input.sourceId}#ingest-run-${ingested.ingestRun.id}` as Route,
  );
}

function normalizeOptionalText(value?: string) {
  if (!value) {
    return null;
  }

  return value.length > 0 ? value : null;
}

function normalizeFileMediaType(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "application/octet-stream";
}

function requireFile(value: FormDataEntryValue | null) {
  if (value instanceof File && value.size > 0) {
    return value;
  }

  throw new Error("A source file is required");
}
