/**
 * CV Parser (Tool 2)
 *
 * Extracts bounded, local-only signals from PDF and DOCX uploads. Raw CV text
 * is neither persisted nor logged here. Anthropic-assisted semantic structuring
 * remains a separate rollout gate and is intentionally not called by this
 * module while its provider credential is unavailable.
 */

import type { CvSignals } from "./types.ts";
import { Buffer } from "node:buffer";
import DOMMatrixPolyfill from "npm:@thednp/dommatrix@3.1.1";

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_PAGES = 50;
const MAX_RAW_TEXT_CHARS = 64_000;
const MAX_CV_CHARS = 16_000;
const MAX_DOCX_ENTRIES = 2_048;
const MAX_DOCX_UNCOMPRESSED_BYTES = 32 * 1024 * 1024;
const MAX_DOCX_ENTRY_BYTES = 16 * 1024 * 1024;
const MAX_ZIP_RATIO = 250;

const CV_INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?previous\s+(instructions?|prompts?|context|rules?)/gi,
  /forget\s+(all\s+)?previous/gi,
  /you\s+are\s+now\s+(a|an)\s/gi,
  /act\s+as\s+(if\s+you\s+(are|were)|a\s)/gi,
  /override\s+(your\s+)?(instructions?|guidelines?|rules?)/gi,
  /disregard\s+(all\s+)?previous/gi,
  /new\s+instructions?\s*:/gi,
  /jailbreak/gi,
  /<\s*system\s*>/gi,
  /\[INST\]/g,
  /\[\/INST\]/g,
  /<\|system\|>/g,
  /<\|user\|>/g,
  /<\|assistant\|>/g,
  /###\s*(system|instruction)/gi,
  /<[^>]{0,200}>/g,
];

const SECTION_HEADINGS: Record<string, RegExp> = {
  experience:
    /^(?:(?:work\s+)?experience|employment|professional\s+experience|tajriba|ish\s+tajribasi|опыт(?:\s+работы)?|職歴|実務経験)$/i,
  education:
    /^(?:education|academic\s+background|ta['’]?lim|ma['’]?lumot|образование|学歴)$/i,
  skills:
    /^(?:(?:technical\s+)?skills|technologies|tech\s+stack|ko['’]?nikmalar|texnologiyalar|навыки|технологии|スキル|技術)$/i,
  languages: /^(?:languages|tillar|языки|語学|言語)$/i,
};

const TECH_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Deno",
  "Python",
  "Django",
  "FastAPI",
  "Java",
  "Kotlin",
  "Swift",
  "C#",
  ".NET",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Laravel",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Supabase",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "Terraform",
  "GitHub Actions",
] as const;

const LANGUAGE_ALIASES: Record<string, string> = {
  english: "English",
  ingliz: "English",
  английский: "English",
  英語: "English",
  uzbek: "Uzbek",
  "o‘zbek": "Uzbek",
  "o'zbek": "Uzbek",
  узбекский: "Uzbek",
  ウズベク語: "Uzbek",
  russian: "Russian",
  rus: "Russian",
  русский: "Russian",
  ロシア語: "Russian",
  japanese: "Japanese",
  yapon: "Japanese",
  японский: "Japanese",
  日本語: "Japanese",
};

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  yanvar: 1,
  январь: 1,
  января: 1,
  feb: 2,
  february: 2,
  fevral: 2,
  февраль: 2,
  февраля: 2,
  mar: 3,
  march: 3,
  mart: 3,
  март: 3,
  марта: 3,
  apr: 4,
  april: 4,
  aprel: 4,
  апрель: 4,
  апреля: 4,
  may: 5,
  mayıs: 5,
  май: 5,
  мая: 5,
  jun: 6,
  june: 6,
  iyun: 6,
  июнь: 6,
  июня: 6,
  jul: 7,
  july: 7,
  iyul: 7,
  июль: 7,
  июля: 7,
  aug: 8,
  august: 8,
  avgust: 8,
  август: 8,
  августа: 8,
  sep: 9,
  sept: 9,
  september: 9,
  sentabr: 9,
  сентябрь: 9,
  сентября: 9,
  oct: 10,
  october: 10,
  oktabr: 10,
  октябрь: 10,
  октября: 10,
  nov: 11,
  november: 11,
  noyabr: 11,
  ноябрь: 11,
  ноября: 11,
  dec: 12,
  december: 12,
  dekabr: 12,
  декабрь: 12,
  декабря: 12,
};

