import assert from "node:assert/strict";

const payload = readPayload(process.argv[2]);
const edgeBase = `${payload.apiUrl}/functions/v1/bright-api/make-server-6c2837d6/v1`;

assert.match(payload.tenantA, /^doc-acceptance-a-/);
assert.match(payload.tenantB, /^doc-acceptance-b-/);
assert.match(payload.emailA, /@example\.test$/);
assert.match(payload.emailB, /@example\.test$/);

function readPayload(encodedPayload) {
  assert.ok(encodedPayload, "Base64 acceptance payload talab qilinadi");

  const value = JSON.parse(Buffer.from(encodedPayload, "base64").toString("utf8"));
  for (const field of [
    "action",
    "apiUrl",
    "publishableKey",
    "password",
    "emailA",
    "emailB",
    "tenantA",
    "tenantB",
    "templateSlug",
  ]) {
    assert.equal(typeof value[field], "string", `${field} string bo'lishi kerak`);
    assert.ok(value[field], `${field} bo'sh bo'lmasligi kerak`);
  }

  value.apiUrl = value.apiUrl.replace(/\/$/, "");
  return value;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 120_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function readBody(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(url, options = {}, timeoutMs) {
  const response = await fetchWithTimeout(url, options, timeoutMs);
  return { response, body: await readBody(response) };
}

async function signIn(email) {
  const result = await request(
    `${payload.apiUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: payload.publishableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password: payload.password }),
    },
    30_000,
  );

  assert.equal(result.response.status, 200, JSON.stringify(result.body));
  assert.equal(typeof result.body?.access_token, "string");
  return result.body.access_token;
}

async function edgeRequest(token, tenantId, path, options = {}) {
  return request(`${edgeBase}${path}`, {
    ...options,
    headers: {
      apikey: payload.publishableKey,
      Authorization: `Bearer ${token}`,
      "X-Tenant-Id": tenantId,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

function assertDocumentId(documentId) {
  assert.match(
    documentId,
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
}

async function generateDocument() {
  const token = await signIn(payload.emailA);
  const generated = await edgeRequest(token, payload.tenantA, "/docs/generate", {
    method: "POST",
    body: JSON.stringify({
      template_slug: payload.templateSlug,
      locale: "ja",
      format: "docx",
      fields_data: { company: "株式会社ABC / ACME" },
    }),
  });

  assert.equal(generated.response.status, 200, JSON.stringify(generated.body));
  assert.equal(generated.body.data.file_ready, true);
  assert.equal(generated.body.data.format, "docx");
  assert.equal(generated.body.data.download_expires_in, 60);
  assert.match(generated.body.data.sha256, /^[0-9a-f]{64}$/);
  assertDocumentId(generated.body.data.document_id);

  const download = await fetchWithTimeout(generated.body.data.download_url, {}, 30_000);
  assert.equal(download.status, 200);
  const bytes = new Uint8Array(await download.arrayBuffer());
  assert.deepEqual(Array.from(bytes.slice(0, 2)), [0x50, 0x4b]);

  return {
    documentId: generated.body.data.document_id,
    docxBytes: bytes.length,
  };
}

async function acceptDocument() {
  assertDocumentId(payload.documentId);
  assert.equal(typeof payload.storagePath, "string");
  assert.ok(
    payload.storagePath.startsWith(
      `${payload.tenantA}/${payload.userA}/documents/${payload.documentId}/`,
    ),
  );

  const [tokenA, tokenB] = await Promise.all([
    signIn(payload.emailA),
    signIn(payload.emailB),
  ]);

  const directDownload = await fetchWithTimeout(
    `${payload.apiUrl}/storage/v1/object/authenticated/generated-documents/${payload.storagePath}`,
    {
      headers: {
        apikey: payload.publishableKey,
        Authorization: `Bearer ${tokenA}`,
      },
    },
    30_000,
  );
  assert.ok([400, 403].includes(directDownload.status));

  const crossTenant = await edgeRequest(
    tokenB,
    payload.tenantB,
    `/docs/${payload.documentId}/export`,
    {
      method: "POST",
      body: JSON.stringify({ format: "pdf", locale: "en" }),
    },
  );
  assert.equal(crossTenant.response.status, 404, JSON.stringify(crossTenant.body));

  const updated = await edgeRequest(
    tokenA,
    payload.tenantA,
    `/docs/${payload.documentId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        title: "Yangilangan to'rt tilli hujjat",
        content: "O'zbekcha\nРусский\nEnglish\n日本語",
      }),
    },
  );
  assert.equal(updated.response.status, 200, JSON.stringify(updated.body));

  const exported = await edgeRequest(
    tokenA,
    payload.tenantA,
    `/docs/${payload.documentId}/export`,
    {
      method: "POST",
      body: JSON.stringify({ format: "pdf", locale: "uz" }),
    },
  );
  assert.equal(exported.response.status, 200, JSON.stringify(exported.body));
  assert.equal(exported.body.data.format, "pdf");

  const pdfDownload = await fetchWithTimeout(exported.body.data.download_url, {}, 30_000);
  assert.equal(pdfDownload.status, 200);
  const pdfBytes = new Uint8Array(await pdfDownload.arrayBuffer());
  assert.equal(new TextDecoder().decode(pdfBytes.slice(0, 5)), "%PDF-");

  const deleted = await edgeRequest(
    tokenA,
    payload.tenantA,
    `/docs/${payload.documentId}`,
    { method: "DELETE" },
  );
  assert.equal(deleted.response.status, 200, JSON.stringify(deleted.body));

  const cachedDeletedObject = await fetchWithTimeout(
    exported.body.data.download_url,
    {},
    30_000,
  );
  // Supabase Smart CDN invalidation can propagate for up to 60 seconds.
  // The orchestrator verifies authoritative DB and storage.objects residue.

  return {
    directStorageStatus: directDownload.status,
    crossTenantStatus: crossTenant.response.status,
    pdfBytes: pdfBytes.length,
    deleteStatus: deleted.response.status,
    cachedDeletedObjectStatus: cachedDeletedObject.status,
  };
}

async function cleanupDocument() {
  assertDocumentId(payload.documentId);
  const token = await signIn(payload.emailA);
  const deleted = await edgeRequest(
    token,
    payload.tenantA,
    `/docs/${payload.documentId}`,
    { method: "DELETE" },
  );

  return { cleanupDeleteStatus: deleted.response.status };
}

const actions = {
  generate: generateDocument,
  accept: acceptDocument,
  cleanup: cleanupDocument,
};

assert.ok(actions[payload.action], `Noma'lum action: ${payload.action}`);
console.log(JSON.stringify(await actions[payload.action]()));
