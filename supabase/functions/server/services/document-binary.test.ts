import {
  documentDownloadLeaseExpiresAt,
  documentMimeType,
  documentStoragePath,
  generateAndStoreDocumentBinary,
  generateDocumentBinary,
  isDocumentDownloadLeaseActive,
  safeDownloadName,
  sha256Hex,
} from "./document-binary.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function writePreview(name: string, bytes: Uint8Array) {
  const outputDir = Deno.env.get("DOCUMENT_TEST_OUTPUT_DIR");
  if (!outputDir) return;
  await Deno.mkdir(outputDir, { recursive: true });
  await Deno.writeFile(`${outputDir}/${name}`, bytes);
}

Deno.test("private document path tenant/user/resource contractini saqlaydi", () => {
  const path = documentStoragePath({
    tenantId: "tenant-a",
    userId: "11111111-1111-4111-8111-111111111111",
    documentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    storageVersion: "22222222-2222-4222-8222-222222222222",
    format: "pdf",
  });

  assert(
    path ===
      "tenant-a/11111111-1111-4111-8111-111111111111/documents/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/document-22222222-2222-4222-8222-222222222222.pdf",
    `unexpected path: ${path}`,
  );
});

Deno.test("download nomi xavfli path belgilarini olib tashlaydi", () => {
  const name = safeDownloadName("  Shartnoma / 契約書: 2026  ", "docx");
  assert(name === "Shartnoma - 契約書- 2026.docx", `unexpected name: ${name}`);
});

Deno.test("document export lease signed URL muddatidan keyin tugaydi", () => {
  const now = new Date("2026-08-12T00:00:00.000Z");
  const expiresAt = documentDownloadLeaseExpiresAt(now);
  assert(
    expiresAt === "2026-08-12T00:01:05.000Z",
    `unexpected export lease deadline: ${expiresAt}`,
  );
  assert(
    isDocumentDownloadLeaseActive(expiresAt, now),
    "yangi export lease faol bo'lishi kerak",
  );
  assert(
    !isDocumentDownloadLeaseActive(
      expiresAt,
      new Date("2026-08-12T00:01:05.000Z"),
    ),
    "deadline yetganda export lease tugashi kerak",
  );
});

const fontPath = Deno.env.get("DOCUMENT_TEST_FONT_PATH");
Deno.test({
  name: "DOCX embedded Noto Sans bilan haqiqiy ZIP binary yaratadi",
  ignore: !fontPath,
  fn: async () => {
    const generated = await generateDocumentBinary({
      title: "Mehnat shartnomasi",
      content: "O'zbekcha matn\nРусский текст\nEnglish text\n日本語の文書",
      locale: "ja",
      format: "docx",
      supabase: null,
      documentFontBytes: await Deno.readFile(fontPath!),
    });

    assert(
      generated.mimeType === documentMimeType("docx"),
      "DOCX MIME noto'g'ri",
    );
    assert(
      generated.bytes[0] === 0x50 && generated.bytes[1] === 0x4b,
      "DOCX ZIP magic yo'q",
    );
    assert(
      generated.sha256 === await sha256Hex(generated.bytes),
      "DOCX checksum noto'g'ri",
    );
    await writePreview("ai-hujjatchi-four-languages.docx", generated.bytes);
  },
});

Deno.test({
  name: "PDF Noto Sans bilan to'rt tildagi haqiqiy binary yaratadi",
  ignore: !fontPath,
  fn: async () => {
    const generated = await generateDocumentBinary({
      title: "To'rt tilli hujjat — 四言語文書",
      content: "O'zbekcha matn\nРусский текст\nEnglish text\n日本語の文書",
      locale: "ja",
      format: "pdf",
      supabase: null,
      documentFontBytes: await Deno.readFile(fontPath!),
    });

    const magic = new TextDecoder().decode(generated.bytes.slice(0, 5));
    assert(magic === "%PDF-", `PDF magic noto'g'ri: ${magic}`);
    assert(
      generated.mimeType === documentMimeType("pdf"),
      "PDF MIME noto'g'ri",
    );
    assert(
      generated.sha256 === await sha256Hex(generated.bytes),
      "PDF checksum noto'g'ri",
    );
    await writePreview("ai-hujjatchi-four-languages.pdf", generated.bytes);
  },
});

Deno.test({
  name: "bir xil format re-export faol objectni overwrite qilmaydi",
  ignore: !fontPath,
  fn: async () => {
    const uploads: Array<{ path: string; upsert: boolean }> = [];
    const supabase = {
      storage: {
        from: () => ({
          upload: (
            path: string,
            _bytes: Uint8Array,
            options: { upsert: boolean },
          ) => {
            uploads.push({ path, upsert: options.upsert });
            return Promise.resolve({ error: null });
          },
        }),
      },
    };
    const input = {
      tenantId: "tenant-a",
      userId: "11111111-1111-4111-8111-111111111111",
      documentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      title: "Shartnoma",
      content: "O'zbekcha\nРусский\nEnglish\n日本語",
      locale: "ja" as const,
      format: "pdf" as const,
      supabase,
      documentFontBytes: await Deno.readFile(fontPath!),
    };

    const first = await generateAndStoreDocumentBinary(input);
    const second = await generateAndStoreDocumentBinary(input);

    assert(
      first.storagePath !== second.storagePath,
      "object path versionlanmadi",
    );
    assert(
      first.storageVersion !== second.storageVersion,
      "storage version takrorlandi",
    );
    assert(uploads.length === 2, "ikkita upload kutilgan");
    assert(
      uploads.every((upload) => !upload.upsert),
      "upload overwrite qilmasligi kerak",
    );
  },
});
