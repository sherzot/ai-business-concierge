import fontkit from "npm:@pdf-lib/fontkit@1.1.1";
import {
  PDFDocument,
  type PDFFont,
  type PDFPage,
  rgb,
} from "npm:pdf-lib@1.17.1";
import {
  AlignmentType,
  Document,
  Footer,
  Packer,
  Paragraph,
  TextRun,
} from "npm:docx@9.7.1";
import { Buffer } from "node:buffer";
import type { DocumentFormat, DocumentLocale } from "./document-generator.ts";

export const GENERATED_DOCUMENTS_BUCKET = "generated-documents";
export const DOCUMENT_ASSETS_BUCKET = "document-assets";
export const SIGNED_DOWNLOAD_TTL_SECONDS = 60;
export const MAX_GENERATED_FILE_BYTES = 10 * 1024 * 1024;

const DOCUMENT_FONT_NAME = "Noto Sans JP";
const DOCUMENT_FONT_PATH = "fonts/NotoSansJP-Regular.otf";
const DOCUMENT_FONT_URL =
  "https://raw.githubusercontent.com/notofonts/noto-cjk/Sans2.004/Sans/SubsetOTF/JP/NotoSansJP-Regular.otf";
const DOCUMENT_FONT_SHA256 =
  "dff723ba59d57d136764a04b9b2d03205544f7cd785a711442d6d2d085ac5073";
const DOCUMENT_FONT_FETCH_TIMEOUT_MS = 15_000;

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type BinaryInput = {
  title: string;
  content: string;
  locale: DocumentLocale;
  format: DocumentFormat;
  supabase: any;
  documentFontBytes?: Uint8Array;
};

export type GeneratedBinary = {
  bytes: Uint8Array;
  mimeType: string;
  sha256: string;
};

export type StoredDocumentBinary = Omit<GeneratedBinary, "bytes"> & {
  storageBucket: typeof GENERATED_DOCUMENTS_BUCKET;
  storagePath: string;
  fileSize: number;
};

export class DocumentBinaryError extends Error {
  constructor(
    message: string,
    readonly code:
      | "FONT_UNAVAILABLE"
      | "FONT_INTEGRITY_ERROR"
      | "GENERATION_FAILED"
      | "FILE_TOO_LARGE",
  ) {
    super(message);
    this.name = "DocumentBinaryError";
  }
}

let cachedDocumentFont: Promise<Uint8Array> | null = null;

export function documentMimeType(format: DocumentFormat) {
  return format === "pdf" ? PDF_MIME : DOCX_MIME;
}

export function documentStoragePath(args: {
  tenantId: string;
  userId: string;
  documentId: string;
  format: DocumentFormat;
}) {
  return `${args.tenantId}/${args.userId}/documents/${args.documentId}/document.${args.format}`;
}

export function safeDownloadName(title: string, format: DocumentFormat) {
  const normalized = title
    .normalize("NFKC")
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return `${normalized || "document"}.${format}`;
}

