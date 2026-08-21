import { Document, Packer, Paragraph } from "npm:docx@9.7.1";
import { PDFDocument, StandardFonts } from "npm:pdf-lib@1.17.1";
import { extractDateRanges, extractSections, parseCv } from "./cv-parser.ts";

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEquals<T>(actual: T, expected: T, message: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${message}: expected ${JSON.stringify(expected)}, got ${
        JSON.stringify(actual)
      }`,
    );
  }
}

async function assertRejects(
  operation: () => Promise<unknown>,
  expected: string,
): Promise<void> {
  try {
    await operation();
  } catch (error) {
    assert(
      error instanceof Error && error.message === expected,
      `expected ${expected}, got ${String(error)}`,
    );
    return;
  }
  throw new Error(`expected rejection: ${expected}`);
}

const CV_LINES = [
  "Jane Example — Senior TypeScript Engineer with ten years of product delivery experience.",
  "Experience",
  "Senior Engineer at Example Cloud, January 2020 - Present. Built secure multi-tenant systems.",
  "Software Engineer at Example Labs, 2017-03 - 2019-12. Maintained customer-facing applications.",
  "Education",
  "Bachelor of Computer Science, Example University, 2017.",
  "Skills",
  "TypeScript, React, Node.js, PostgreSQL, Docker, GitHub Actions and AWS.",
  "Languages",
  "English — fluent; Japanese — intermediate; O'zbek — native.",
];

async function createPdf(lines = CV_LINES, pages = 1): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  for (let index = 0; index < pages; index += 1) {
    const page = document.addPage([595, 842]);
    let y = 790;
    for (const line of lines) {
      page.drawText(line.replace(/[^\x20-\x7e]/g, "-"), {
        x: 40,
        y,
        size: 10,
        font,
      });
      y -= 24;
    }
  }
  return await document.save();
}

async function createDocx(lines = CV_LINES): Promise<Uint8Array> {
  const document = new Document({
    sections: [{ children: lines.map((line) => new Paragraph(line)) }],
  });
  const blob = await Packer.toBlob(document);
  return new Uint8Array(await blob.arrayBuffer());
}

Deno.test("CV parser extracts bounded local signals from a real PDF", async () => {
  const result = await parseCv(
    await createPdf(),
    PDF_MIME,
    "../private/Jane\u0000 Resume.pdf",
  );

  assertEquals(result.filename, "Jane Resume.pdf", "safe basename");
  assertEquals(result.format, "pdf", "format");
  assert(result.extracted_text_chars >= 200, "meaningful text extracted");
  assertEquals(result.parse_status, "partial", "semantic step remains gated");
  assertEquals(
    result.error_reason,
    "SEMANTIC_STRUCTURING_PENDING",
    "explicit partial reason",
  );
  assert(result.experience_years_total !== undefined, "experience calculated");
  assert(result.tech_skills?.includes("TypeScript"), "skill extracted");
  assert(
    result.tech_skills?.includes("PostgreSQL"),
    "database skill extracted",
  );
});

Deno.test("CV parser extracts local signals from a real DOCX", async () => {
  const result = await parseCv(await createDocx(), DOCX_MIME, "jane.docx");

  assertEquals(result.format, "docx", "format");
  assertEquals(result.parse_status, "partial", "semantic step remains gated");
  assert(result.extracted_text_chars >= 200, "meaningful text extracted");
  assertEquals(
    result.languages,
    ["English", "Uzbek", "Japanese"],
    "language aliases",
  );
  assert(result.tech_skills?.includes("GitHub Actions"), "CI skill extracted");
});

Deno.test("CV parser rejects unsupported MIME and oversized input before parsing", async () => {
  await assertRejects(
    () => parseCv(new Uint8Array([1]), "text/plain", "cv.txt"),
    "UNSUPPORTED_FILE_TYPE",
  );
  await assertRejects(
    () => parseCv(new Uint8Array(5 * 1024 * 1024 + 1), PDF_MIME, "cv.pdf"),
    "CV_TOO_LARGE",
  );
});

Deno.test("CV parser maps invalid signatures and image-only PDFs to safe failures", async () => {
  const invalidPdf = await parseCv(
    new TextEncoder().encode("not a pdf"),
    PDF_MIME,
    "invalid.pdf",
  );
  assertEquals(invalidPdf.parse_status, "failed", "invalid PDF status");
  assertEquals(invalidPdf.error_reason, "INVALID_PDF_SIGNATURE", "safe reason");

  const emptyPdf = await createPdf([]);
  const scanned = await parseCv(emptyPdf, PDF_MIME, "scan.pdf");
  assertEquals(scanned.parse_status, "failed", "image-only status");
  assert(
    scanned.error_reason?.startsWith("INSUFFICIENT_TEXT") === true,
    "OCR limitation explained",
  );
});

Deno.test("CV parser enforces the PDF page bound", async () => {
  const result = await parseCv(
    await createPdf(["bounded page"], 51),
    PDF_MIME,
    "long.pdf",
  );
  assertEquals(result.parse_status, "failed", "page limit status");
  assertEquals(
    result.error_reason,
    "PDF_PAGE_LIMIT_EXCEEDED",
    "page limit reason",
  );
});

Deno.test("CV parser rejects a DOCX entry claiming excessive expansion", async () => {
  const docx = await createDocx();
  const mutated = docx.slice();
  const view = new DataView(mutated.buffer);
  const decoder = new TextDecoder();
  for (let offset = 0; offset + 46 < mutated.length; offset += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) continue;
    const filenameLength = view.getUint16(offset + 28, true);
    const name = decoder.decode(
      mutated.subarray(offset + 46, offset + 46 + filenameLength),
    );
    if (name === "word/document.xml") {
      view.setUint32(offset + 24, 17 * 1024 * 1024, true);
      break;
    }
  }

  const result = await parseCv(mutated, DOCX_MIME, "bomb.docx");
  assertEquals(result.parse_status, "failed", "archive limit status");
  assertEquals(
    result.error_reason,
    "DOCX_ENTRY_SIZE_LIMIT_EXCEEDED",
    "archive limit reason",
  );
});

Deno.test("date range extraction supports EN, UZ, RU, JA and rejects reversed dates", () => {
  assertEquals(
    extractDateRanges(
      "Jan 2020 - Present; mart 2018 - dekabr 2019; март 2016 — февраль 2017; 2014年4月から2015年3月; 2025-01 - 2024-01",
    ),
    [
      { start: "2020-01", end: null },
      { start: "2018-03", end: "2019-12" },
      { start: "2016-03", end: "2017-02" },
      { start: "2014-04", end: "2015-03" },
    ],
    "localized ranges",
  );
});

Deno.test("section extraction recognizes localized headings without swallowing prefixes", () => {
  assertEquals(
    extractSections(
      "Profile\nGeneral intro\nIsh tajribasi:\nEngineer\nTa'lim\nUniversity\nスキル\nTypeScript\n言語\n日本語",
    ),
    {
      experience: "Engineer",
      education: "University",
      skills: "TypeScript",
      languages: "日本語",
    },
    "localized sections",
  );
});
