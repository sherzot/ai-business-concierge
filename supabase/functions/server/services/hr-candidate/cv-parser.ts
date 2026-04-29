/**
 * CV Parser (Tool 2)
 *
 * Status: SKELETON (TODO bloklari implementatsiya kutilmoqda).
 * Owner: backend agent (next session).
 *
 * Responsibilities:
 *   • PDF → text via pdfjs-dist
 *   • DOCX → text via mammoth.js
 *   • Heuristic regex extraction (date ranges, sections)
 *   • Claude Haiku post-processing → structured JSON (cheap, ~500 tokens)
 *   • Compute experience_years_total from role durations
 *
 * Constraints:
 *   • Hard timeout: 5 s (orchestrator level)
 *   • Max file size: 5 MB (validated upstream)
 *   • Scanned/image-only PDFs → parse_status: "failed" (OCR is V2.5)
 *   • Two-column PDFs may scramble text → parse_status: "partial" if < 200 chars
 */

import type { CvSignals, CvRole } from "./types.ts";

const PDF_MIME = "application/pdf";
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function parseCv(
  file: Uint8Array,
  mime: string,
  filename: string,
): Promise<CvSignals> {
  if (mime !== PDF_MIME && mime !== DOCX_MIME) {
    throw new Error("UNSUPPORTED_FILE_TYPE");
  }

  const format = mime === PDF_MIME ? "pdf" : "docx";

  // ---------------------------------------------------------------------------
  // 1. Raw text extraction
  // ---------------------------------------------------------------------------
  let rawText: string;
  try {
    rawText = format === "pdf"
      ? await extractPdfText(file)
      : await extractDocxText(file);
  } catch (err) {
    return {
      filename,
      format,
      extracted_text_chars: 0,
      parse_status: "failed",
      error_reason: err instanceof Error ? err.message : "UNKNOWN",
    };
  }

  const normalised = rawText.normalize("NFKC").trim();

  // Detect scanned-only PDF (extracted < 200 chars from a multi-page file)
  if (normalised.length < 200) {
    return {
      filename,
      format,
      extracted_text_chars: normalised.length,
      parse_status: "failed",
      error_reason: "INSUFFICIENT_TEXT (possibly scanned PDF — OCR is v2.5)",
    };
  }

  // ---------------------------------------------------------------------------
  // 2. Heuristic regex extraction (cheap, no AI)
  // ---------------------------------------------------------------------------
  // TODO: implement extractDateRanges, extractSections, extractEmails, extractSkills
  //       Helper signatures below.
  const dateRanges = extractDateRanges(normalised);
  const sectionMap = extractSections(normalised);

  // ---------------------------------------------------------------------------
  // 3. Claude Haiku post-processing (cheap structured output)
  // ---------------------------------------------------------------------------
  // TODO: call services/llm-router.ts with complexity = "simple",
  //       feed normalised text + section hints, request JSON output.
  //       Validate output against Zod schema for CvSignals.
  const structured = await structureWithHaiku(normalised, sectionMap);

  // ---------------------------------------------------------------------------
  // 4. Compute experience_years_total from role durations
  // ---------------------------------------------------------------------------
  const experience_years_total = (structured.roles ?? []).reduce((sum, r) => {
    return sum + (r.duration_months ?? 0) / 12;
  }, 0);

  return {
    filename,
    format,
    extracted_text_chars: normalised.length,
    experience_years_total,
    roles: structured.roles,
    tech_skills: structured.tech_skills,
    education: structured.education,
    languages: structured.languages,
    parse_status: dateRanges.length > 0 && (structured.roles?.length ?? 0) > 0 ? "complete" : "partial",
  };
}

// ---------------------------------------------------------------------------
// Format-specific extraction
// ---------------------------------------------------------------------------

async function extractPdfText(_file: Uint8Array): Promise<string> {
  // TODO: import('npm:pdfjs-dist') and walk pages, joining text items
  //       with spacing inferred from x-coordinates (so two-column layouts
  //       don't completely scramble).
  throw new Error("NOT_IMPLEMENTED: extractPdfText");
}

async function extractDocxText(_file: Uint8Array): Promise<string> {
  // TODO: import('npm:mammoth') and call extractRawText({ buffer })
  throw new Error("NOT_IMPLEMENTED: extractDocxText");
}

// ---------------------------------------------------------------------------
// Heuristic helpers
// ---------------------------------------------------------------------------

/**
 * Find date-range strings like "Jan 2020 – Present" or "2018-03 – 2021-09".
 * Returns array of { start, end } ISO YYYY-MM strings (end may be null = current).
 */
export function extractDateRanges(_text: string): { start: string; end: string | null }[] {
  // TODO: regex covering multiple locales — UZ, RU, JA, EN month names
  return [];
}

/**
 * Split CV into sections keyed by heading: experience, education, skills, languages.
 */
export function extractSections(_text: string): Record<string, string> {
  // TODO: regex headers: "Experience|Tajriba|職歴|经验" etc.
  return {};
}

// ---------------------------------------------------------------------------
// Claude Haiku structuring
// ---------------------------------------------------------------------------

type StructuredCv = {
  roles?: CvRole[];
  tech_skills?: string[];
  education?: { degree: string; institution: string; year: number | null }[];
  languages?: string[];
};

async function structureWithHaiku(
  _text: string,
  _sections: Record<string, string>,
): Promise<StructuredCv> {
  // TODO: prompt template (see prompts.ts → CV_STRUCTURE_PROMPT)
  //       call llm-router.callClaude({ complexity: "simple", systemPrompt, message })
  //       parse JSON, validate with Zod, return.
  return {};
}
