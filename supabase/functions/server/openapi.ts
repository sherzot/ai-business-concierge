/**
 * OpenAPI 3.1 specification for AI Business Concierge API
 * B-013: Accessible at GET /v1/docs/api (JSON) and GET /v1/docs (Scalar HTML UI)
 */

export const OPENAPI_SPEC = {
  openapi: "3.1.0",
  info: {
    title: "AI Business Concierge API",
    version: "1.1.0",
    description:
      "Multi-tenant SaaS API for daily business operations in Uzbekistan. " +
      "Includes AI chat, document generation, task management, inbox, HR, knowledge base, audit log, and analytics.",
    contact: {
      name: "AI Business Concierge",
      url: "https://ai-business-concierge1.netlify.app",
    },
  },
  servers: [
    {
      url: "https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1",
      description: "Production (Supabase Edge Functions)",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Supabase JWT token from `auth.getSession()`",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code:    { type: "string", example: "NOT_FOUND" },
              message: { type: "string", example: "Resource not found" },
            },
          },
        },
      },
      Task: {
        type: "object",
        properties: {
          id:         { type: "string", format: "uuid" },
          tenant_id:  { type: "string" },
          title:      { type: "string" },
          status:     { type: "string", enum: ["todo", "in_progress", "done"] },
          priority:   { type: "string", enum: ["low", "medium", "high"] },
          assignee:   { type: "string", nullable: true },
          due_date:   { type: "string", format: "date-time", nullable: true },
          created_at: { type: "string", format: "date-time" },
          deleted_at: { type: "string", format: "date-time", nullable: true },
        },
      },
      InboxItem: {
        type: "object",
        properties: {
          id:       { type: "string", format: "uuid" },
          tenant_id:{ type: "string" },
          source:   { type: "string", enum: ["telegram", "email", "web"] },
          sender:   { type: "string" },
          subject:  { type: "string" },
          preview:  { type: "string" },
          category: { type: "string", enum: ["HR", "Billing", "Support", "Sales", "General"] },
          is_read:  { type: "boolean" },
          timestamp:{ type: "string", format: "date-time" },
        },
      },
      Employee: {
        type: "object",
        properties: {
          id:             { type: "string" },
          name:           { type: "string" },
          email:          { type: "string", nullable: true },
          role:           { type: "string", enum: ["leader", "hr", "accounting", "department_head", "employee"] },
          status:         { type: "string", enum: ["active", "terminated"] },
          account_status: { type: "string", enum: ["active", "password_pending", "password_set", "blocked"] },
        },
      },
      KbArticle: {
        type: "object",
        properties: {
          id:         { type: "string", format: "uuid" },
          tenant_id:  { type: "string", nullable: true },
          locale:     { type: "string", enum: ["uz", "ru", "en", "ja"] },
          category:   { type: "string" },
          question:   { type: "string" },
          answer:     { type: "string" },
          tags:       { type: "array", items: { type: "string" } },
          is_active:  { type: "boolean" },
          version:    { type: "integer" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      DocumentTemplateField: {
        type: "object",
        required: ["name", "label", "type", "required"],
        properties: {
          name: { type: "string", example: "employee" },
          label: { type: "string", example: "Xodim F.I.Sh." },
          type: {
            type: "string",
            enum: ["text", "textarea", "date", "number"],
          },
          required: { type: "boolean" },
        },
      },
      DocumentTemplate: {
        type: "object",
        required: ["id", "slug", "category", "title", "fields"],
        properties: {
          id: { type: "string", format: "uuid" },
          slug: { type: "string", example: "mehnat-shartnomasi" },
          category: {
            type: "string",
            enum: ["shartnoma", "ariza", "buyruq", "boshqa"],
          },
          title: { type: "string" },
          description: { type: "string" },
          fields: {
            type: "array",
            items: { $ref: "#/components/schemas/DocumentTemplateField" },
          },
          requested_locale: { type: "string", enum: ["uz", "ru"] },
          applied_locale: { type: "string", enum: ["uz", "ru"] },
        },
      },
      AuditLog: {
        type: "object",
        properties: {
          id:          { type: "string", format: "uuid" },
          tenant_id:   { type: "string", nullable: true },
          user_id:     { type: "string", nullable: true },
          action:      { type: "string", enum: ["create", "update", "delete"] },
          event_type:  { type: "string", nullable: true },
          entity_type: { type: "string", nullable: true },
          entity_id:   { type: "string", format: "uuid", nullable: true },
          payload:     { type: "object", nullable: true },
          created_at:  { type: "string", format: "date-time" },
        },
      },
      AnalyticsData: {
        type: "object",
        properties: {
          taskStats: {
            type: "object",
            properties: {
              total:       { type: "integer" },
              todo:        { type: "integer" },
              in_progress: { type: "integer" },
              done:        { type: "integer" },
              overdue:     { type: "integer" },
            },
          },
          taskTrend: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day:     { type: "string" },
                created: { type: "integer" },
                done:    { type: "integer" },
              },
            },
          },
          inboxCategories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name:  { type: "string" },
                count: { type: "integer" },
              },
            },
          },
          employeeStats: {
            type: "object",
            properties: {
              total:        { type: "integer" },
              active:       { type: "integer" },
              pending:      { type: "integer" },
              recent_joins: { type: "integer" },
            },
          },
          generatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  security: [{ BearerAuth: [] }],
  paths: {
    // ── AI ────────────────────────────────────────────────────────────────────
    "/ai/chat": {
      post: {
        tags: ["AI"],
        summary: "Send message to AI assistant",
        description: "Routes to Claude Haiku (simple) or Claude Sonnet 4 (complex). Searches Knowledge Base with pgvector before calling LLM.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["message"],
                properties: {
                  message:    { type: "string", example: "QQS stavkasi necha foiz?" },
                  locale:     { type: "string", enum: ["uz", "ru", "en", "ja"], default: "uz" },
                  session_id: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "AI response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reply:      { type: "string" },
                    model:      { type: "string", example: "claude-haiku-4-5" },
                    complexity: { type: "string", enum: ["simple", "document", "analysis"] },
                    kb_used:    { type: "boolean" },
                    tokens:     { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── AI Hujjatchi ─────────────────────────────────────────────────────────
    "/doc-templates": {
      get: {
        tags: ["Documents"],
        summary: "List active document templates",
        parameters: [
          {
            name: "locale",
            in: "query",
            schema: { type: "string", enum: ["uz", "ru"], default: "uz" },
          },
          {
            name: "category",
            in: "query",
            schema: {
              type: "string",
              enum: ["shartnoma", "ariza", "buyruq", "boshqa"],
            },
          },
        ],
        responses: {
          "200": {
            description: "Active templates",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/DocumentTemplate" },
                },
              },
            },
          },
        },
      },
    },
    "/docs/generate": {
      post: {
        tags: ["Documents"],
        summary: "Generate and save an editable document draft",
        description:
          "Renders a seeded template with validated fields and stores it in documents/doc_generated. Binary PDF/DOCX export is a later Phase 2 slice.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fields_data"],
                properties: {
                  template_id: { type: "string", format: "uuid" },
                  template_slug: { type: "string" },
                  title: { type: "string", maxLength: 200 },
                  locale: {
                    type: "string",
                    enum: ["uz", "ru"],
                    default: "uz",
                  },
                  format: {
                    type: "string",
                    enum: ["pdf", "docx"],
                    default: "docx",
                  },
                  fields_data: {
                    type: "object",
                    additionalProperties: {
                      oneOf: [{ type: "string" }, { type: "number" }],
                    },
                  },
                },
                oneOf: [
                  { required: ["template_id"] },
                  { required: ["template_slug"] },
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Generated draft and IDs",
          },
          "422": {
            description: "Missing template fields or invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "429": {
            description: "Plan document generation limit reached",
          },
        },
      },
    },

    // ── Dashboard / Analytics ─────────────────────────────────────────────────
    "/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Get tenant dashboard stats",
        responses: {
          "200": {
            description: "Dashboard statistics including health score, KPI charts, insights",
          },
        },
      },
    },
    "/analytics": {
      get: {
        tags: ["Dashboard"],
        summary: "Get real-time analytics aggregation",
        description: "Returns task stats, 7-day trend, inbox by category (30d), employee stats. Respects soft-delete (deleted_at IS NULL).",
        responses: {
          "200": {
            description: "Analytics data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AnalyticsData" },
              },
            },
          },
        },
      },
    },

    // ── Inbox ─────────────────────────────────────────────────────────────────
    "/inbox": {
      get: {
        tags: ["Inbox"],
        summary: "List inbox items for tenant",
        parameters: [
          { name: "X-Tenant-Id", in: "header", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "List of inbox items",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/InboxItem" } },
              },
            },
          },
        },
      },
    },
    "/inbox/{id}/read": {
      patch: {
        tags: ["Inbox"],
        summary: "Mark inbox item as read",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Marked as read" } },
      },
    },

    // ── Tasks ─────────────────────────────────────────────────────────────────
    "/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tenant tasks",
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["todo", "in_progress", "done"] } },
        ],
        responses: {
          "200": {
            description: "Task list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Task" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create a task",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title:    { type: "string" },
                  priority: { type: "string", enum: ["low", "medium", "high"] },
                  assignee: { type: "string" },
                  due_date: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Created task" } },
      },
    },
    "/tasks/{id}": {
      patch: {
        tags: ["Tasks"],
        summary: "Update task status / fields",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Updated task" } },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Soft-delete task (sets deleted_at)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Soft deleted" } },
      },
    },

    // ── HR / Members ──────────────────────────────────────────────────────────
    "/tenants/{tenantId}/members": {
      get: {
        tags: ["HR"],
        summary: "List employees for tenant",
        parameters: [
          { name: "tenantId", in: "path", required: true, schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["active", "terminated", "all"] } },
        ],
        responses: {
          "200": {
            description: "Employee list",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Employee" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["HR"],
        summary: "Invite / create employee",
        parameters: [{ name: "tenantId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["full_name", "role"],
                properties: {
                  full_name: { type: "string" },
                  email:     { type: "string", format: "email" },
                  role:      { type: "string", enum: ["hr", "accounting", "department_head", "employee"] },
                  mode:      { type: "string", enum: ["invite", "direct"], default: "invite" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Employee created / invited" } },
      },
    },

    // ── Admin: Knowledge Base ─────────────────────────────────────────────────
    "/admin/kb": {
      get: {
        tags: ["Admin — Knowledge Base"],
        summary: "List KB articles (super_admin only)",
        parameters: [
          { name: "locale",    in: "query", schema: { type: "string" } },
          { name: "category",  in: "query", schema: { type: "string" } },
          { name: "is_active", in: "query", schema: { type: "boolean" } },
        ],
        responses: {
          "200": {
            description: "KB articles",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/KbArticle" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Admin — Knowledge Base"],
        summary: "Create KB article (super_admin only)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["locale", "category", "question", "answer"],
                properties: {
                  locale:    { type: "string" },
                  category:  { type: "string" },
                  question:  { type: "string" },
                  answer:    { type: "string" },
                  tags:      { type: "array", items: { type: "string" } },
                  is_active: { type: "boolean", default: true },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Created KB article" } },
      },
    },
    "/admin/kb/{id}": {
      put: {
        tags: ["Admin — Knowledge Base"],
        summary: "Update KB article (super_admin only)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Updated article" } },
      },
      delete: {
        tags: ["Admin — Knowledge Base"],
        summary: "Delete KB article (super_admin only)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Deleted" } },
      },
    },

    // ── Admin: Audit Log ──────────────────────────────────────────────────────
    "/admin/audit": {
      get: {
        tags: ["Admin — Audit"],
        summary: "List audit logs (super_admin only)",
        parameters: [
          { name: "tenant_id",   in: "query", schema: { type: "string" } },
          { name: "entity_type", in: "query", schema: { type: "string" } },
          { name: "action",      in: "query", schema: { type: "string", enum: ["create", "update", "delete"] } },
          { name: "from",        in: "query", schema: { type: "string", format: "date-time" } },
          { name: "to",          in: "query", schema: { type: "string", format: "date-time" } },
          { name: "limit",       in: "query", schema: { type: "integer", default: 100, maximum: 500 } },
        ],
        responses: {
          "200": {
            description: "Audit log entries",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/AuditLog" } },
              },
            },
          },
        },
      },
    },

    // ── Admin: Companies ──────────────────────────────────────────────────────
    "/admin/companies": {
      get: {
        tags: ["Admin — Companies"],
        summary: "List all tenants (super_admin only)",
        responses: { "200": { description: "Tenant list with member counts" } },
      },
    },
    "/admin/tenants/{id}/status": {
      patch: {
        tags: ["Admin — Companies"],
        summary: "Change tenant status (active / suspended / blocked)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["active", "suspended", "blocked"] },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Status updated" } },
      },
    },
  },
} as const;

// ── Scalar HTML UI ─────────────────────────────────────────────────────────────

export function renderScalarHtml(apiJsonUrl: string): string {
  return `<!doctype html>
<html>
  <head>
    <title>AI Business Concierge — API Docs</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script
      id="api-reference"
      data-url="${apiJsonUrl}"
      data-configuration='{"theme":"purple","layout":"modern"}'
    ></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;
}