const MONTH_TOKEN = Object.keys(MONTHS)
  .sort((a, b) => b.length - a.length)
  .map(escapeRegex)
  .join("|");
const DATE_TOKEN =
  `(?:${MONTH_TOKEN})\\.?\\s+\\d{4}|\\d{4}[./-](?:0?[1-9]|1[0-2])|(?:0?[1-9]|1[0-2])[./-]\\d{4}|\\d{4}年(?:0?[1-9]|1[0-2])月|\\d{4}`;
const PRESENT_TOKEN =
  "present|current|now|hozir|hozirgacha|davom etmoqda|настоящее время|сейчас|現在|在職中";
const DATE_RANGE_RE = new RegExp(
  `(${DATE_TOKEN})\\s*(?:–|—|-|to|dan|から|до)\\s*(${DATE_TOKEN}|${PRESENT_TOKEN})`,
  "giu",
);

export async function parseCv(
  file: Uint8Array,
  mime: string,
  filename: string,
): Promise<CvSignals> {
  if (mime !== PDF_MIME && mime !== DOCX_MIME) {
    throw new Error("UNSUPPORTED_FILE_TYPE");
  }
  if (file.byteLength === 0) throw new Error("CV_PARSE_FAILED:EMPTY_FILE");
  if (file.byteLength > MAX_FILE_BYTES) throw new Error("CV_TOO_LARGE");

  const format = mime === PDF_MIME ? "pdf" : "docx";
  const safeFilename = sanitizeFilename(filename, format);

  let rawText: string;
  try {
    rawText = format === "pdf"
      ? await extractPdfText(file)
      : await extractDocxText(file);
  } catch (error) {
    return failedResult(safeFilename, format, safeErrorReason(error));
  }

  const normalised = normalizeExtractedText(rawText);
  if (normalised.length < 200) {
    return failedResult(
      safeFilename,
      format,
      "INSUFFICIENT_TEXT (possibly scanned PDF; OCR is not supported)",
      normalised.length,
    );
  }

  const safeText = sanitizeCvText(normalised);
  const dateRanges = extractDateRanges(safeText);
  const sections = extractSections(safeText);
  const techSkills = extractTechSkills(sections.skills ?? safeText);
  const languages = extractLanguages(sections.languages ?? "");
  const experienceYears = totalExperienceYears(dateRanges);

  return {
    filename: safeFilename,
    format,
    extracted_text_chars: safeText.length,
    experience_years_total: experienceYears ?? undefined,
    tech_skills: techSkills.length > 0 ? techSkills : undefined,
    languages: languages.length > 0 ? languages : undefined,
    // Local extraction is useful but semantic roles/education still require
    // the separately gated structured-output step.
    parse_status: "partial",
    error_reason: "SEMANTIC_STRUCTURING_PENDING",
  };
}