export async function sha256Hex(bytes: Uint8Array) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(
    new Uint8Array(digest),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function verifyDocumentFont(bytes: Uint8Array) {
  const digest = await sha256Hex(bytes);
  if (digest !== DOCUMENT_FONT_SHA256) {
    throw new DocumentBinaryError(
      "Noto Sans font checksum mos kelmadi.",
      "FONT_INTEGRITY_ERROR",
    );
  }
  return bytes;
}

async function fetchPinnedDocumentFont() {
  let response: Response;
  try {
    response = await fetch(DOCUMENT_FONT_URL, {
      signal: AbortSignal.timeout(DOCUMENT_FONT_FETCH_TIMEOUT_MS),
    });
  } catch (error) {
    throw new DocumentBinaryError(
      `Noto Sans fontini yuklab bo'lmadi: ${
        error instanceof Error ? error.message : "network error"
      }`,
      "FONT_UNAVAILABLE",
    );
  }

  if (!response.ok) {
    throw new DocumentBinaryError(
      `Noto Sans font manbasi HTTP ${response.status} qaytardi.`,
      "FONT_UNAVAILABLE",
    );
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.length || bytes.length > 5 * 1024 * 1024) {
    throw new DocumentBinaryError(
      "Noto Sans font hajmi kutilgan chegaradan tashqarida.",
      "FONT_INTEGRITY_ERROR",
    );
  }
  return verifyDocumentFont(bytes);
}

async function loadDocumentFont(supabase: any) {
  if (cachedDocumentFont) return cachedDocumentFont;

  cachedDocumentFont = (async () => {
    const bucket = supabase.storage.from(DOCUMENT_ASSETS_BUCKET);
    const { data: storedFont, error: downloadError } = await bucket.download(
      DOCUMENT_FONT_PATH,
    );

    if (storedFont && !downloadError) {
      try {
        return await verifyDocumentFont(
          new Uint8Array(await storedFont.arrayBuffer()),
        );
      } catch (error) {
        console.error("Cached document font integrity error", error);
        await bucket.remove([DOCUMENT_FONT_PATH]);
      }
    }

    const verifiedFont = await fetchPinnedDocumentFont();
    const { error: uploadError } = await bucket.upload(
      DOCUMENT_FONT_PATH,
      verifiedFont,
      {
        contentType: "font/otf",
        cacheControl: "31536000",
        upsert: false,
      },
    );

    // A parallel cold start may win the first upload. The bytes returned here
    // were checksum-verified, so an already-existing object is safe to reuse.
    if (uploadError && !/already exists|duplicate/i.test(uploadError.message)) {
      console.error("Document font cache upload error", uploadError);
    }
    return verifiedFont;
  })().catch((error) => {
    cachedDocumentFont = null;
    throw error;
  });

  return cachedDocumentFont;
}

async function resolveDocumentFont(input: BinaryInput) {
  return input.documentFontBytes
    ? await verifyDocumentFont(input.documentFontBytes)
    : await loadDocumentFont(input.supabase);
}

function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
) {
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r\n?/g, "\n").split("\n")) {
    if (!paragraph) {
      lines.push("");
      continue;
    }

    let line = "";
    for (const character of Array.from(paragraph)) {
      const candidate = `${line}${character}`;
      if (
        line &&
        font.widthOfTextAtSize(candidate, fontSize) > maxWidth
      ) {
        lines.push(line.trimEnd());
        line = character.trimStart();
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line.trimEnd());
  }
  return lines;
}

function drawPdfHeader(page: PDFPage, font: PDFFont) {
  page.drawText("AI BUSINESS CONCIERGE", {
    x: 54,
    y: page.getHeight() - 42,
    size: 8,
    font,
    color: rgb(0.31, 0.27, 0.9),
  });
  page.drawLine({
    start: { x: 54, y: page.getHeight() - 50 },
    end: { x: page.getWidth() - 54, y: page.getHeight() - 50 },
    thickness: 0.6,
    color: rgb(0.85, 0.87, 0.91),
  });
}

async function generatePdf(input: BinaryInput) {
  const fontBytes = await resolveDocumentFont(input);
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  // pdf-lib/fontkit's CFF subsetting corrupts glyph maps for Noto Sans JP.
  // Embedding the verified 4.53 MB font intact keeps all four locales readable
  // and remains within the 10 MB generated-file limit.
  const font = await pdf.embedFont(fontBytes, { subset: false });

  pdf.setTitle(input.title);
  pdf.setAuthor("AI Business Concierge");
  pdf.setCreator("AI Business Concierge — AI Hujjatchi");
  pdf.setProducer("pdf-lib 1.17.1");
  pdf.setSubject(`Generated document (${input.locale})`);
  pdf.setKeywords(["AI Business Concierge", "AI Hujjatchi", input.locale]);

  const pageSize: [number, number] = [595.28, 841.89];
  const marginX = 54;
  const bottomMargin = 62;
  const bodySize = input.locale === "ja" ? 10 : 10.5;
  const bodyLineHeight = input.locale === "ja" ? 16.5 : 16;
  const maxWidth = pageSize[0] - marginX * 2;
  const lines = wrapText(input.content, font, bodySize, maxWidth);

  let page = pdf.addPage(pageSize);
  drawPdfHeader(page, font);
  let y = page.getHeight() - 84;

  const titleLines = wrapText(input.title, font, 18, maxWidth);
  for (const titleLine of titleLines) {
    page.drawText(titleLine, {
      x: marginX,
      y,
      size: 18,
      font,
      color: rgb(0.06, 0.09, 0.16),
    });
    y -= 24;
  }
  y -= 14;

  for (const line of lines) {
    if (y < bottomMargin) {
      page = pdf.addPage(pageSize);
      drawPdfHeader(page, font);
      y = page.getHeight() - 78;
    }
    if (line) {
      page.drawText(line, {
        x: marginX,
        y,
        size: bodySize,
        font,
        color: rgb(0.12, 0.16, 0.23),
      });
    }
    y -= bodyLineHeight;
  }

  const pages = pdf.getPages();
  pages.forEach((currentPage, index) => {
    const pageLabel = `${index + 1} / ${pages.length}`;
    const labelWidth = font.widthOfTextAtSize(pageLabel, 8);
    currentPage.drawText(pageLabel, {
      x: (currentPage.getWidth() - labelWidth) / 2,
      y: 28,
      size: 8,
      font,
      color: rgb(0.45, 0.49, 0.56),
    });
  });

  return pdf.save();
}

