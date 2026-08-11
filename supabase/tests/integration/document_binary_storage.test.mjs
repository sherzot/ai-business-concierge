import assert from "node:assert/strict";

const apiUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const publishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
const secretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const serviceRoleToken =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

assert.ok(apiUrl, "SUPABASE_URL talab qilinadi");
assert.ok(publishableKey, "SUPABASE_PUBLISHABLE_KEY talab qilinadi");
assert.ok(secretKey, "SUPABASE_SECRET_KEY talab qilinadi");
assert.ok(serviceRoleToken, "SUPABASE_SERVICE_ROLE_KEY talab qilinadi");

const runId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
const tenantA = `doc-acceptance-a-${runId}`;
const tenantB = `doc-acceptance-b-${runId}`;
const templateSlug = `doc-acceptance-${runId}`;
const password = `Document-${crypto.randomUUID()}-Aa1!`;
const edgeBase = `${apiUrl}/functions/v1/bright-api/make-server-6c2837d6/v1`;
const createdUsers = [];
const storagePaths = new Set();
let documentId = null;

const serviceHeaders = {
  apikey: secretKey,
  "Content-Type": "application/json",
};

if (serviceRoleToken.split(".").length === 3) {
  serviceHeaders.Authorization = `Bearer ${serviceRoleToken}`;
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

async function request(url, options = {}) {
  const response = await fetch(url, options);
  return { response, body: await readBody(response) };
}

async function insertRows(table, rows) {
  const result = await request(`${apiUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...serviceHeaders, Prefer: "return=representation" },
    body: JSON.stringify(rows),
  });
  assert.ok(
    result.response.ok,
    `${table} fixture yozilmadi: ${JSON.stringify(result.body)}`,
  );
  return result.body;
}

async function deleteRows(table, filter) {
  await fetch(`${apiUrl}/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers: serviceHeaders,
  });
}

async function createUser(label) {
  const email = `document-${label}-${runId}@example.test`;
  const result = await request(`${apiUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: serviceHeaders,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  assert.equal(result.response.status, 200, JSON.stringify(result.body));
  createdUsers.push(result.body.id);
  return { id: result.body.id, email };
}

async function signIn(email) {
  const result = await request(
    `${apiUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    },
  );
  assert.equal(result.response.status, 200, JSON.stringify(result.body));
  return result.body.access_token;
}

