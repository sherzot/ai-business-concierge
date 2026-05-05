/**
 * Tenant middleware — X-Tenant-Id header tekshiruvi va tenant context
 * authMiddleware dan KEYIN ishlatilishi kerak.
 *
 * Ishlatish:
 *   router.get("/endpoint", authMiddleware, tenantMiddleware, async (c) => {
 *     const tenantId = c.var.tenantId;
 *   });
 */

import type { Context, Next } from "npm:hono";

export async function tenantMiddleware(c: Context, next: Next) {
  const tenantId = c.req.header("X-Tenant-Id");
  if (!tenantId) {
    return c.json({ error: { code: "MISSING_TENANT", message: "X-Tenant-Id header kerak" } }, 400);
  }

  c.set("tenantId", tenantId);
  await next();
}