async function generateDocx(input: BinaryInput) {
  const fontBytes = await resolveDocumentFont(input);
  const fontName = DOCUMENT_FONT_NAME;
  const contentParagraphs = input.content
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) =>
      new Paragraph({
        spacing: { after: line ? 120 : 80, line: 300 },
        children: line
          ? [new TextRun({ text: line, font: fontName, size: 21 })]
          : [],
      })
    );

  const document = new Document({
    creator: "AI Business Concierge",
    title: input.title,
    description: `AI Hujjatchi generated document (${input.locale})`,
    fonts: [{ name: fontName, data: Buffer.from(fontBytes) }],
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "AI Business Concierge — AI Hujjatchi",
                    color: "77808F",
                    font: fontName,
                    size: 16,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            spacing: { after: 320 },
            children: [
              new TextRun({
                text: input.title,
                bold: true,
                font: fontName,
                size: 36,
                color: "111827",
              }),
            ],
          }),
          ...contentParagraphs,
        ],
      },
    ],
  });

  return new Uint8Array(await Packer.toBuffer(document));
}

export async function generateDocumentBinary(
  input: BinaryInput,
): Promise<GeneratedBinary> {
  try {
    const bytes = input.format === "pdf"
      ? await generatePdf(input)
      : await generateDocx(input);

    if (!bytes.length || bytes.length > MAX_GENERATED_FILE_BYTES) {
      throw new DocumentBinaryError(
        "Yaratilgan fayl 10 MB chegarasidan oshdi.",
        "FILE_TOO_LARGE",
      );
    }

    return {
      bytes,
      mimeType: documentMimeType(input.format),
      sha256: await sha256Hex(bytes),
    };
  } catch (error) {
    if (error instanceof DocumentBinaryError) throw error;
    throw new DocumentBinaryError(
      `Binary hujjat yaratilmadi: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
      "GENERATION_FAILED",
    );
  }
}

export async function generateAndStoreDocumentBinary(
  args: BinaryInput & {
    tenantId: string;
    userId: string;
    documentId: string;
    upsert?: boolean;
  },
): Promise<StoredDocumentBinary> {
  const generated = await generateDocumentBinary(args);
  const storagePath = documentStoragePath(args);
  const { error } = await args.supabase.storage
    .from(GENERATED_DOCUMENTS_BUCKET)
    .upload(storagePath, generated.bytes, {
      contentType: generated.mimeType,
      cacheControl: "0",
      upsert: Boolean(args.upsert),
    });

  if (error) {
    throw new DocumentBinaryError(
      `Private Storage upload xatoligi: ${error.message}`,
      "GENERATION_FAILED",
    );
  }

  return {
    storageBucket: GENERATED_DOCUMENTS_BUCKET,
    storagePath,
    mimeType: generated.mimeType,
    fileSize: generated.bytes.length,
    sha256: generated.sha256,
  };
}
