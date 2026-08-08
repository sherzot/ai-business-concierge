import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const status = JSON.parse(
  execFileSync("supabase", ["status", "-o", "json"], {
    cwd: new URL("../../..", import.meta.url),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }),
);

const apiUrl = status.API_URL;
const publishableKey = status.PUBLISHABLE_KEY ?? status.ANON_KEY;
const secretKey = status.SECRET_KEY ?? status.SERVICE_ROLE_KEY;
const serviceRoleToken = status.SERVICE_ROLE_KEY ?? status.SECRET_KEY;

assert.ok(apiUrl, "Local Supabase API URL topilmadi");
assert.ok(publishableKey, "Local publishable/anon key topilmadi");
assert.ok(secretKey, "Local secret/service-role key topilmadi");
assert.ok(serviceRoleToken, "Local service-role token topilmadi");

const runId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
const password = `Acceptance-${crypto.randomUUID()}-Aa1!`;
const tenantA = `acceptance-a-${runId}`;
const tenantB = `acceptance-b-${runId}`;
const edgeBase =
  `${apiUrl}/functions/v1/bright-api/make-server-6c2837d6/v1`;
const createdUsers = [];

const serviceHeaders = {
  apikey: secretKey,
  Authorization: `Bearer ${serviceRoleToken}`,
  "Content-Type": "application/json",
};

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

async function createUser(label) {
  const email = `acceptance-${label}-${runId}@example.test`;
  const { response, body } = await request(`${apiUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: serviceHeaders,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  assert.equal(response.status, 200, `Auth user yaratilmadi: ${JSON.stringify(body)}`);
  createdUsers.push(body.id);
  return { id: body.id, email };
}

async function signIn(email) {
  const { response, body } = await request(
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
  assert.equal(response.status, 200, `Token olinmadi: ${JSON.stringify(body)}`);
  assert.ok(body.access_token, "Auth javobida access_token yo'q");
  return body.access_token;
}

async function insertRows(table, rows) {
  const { response, body } = await request(`${apiUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...serviceHeaders, Prefer: "return=minimal" },
    body: JSON.stringify(rows),
  });
  assert.ok(
    response.status === 201 || response.status === 204,
    `${table} fixture yozilmadi: ${JSON.stringify(body)}`,
  );
}

async function edgeRequest(token, tenantId, path, options = {}) {
  return request(`${edgeBase}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Tenant-Id": tenantId,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

function errorCode(body) {
  return body?.meta?.errors?.[0]?.code ?? body?.error?.code ?? body?.code;
}

function expectStatus(name, result, expectedStatus, expectedCode) {
  assert.equal(
    result.response.status,
    expectedStatus,
    `${name}: ${JSON.stringify(result.body)}`,
  );
  if (expectedCode) {
    assert.equal(errorCode(result.body), expectedCode, `${name}: xato kodi`);
  }
  console.log(`ok - ${name}: HTTP ${expectedStatus}${expectedCode ? ` ${expectedCode}` : ""}`);
}

try {
  const activeEmployee = await createUser("active-employee");
  const blockedEmployee = await createUser("blocked-employee");
  const terminatedEmployee = await createUser("terminated-employee");
  const superAdmin = await createUser("super-admin");
  const blockedAdmin = await createUser("blocked-admin");

  await insertRows("tenants", [
    { id: tenantA, name: "Acceptance Tenant A", plan: "Pro", status: "active" },
    { id: tenantB, name: "Acceptance Tenant B", plan: "Pro", status: "active" },
  ]);
  await insertRows("user_tenants", [
    {
      user_id: activeEmployee.id,
      tenant_id: tenantA,
      role: "employee",
      full_name: "Active Employee",
      status: "active",
    },
    {
      user_id: blockedEmployee.id,
      tenant_id: tenantA,
      role: "employee",
      full_name: "Blocked Employee",
      status: "blocked",
    },
    {
      user_id: terminatedEmployee.id,
      tenant_id: tenantA,
      role: "employee",
      full_name: "Terminated Employee",
      status: "terminated",
    },
    {
      user_id: superAdmin.id,
      tenant_id: tenantA,
      role: "super_admin",
      full_name: "Active Super Admin",
      status: "active",
    },
    {
      user_id: blockedAdmin.id,
      tenant_id: tenantA,
      role: "sub_admin",
      full_name: "Blocked Sub Admin",
      status: "blocked",
    },
  ]);

  const [activeToken, blockedToken, terminatedToken, superToken, blockedAdminToken] =
    await Promise.all([
      signIn(activeEmployee.email),
      signIn(blockedEmployee.email),
      signIn(terminatedEmployee.email),
      signIn(superAdmin.email),
      signIn(blockedAdmin.email),
    ]);

  expectStatus(
    "active member own tenant",
    await edgeRequest(activeToken, tenantA, "/tasks"),
    200,
  );
  expectStatus(
    "active member cross-tenant denied",
    await edgeRequest(activeToken, tenantB, "/tasks"),
    401,
    "TENANT_REQUIRED",
  );
  expectStatus(
    "blocked member denied",
    await edgeRequest(blockedToken, tenantA, "/tasks"),
    401,
    "TENANT_REQUIRED",
  );
  expectStatus(
    "terminated member denied",
    await edgeRequest(terminatedToken, tenantA, "/tasks"),
    401,
    "TENANT_REQUIRED",
  );
  expectStatus(
    "super-admin cross-tenant allowed",
    await edgeRequest(superToken, tenantB, "/tasks"),
    200,
  );
  expectStatus(
    "active super-admin admin route",
    await edgeRequest(superToken, tenantA, "/admin/companies"),
    200,
  );
  expectStatus(
    "blocked admin denied",
    await edgeRequest(blockedAdminToken, tenantA, "/admin/companies"),
    403,
    "FORBIDDEN",
  );
  expectStatus(
    "employee role denied",
    await edgeRequest(activeToken, tenantA, `/tenants/${tenantA}/members`, {
      method: "POST",
      body: "{}",
    }),
    403,
    "FORBIDDEN_ROLE",
  );

  console.log("Edge tenant authorization acceptance: PASS (8/8)");
} finally {
  await request(
    `${apiUrl}/rest/v1/tenants?id=in.(${encodeURIComponent(tenantA)},${encodeURIComponent(tenantB)})`,
    { method: "DELETE", headers: serviceHeaders },
  ).catch(() => {});

  await Promise.all(
    createdUsers.map((userId) =>
      request(`${apiUrl}/auth/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: serviceHeaders,
      }).catch(() => {}),
    ),
  );
}