async function extractPdfText(file: Uint8Array): Promise<string> {
  assertPdfSignature(file);
  // pdfjs 6 uses current web-platform primitives that Deno 2.1 does not yet
  // expose. These standards-compatible polyfills keep text extraction pure JS
  // and avoid the legacy build's optional native canvas dependency.
  if (!(globalThis as Record<string, unknown>).DOMMatrix) {
    Object.defineProperty(globalThis, "DOMMatrix", {
      configurable: true,
      value: DOMMatrixPolyfill,
      writable: true,
    });
  }
  const uint8Prototype = Uint8Array.prototype as unknown as Record<
    string,
    unknown
  >;
  if (!uint8Prototype.toHex) {
    Object.defineProperty(Uint8Array.prototype, "toHex", {
      configurable: true,
      value(this: Uint8Array): string {
        return Array.from(
          this,
          (byte) => byte.toString(16).padStart(2, "0"),
        ).join("");
      },
      writable: true,
    });
  }
  const { getDocument } = await import(
    "npm:pdfjs-dist@6.2.108/build/pdf.mjs"
  );
  const task = getDocument({
    data: file.slice(),
    useSystemFonts: true,
    verbosity: 0,
  });

  try {
    const document = await task.promise;
    if (document.numPages > MAX_PDF_PAGES) {
      throw new Error("PDF_PAGE_LIMIT_EXCEEDED");
    }

    const pages: string[] = [];
    let charCount = 0;
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const lines: string[] = [];
      let line = "";
      for (const item of content.items) {
        if (!("str" in item)) continue;
        const value = item.str.trim();
        if (value) line += `${line ? " " : ""}${value}`;
        if (item.hasEOL && line) {
          lines.push(line);
          line = "";
        }
      }
      if (line) lines.push(line);
      const pageText = lines.join("\n");
      pages.push(pageText);
      charCount += pageText.length + 1;
      if (charCount >= MAX_RAW_TEXT_CHARS) break;
    }
    return pages.join("\n").slice(0, MAX_RAW_TEXT_CHARS);
  } finally {
    await task.destroy();
  }
}

async function extractDocxText(file: Uint8Array): Promise<string> {
  assertDocxArchive(file);
  const mammoth = (await import("npm:mammoth@1.12.1")).default;
  const result = await mammoth.extractRawText({ buffer: Buffer.from(file) });
  return result.value.slice(0, MAX_RAW_TEXT_CHARS);
}

export function extractDateRanges(
  text: string,
): { start: string; end: string | null }[] {
  const ranges: { start: string; end: string | null }[] = [];
  const seen = new Set<string>();
  DATE_RANGE_RE.lastIndex = 0;
  for (const match of text.matchAll(DATE_RANGE_RE)) {
    const start = parseDateToken(match[1]);
    const end = isPresentToken(match[2]) ? null : parseDateToken(match[2]);
    if (!start || (end !== null && (!end || end < start))) continue;
    const key = `${start}:${end ?? "present"}`;
    if (!seen.has(key)) {
      seen.add(key);
      ranges.push({ start, end });
    }
  }
  return ranges;
}

export function extractSections(text: string): Record<string, string> {
  const sections: Record<string, string[]> = {};
  let current: string | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const heading = line.replace(/[:：]\s*$/, "").trim();
    const matched = Object.entries(SECTION_HEADINGS).find(([, pattern]) =>
      pattern.test(heading)
    );
    if (matched) {
      current = matched[0];
      sections[current] ??= [];
      continue;
    }
    if (current) sections[current].push(line);
  }

  return Object.fromEntries(
    Object.entries(sections)
      .map(([key, lines]) => [key, lines.join("\n").trim()])
      .filter(([, value]) => value.length > 0),
  );
}

function extractTechSkills(text: string): string[] {
  return TECH_SKILLS.filter((skill) => {
    const escaped = escapeRegex(skill).replace(/\\ /g, "\\s+");
    return new RegExp(
      `(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`,
      "iu",
    )
      .test(text);
  });
}

function extractLanguages(text: string): string[] {
  const found = new Set<string>();
  for (const [alias, canonical] of Object.entries(LANGUAGE_ALIASES)) {
    if (text.toLocaleLowerCase().includes(alias.toLocaleLowerCase())) {
      found.add(canonical);
    }
  }
  return [...found];
}

