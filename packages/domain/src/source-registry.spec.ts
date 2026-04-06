import { describe, expect, it } from "vitest";
import { CreateSourceInputSchema } from "./source-registry";

describe("Source registry domain schemas", () => {
  it("parses create-source input and defaults manual registration fields", () => {
    const parsed = CreateSourceInputSchema.parse({
      kind: "document",
      name: "March bank statement",
      snapshot: {
        originalFileName: "march-bank-statement.pdf",
        mediaType: "application/pdf",
        sizeBytes: 2048,
        checksumSha256:
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        storageKind: "external_url",
        storageRef: "https://example.com/statements/march.pdf",
      },
    });

    expect(parsed.originKind).toBe("manual");
    expect(parsed.createdBy).toBe("operator");
    expect(parsed.snapshot.ingestStatus).toBe("registered");
    expect(parsed.snapshot.checksumSha256).toBe(
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    );
  });
});
