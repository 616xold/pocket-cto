import { createHash } from "node:crypto";
import {
  getDocument,
  VerbosityLevel,
  version as pdfjsVersion,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import type {
  TextPdfExtraction,
  TextPdfPage,
  TextPdfPageLine,
} from "./types";

type PdfTextItem = {
  str?: string;
  transform?: number[];
  hasEOL?: boolean;
};

type PositionedTextItem = {
  hasEOL: boolean;
  index: number;
  str: string;
  x: number | null;
  y: number | null;
};

export async function extractDeterministicPdfText(
  bytes: Buffer | Uint8Array,
): Promise<TextPdfExtraction> {
  const loadingTask = getDocument({
    data: new Uint8Array(bytes),
    disableFontFace: true,
    stopAtErrors: true,
    useSystemFonts: false,
    verbosity: VerbosityLevel.ERRORS,
  });

  try {
    const document = await loadingTask.promise;
    const pages: TextPdfPage[] = [];

    try {
      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        const page = await document.getPage(pageNumber);
        const textContent = await page.getTextContent({
          disableNormalization: false,
          includeMarkedContent: false,
        });
        const items = (textContent.items as unknown[])
          .filter(isPdfTextItem)
          .map((item, index) => toPositionedTextItem(item, index))
          .filter((item) => item.str.trim().length > 0);
        const lines = buildLines(pageNumber, items);

        pages.push({
          lines,
          pageNumber,
          text: lines.map((line) => line.text).join("\n"),
          textItemCount: items.length,
        });
      }
    } finally {
      await document.destroy();
    }

    return {
      pageCount: document.numPages,
      pages,
      parserVersion: pdfjsVersion,
    };
  } catch (error) {
    throw normalizePdfError(error);
  }
}

export function checksumPdfBytes(bytes: Buffer | Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

function isPdfTextItem(item: unknown): item is PdfTextItem {
  return typeof item === "object" && item !== null && "str" in item;
}

function toPositionedTextItem(
  item: PdfTextItem,
  index: number,
): PositionedTextItem {
  return {
    hasEOL: item.hasEOL === true,
    index,
    str: item.str ?? "",
    x: typeof item.transform?.[4] === "number" ? item.transform[4] : null,
    y: typeof item.transform?.[5] === "number" ? item.transform[5] : null,
  };
}

function buildLines(pageNumber: number, items: PositionedTextItem[]) {
  const lines: TextPdfPageLine[] = [];
  let draft: PositionedTextItem[] = [];

  for (const item of items) {
    if (draft.length > 0 && isNewVisualLine(draft.at(-1), item)) {
      lines.push(toLine(pageNumber, lines.length + 1, draft));
      draft = [];
    }

    draft.push(item);

    if (item.hasEOL) {
      lines.push(toLine(pageNumber, lines.length + 1, draft));
      draft = [];
    }
  }

  if (draft.length > 0) {
    lines.push(toLine(pageNumber, lines.length + 1, draft));
  }

  return lines.filter((line) => line.text.length > 0);
}

function isNewVisualLine(
  previous: PositionedTextItem | undefined,
  current: PositionedTextItem,
) {
  if (!previous || previous.y === null || current.y === null) return false;
  return Math.abs(previous.y - current.y) > 3;
}

function toLine(
  pageNumber: number,
  lineNumber: number,
  items: PositionedTextItem[],
): TextPdfPageLine {
  const text = items
    .map((item) => item.str)
    .join(" ")
    .trim();

  return {
    endTextOffset: text.length,
    lineNumber,
    pageNumber,
    startTextOffset: 0,
    text,
  };
}

function normalizePdfError(error: unknown) {
  if (error instanceof Error) return error;
  return new Error(String(error));
}