function totalExperienceYears(
  ranges: { start: string; end: string | null }[],
): number | null {
  if (ranges.length === 0) return null;
  const now = new Date();
  const currentMonth = now.getUTCFullYear() * 12 + now.getUTCMonth();
  const intervals = ranges.map(({ start, end }) => ({
    start: monthIndex(start),
    end: end ? monthIndex(end) : currentMonth,
  })).filter(({ start, end }) => start <= end)
    .sort((a, b) => a.start - b.start);
  if (intervals.length === 0) return null;

  const merged: typeof intervals = [];
  for (const interval of intervals) {
    const previous = merged.at(-1);
    if (!previous || interval.start > previous.end + 1) {
      merged.push({ ...interval });
    } else {
      previous.end = Math.max(previous.end, interval.end);
    }
  }
  const months = merged.reduce(
    (sum, interval) => sum + interval.end - interval.start + 1,
    0,
  );
  return Math.round((months / 12) * 10) / 10;
}

function parseDateToken(value: string): string | null {
  const token = value.trim().toLocaleLowerCase().replace(/\.$/, "");
  let match = token.match(/^(\d{4})年(\d{1,2})月$/u);
  if (match) return isoMonth(Number(match[1]), Number(match[2]));
  match = token.match(/^(\d{4})[./-](\d{1,2})$/u);
  if (match) return isoMonth(Number(match[1]), Number(match[2]));
  match = token.match(/^(\d{1,2})[./-](\d{4})$/u);
  if (match) return isoMonth(Number(match[2]), Number(match[1]));
  match = token.match(new RegExp(`^(${MONTH_TOKEN})\\.?\\s+(\\d{4})$`, "iu"));
  if (match) {
    return isoMonth(Number(match[2]), MONTHS[match[1].toLocaleLowerCase()]);
  }
  match = token.match(/^(\d{4})$/u);
  return match ? isoMonth(Number(match[1]), 1) : null;
}

function isPresentToken(value: string): boolean {
  return new RegExp(`^(?:${PRESENT_TOKEN})$`, "iu").test(value.trim());
}

function isoMonth(year: number, month: number): string | null {
  if (year < 1900 || year > 2200 || month < 1 || month > 12) return null;
  return `${year}-${String(month).padStart(2, "0")}`;
}

function monthIndex(value: string): number {
  const [year, month] = value.split("-").map(Number);
  return year * 12 + month - 1;
}

function normalizeExtractedText(text: string): string {
  return text.normalize("NFKC")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/ +/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_RAW_TEXT_CHARS);
}

function sanitizeCvText(text: string): string {
  let safe = text.slice(0, MAX_CV_CHARS);
  for (const pattern of CV_INJECTION_PATTERNS) {
    safe = safe.replace(pattern, "[REDACTED]");
  }
  return safe;
}

function sanitizeFilename(filename: string, format: "pdf" | "docx"): string {
  const basename = filename.split(/[\\/]/).at(-1) ?? "";
  const clean = [...basename]
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint > 0x1f && codePoint !== 0x7f;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  return clean || `cv.${format}`;
}

function assertPdfSignature(file: Uint8Array): void {
  const signature = new TextDecoder().decode(file.subarray(0, 5));
  if (signature !== "%PDF-") throw new Error("INVALID_PDF_SIGNATURE");
}