async function edgeRequest(token, tenantId, path, options = {}) {
  return request(`${edgeBase}${path}`, {
    ...options,
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token}`,
      "X-Tenant-Id": tenantId,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

async function generatedMetadata(id) {
  const result = await request(
    `${apiUrl}/rest/v1/doc_generated?document_id=eq.${encodeURIComponent(id)}&select=*`,
    { headers: serviceHeaders },
  );
  assert.equal(result.response.status, 200, JSON.stringify(result.body));
  assert.equal(result.body.length, 1, "doc_generated row bitta bo'lishi kerak");
  storagePaths.add(result.body[0].storage_path);
  return result.body[0];
}

async function removeStoragePath(path) {
  if (!path) return;
  await fetch(`${apiUrl}/storage/v1/object/generated-documents`, {
    method: "DELETE",
    headers: serviceHeaders,
    body: JSON.stringify({ prefixes: [path] }),
  });
}

try {
  const userA = await createUser("a");
  const userB = await createUser("b");

  await insertRows("tenants", [
    { id: tenantA, name: "Document Acceptance A", plan: "Pro", status: "active" },
    { id: tenantB, name: "Document Acceptance B", plan: "Pro", status: "active" },
  ]);
  await insertRows("user_tenants", [
    {
      user_id: userA.id,
      tenant_id: tenantA,
      role: "employee",
      full_name: "Document User A",
      status: "active",
    },
    {
      user_id: userB.id,
      tenant_id: tenantB,
      role: "employee",
      full_name: "Document User B",
      status: "active",
    },
  ]);
  await insertRows("doc_templates", [{
    slug: templateSlug,
    category: "boshqa",
    title_uz: "To'rt tilli hujjat",
    title_ru: "Документ на четырёх языках",
    title_en: "Four-language document",
    title_ja: "四言語文書",
    fields: [{
      name: "company",
      label_uz: "Kompaniya",
      label_ru: "Компания",
      label_en: "Company",
      label_ja: "会社",
      type: "text",
      required: true,
    }],
    template_uz: "Kompaniya: {{company}}",
    template_ru: "Компания: {{company}}",
    template_en: "Company: {{company}}",
    template_ja: "会社: {{company}}\n日本語の契約文書です。",
    is_active: true,
  }]);

  const [tokenA, tokenB] = await Promise.all([
    signIn(userA.email),
    signIn(userB.email),
  ]);

  const generated = await edgeRequest(tokenA, tenantA, "/docs/generate", {
    method: "POST",
    body: JSON.stringify({
      template_slug: templateSlug,
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
  documentId = generated.body.data.document_id;

  const docxDownload = await fetch(generated.body.data.download_url);
  assert.equal(docxDownload.status, 200);
  const docxBytes = new Uint8Array(await docxDownload.arrayBuffer());
  assert.deepEqual(Array.from(docxBytes.slice(0, 2)), [0x50, 0x4b]);
  console.log(`ok - DOCX generated/downloaded: ${docxBytes.length} bytes`);

  const firstMetadata = await generatedMetadata(documentId);
  assert.equal(firstMetadata.storage_bucket, "generated-documents");
  assert.match(
    firstMetadata.storage_path,
    new RegExp(
      `^${tenantA}/${userA.id}/documents/${documentId}/document-[0-9a-f-]{36}\\.docx$`,
    ),
  );

  const directDownload = await fetch(
    `${apiUrl}/storage/v1/object/authenticated/generated-documents/${firstMetadata.storage_path}`,
    {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${tokenA}`,
      },
    },
  );
  assert.ok(
    directDownload.status === 400 || directDownload.status === 403,
    `direct authenticated Storage access kutilmaganda ${directDownload.status}`,
  );
  console.log(`ok - direct authenticated Storage denied: HTTP ${directDownload.status}`);

  const crossTenant = await edgeRequest(tokenB, tenantB, `/docs/${documentId}/export`, {
    method: "POST",
    body: JSON.stringify({ format: "pdf", locale: "en" }),
  });
  assert.equal(crossTenant.response.status, 404, JSON.stringify(crossTenant.body));
  console.log("ok - cross-tenant export denied: HTTP 404");

  const updated = await edgeRequest(tokenA, tenantA, `/docs/${documentId}`, {
    method: "PATCH",
    body: JSON.stringify({
      title: "Yangilangan to'rt tilli hujjat",
      content: "O'zbekcha\nРусский\nEnglish\n日本語",
    }),
  });
  assert.equal(updated.response.status, 200, JSON.stringify(updated.body));

  const exported = await edgeRequest(tokenA, tenantA, `/docs/${documentId}/export`, {
    method: "POST",
    body: JSON.stringify({ format: "pdf", locale: "uz" }),
  });
  assert.equal(exported.response.status, 200, JSON.stringify(exported.body));
  assert.equal(exported.body.data.format, "pdf");
  const pdfDownload = await fetch(exported.body.data.download_url);
  assert.equal(pdfDownload.status, 200);
  const pdfBytes = new Uint8Array(await pdfDownload.arrayBuffer());
  assert.equal(new TextDecoder().decode(pdfBytes.slice(0, 5)), "%PDF-");
  console.log(`ok - edited PDF regenerated/downloaded: ${pdfBytes.length} bytes`);

  const secondMetadata = await generatedMetadata(documentId);
  assert.match(
    secondMetadata.storage_path,
    new RegExp(
      `^${tenantA}/${userA.id}/documents/${documentId}/document-[0-9a-f-]{36}\\.pdf$`,
    ),
  );

  const exportedAgain = await edgeRequest(
    tokenA,
    tenantA,
    `/docs/${documentId}/export`,
    {
      method: "POST",
      body: JSON.stringify({ format: "pdf", locale: "uz" }),
    },
  );
  assert.equal(
    exportedAgain.response.status,
    200,
    JSON.stringify(exportedAgain.body),
  );
  const thirdMetadata = await generatedMetadata(documentId);
  assert.notEqual(
    thirdMetadata.storage_path,
    secondMetadata.storage_path,
    "same-format re-export immutable yangi object yaratishi kerak",
  );
  assert.equal(thirdMetadata.storage_version, thirdMetadata.storage_path.match(
    /document-([0-9a-f-]{36})\.pdf$/,
  )?.[1]);

  const retainedPreviousExport = await fetch(exported.body.data.download_url);
  assert.equal(retainedPreviousExport.status, 200);
  assert.equal(
    new TextDecoder().decode(
      new Uint8Array(await retainedPreviousExport.arrayBuffer()).slice(0, 5),
    ),
    "%PDF-",
  );
  console.log("ok - same-format re-export retained previous signed URL");

  const deleted = await edgeRequest(tokenA, tenantA, `/docs/${documentId}`, {
    method: "DELETE",
  });
  assert.equal(deleted.response.status, 200, JSON.stringify(deleted.body));

  const removedDeletedExport = await fetch(exportedAgain.body.data.download_url);
  assert.ok(
    removedDeletedExport.status === 400 || removedDeletedExport.status === 404,
    `deleted document object kutilmaganda ${removedDeletedExport.status}`,
  );
  const removedRetainedExport = await fetch(exported.body.data.download_url);
  assert.ok(
    removedRetainedExport.status === 400 || removedRetainedExport.status === 404,
    `retained document object kutilmaganda ${removedRetainedExport.status}`,
  );

  const [documentRows, generatedRows] = await Promise.all([
    request(`${apiUrl}/rest/v1/documents?id=eq.${encodeURIComponent(documentId)}&select=id`, {
      headers: serviceHeaders,
    }),
    request(`${apiUrl}/rest/v1/doc_generated?document_id=eq.${encodeURIComponent(documentId)}&select=id`, {
      headers: serviceHeaders,
    }),
  ]);
  assert.equal(documentRows.response.status, 200, JSON.stringify(documentRows.body));
  assert.equal(generatedRows.response.status, 200, JSON.stringify(generatedRows.body));
  assert.deepEqual(documentRows.body, []);
  assert.deepEqual(generatedRows.body, []);
  documentId = null;
  console.log("ok - document row and private object deleted");
} finally {
  if (documentId) {
    for (const path of storagePaths) await removeStoragePath(path);
    await deleteRows("documents", `id=eq.${encodeURIComponent(documentId)}`);
  }
  await deleteRows("doc_templates", `slug=eq.${encodeURIComponent(templateSlug)}`);
  await deleteRows("tenants", `id=in.(${encodeURIComponent(tenantA)},${encodeURIComponent(tenantB)})`);
  for (const userId of createdUsers) {
    await fetch(`${apiUrl}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: serviceHeaders,
    });
  }
}
