import { readdir, readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const frontendDir = resolve(import.meta.dirname, "..");
const repoDir = resolve(frontendDir, "..");
const distDir = join(frontendDir, "dist");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const netlifyConfig = await readFile(join(repoDir, "netlify.toml"), "utf8");
const indexHtml = await readFile(join(distDir, "index.html"), "utf8");
const docDetailSource = await readFile(
  join(frontendDir, "src/features/docs/components/DocDetail.tsx"),
  "utf8",
);
const sourceFiles = (await walk(join(frontendDir, "src"))).filter((file) =>
  [".ts", ".tsx"].includes(extname(file)),
);
const sourceEntries = await Promise.all(
  sourceFiles.map(async (file) => ({ file, text: await readFile(file, "utf8") })),
);
const sourceText = sourceEntries.map(({ text }) => text).join("\n");
const distFiles = await walk(distDir);
const textFiles = distFiles.filter((file) =>
  [".html", ".js", ".css", ".json", ".webmanifest"].includes(extname(file)),
);
const bundleText = (
  await Promise.all(textFiles.map((file) => readFile(file, "utf8")))
).join("\n");

assert(
  netlifyConfig.includes("SECRETS_SCAN_SMART_DETECTION_ENABLED = \"true\""),
  "Netlify smart secret scanning yoqilmagan.",
);
assert(
  netlifyConfig.includes("script-src 'self';"),
  "CSP script-src faqat same-origin bo'lishi kerak.",
);
assert(
  !netlifyConfig.includes("script-src 'self' 'unsafe-inline'"),
  "CSP inline scriptlarga ruxsat bermasligi kerak.",
);
assert(
  netlifyConfig.includes("object-src 'none'") &&
    netlifyConfig.includes("frame-ancestors 'none'"),
  "CSP object/frame himoyasi to'liq emas.",
);
assert(
  netlifyConfig.includes("Cache-Control = \"public, max-age=31536000, immutable\""),
  "Hashlangan assetlar uchun immutable cache sozlanmagan.",
);
assert(
  !netlifyConfig.includes("aibizconcierge.uz"),
  "Egalik qilinmaydigan domen Netlify konfiguratsiyasida qolgan.",
);
assert(
  indexHtml.includes("https://ai-business-concierge1.netlify.app/"),
  "Canonical URL production Netlify domeniga mos emas.",
);
assert(
  !/<script(?![^>]*\bsrc=)[^>]*>/i.test(indexHtml),
  "Build index.html ichida inline script bor.",
);
assert(
  !docDetailSource.includes("<script>"),
  "Print oynasi shablonida runtime inline script bor.",
);
assert(
  !bundleText.includes("api-cache"),
  "Authenticated API javoblari service worker cache'iga tushmasligi kerak.",
);
assert(
  !distFiles.some((file) => file.endsWith(".map")),
  "Production build source map chiqarmasligi kerak.",
);

const directBusinessDataCalls = sourceEntries.filter(({ text }) =>
  /\bsupabase\.(?:from|rpc|storage|functions)\b/.test(text),
);
assert(
  directBusinessDataCalls.length === 0,
  "Frontend business-data Supabase chaqiruvlari bright-api chegarasini chetlab o'tmoqda.",
);

const hardcodedSupabaseCredential =
  /\bsb_(?:publishable|secret)_[A-Za-z0-9_-]{20,}\b/;
const hardcodedJwt =
  /\beyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/;
assert(
  !hardcodedSupabaseCredential.test(sourceText) && !hardcodedJwt.test(sourceText),
  "Frontend source ichida hardcoded Supabase credential topildi.",
);

const forbiddenServerSecrets = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SB_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "TELEGRAM_BOT_TOKEN",
  "DATABASE_URL",
  "JWT_SIGNING_SECRET",
];
for (const secretName of forbiddenServerSecrets) {
  assert(
    !bundleText.includes(secretName),
    `Server-only secret identifikatori bundle ichida topildi: ${secretName}`,
  );
}

console.log(
  `Security gate passed: ${distFiles.length} build fayli va Netlify konfiguratsiyasi tekshirildi.`,
);