function assertDocxArchive(file: Uint8Array): void {
  if (file.byteLength < 22 || file[0] !== 0x50 || file[1] !== 0x4b) {
    throw new Error("INVALID_DOCX_ARCHIVE");
  }
  const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
  const eocd = findEndOfCentralDirectory(view);
  const diskNumber = view.getUint16(eocd + 4, true);
  const centralDisk = view.getUint16(eocd + 6, true);
  const entriesOnDisk = view.getUint16(eocd + 8, true);
  const entries = view.getUint16(eocd + 10, true);
  const centralSize = view.getUint32(eocd + 12, true);
  const centralOffset = view.getUint32(eocd + 16, true);
  if (
    entries === 0xffff || centralSize === 0xffffffff ||
    centralOffset === 0xffffffff
  ) {
    throw new Error("DOCX_ZIP64_NOT_SUPPORTED");
  }
  if (entries === 0 || entries > MAX_DOCX_ENTRIES) {
    throw new Error("DOCX_ENTRY_LIMIT_EXCEEDED");
  }
  if (diskNumber !== 0 || centralDisk !== 0 || entriesOnDisk !== entries) {
    throw new Error("MULTI_DISK_DOCX_NOT_SUPPORTED");
  }
  if (centralOffset + centralSize > eocd) {
    throw new Error("INVALID_DOCX_ARCHIVE");
  }

  let offset = centralOffset;
  let totalUncompressed = 0;
  let hasDocumentXml = false;
  const decoder = new TextDecoder();
  for (let index = 0; index < entries; index += 1) {
    if (offset + 46 > eocd || view.getUint32(offset, true) !== 0x02014b50) {
      throw new Error("INVALID_DOCX_ARCHIVE");
    }
    const flags = view.getUint16(offset + 8, true);
    const compressionMethod = view.getUint16(offset + 10, true);
    const compressed = view.getUint32(offset + 20, true);
    const uncompressed = view.getUint32(offset + 24, true);
    const filenameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    if ((flags & 0x1) !== 0) throw new Error("ENCRYPTED_DOCX_NOT_SUPPORTED");
    if (compressionMethod !== 0 && compressionMethod !== 8) {
      throw new Error("UNSUPPORTED_DOCX_COMPRESSION");
    }
    if (compressed === 0xffffffff || uncompressed === 0xffffffff) {
      throw new Error("DOCX_ZIP64_NOT_SUPPORTED");
    }
    const nameStart = offset + 46;
    const nextOffset = nameStart + filenameLength + extraLength + commentLength;
    if (nextOffset > eocd) throw new Error("INVALID_DOCX_ARCHIVE");
    const name = decoder.decode(
      file.subarray(nameStart, nameStart + filenameLength),
    );
    if (
      name.startsWith("/") || /^[A-Za-z]:\//.test(name) ||
      name.includes("\\") || name.includes("\u0000") ||
      name.split("/").includes("..")
    ) {
      throw new Error("UNSAFE_DOCX_ENTRY_PATH");
    }
    if (uncompressed > MAX_DOCX_ENTRY_BYTES) {
      throw new Error("DOCX_ENTRY_SIZE_LIMIT_EXCEEDED");
    }
    if (compressed > 0 && uncompressed / compressed > MAX_ZIP_RATIO) {
      throw new Error("DOCX_COMPRESSION_RATIO_EXCEEDED");
    }
    totalUncompressed += uncompressed;
    if (totalUncompressed > MAX_DOCX_UNCOMPRESSED_BYTES) {
      throw new Error("DOCX_UNCOMPRESSED_SIZE_LIMIT_EXCEEDED");
    }
    if (name === "word/document.xml") hasDocumentXml = true;
    offset = nextOffset;
  }
  if (offset !== centralOffset + centralSize) {
    throw new Error("INVALID_DOCX_ARCHIVE");
  }
  if (!hasDocumentXml) throw new Error("INVALID_DOCX_ARCHIVE");
}

function findEndOfCentralDirectory(view: DataView): number {
  const minimum = Math.max(0, view.byteLength - 65_557);
  for (let offset = view.byteLength - 22; offset >= minimum; offset -= 1) {
    if (view.getUint32(offset, true) !== 0x06054b50) continue;
    const commentLength = view.getUint16(offset + 20, true);
    if (offset + 22 + commentLength === view.byteLength) return offset;
  }
  throw new Error("INVALID_DOCX_ARCHIVE");
}

function failedResult(
  filename: string,
  format: "pdf" | "docx",
  errorReason: string,
  extractedTextChars = 0,
): CvSignals {
  return {
    filename,
    format,
    extracted_text_chars: extractedTextChars,
    parse_status: "failed",
    error_reason: errorReason,
  };
}

function safeErrorReason(error: unknown): string {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  return /^[A-Z0-9_ :;().-]{1,160}$/i.test(message)
    ? message
    : "CV_PARSE_FAILED";
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
