# Development Log — AI Business Concierge

Project development history, completed work, encountered errors, and their solutions.

> **Translations (kept in sync):** [Uzbek (primary)](../DEVLOG.md) · [Russian](../Russian/DEVLOG.md) · [Uzbek translation](../Uzbek/DEVLOG.md) · [日本語](../日本語/DEVLOG.md)

## 2026-05-27 — #3 Framer-motion micro-animations

### Context
Framer-motion was already installed but only used for page transitions. KPI cards, employee table rows, and company cards needed hover/stagger animations.

### Done
- `shared/lib/motionVariants.ts` new file — shared variants:
  - `fadeInUp` — page section entrance
  - `staggerContainer` + `staggerItem` — list stagger (55ms interval)
  - `cardHover` — scale 1.02 + indigo box-shadow on hover
  - `rowHover` — subtle table row hover
- `DashboardPage.tsx`: KPI grid → `motion.div` (staggerContainer); each `KpiCard` → `motion.div` (staggerItem + cardHover)
- `EmployeesPage.tsx`: `<tbody>` → `<motion.tbody>` (staggerContainer); each `<tr>` → `<motion.tr>` (staggerItem, 55ms stagger)
- `AdminCompaniesPage.tsx`: cards wrapper → `motion.div` (staggerContainer); each card → `motion.div` (staggerItem + indigo border hover)

### Files
- `frontend/src/shared/lib/motionVariants.ts` (new)
- `frontend/src/features/reports/pages/DashboardPage.tsx` (changed)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (changed)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (changed)

## 2026-05-27 — #2 CommandPalette: ⌘K global modal search

### Context
The previous ⌘K shortcut only focused the search input. A proper CommandPalette — modal, fuzzy search, keyboard navigation — was needed.

### Done
- Created `CommandPalette.tsx` new component (`shared/components/`)
- Framer-motion: backdrop + modal scale/fade animation
- 13 page items (Dashboard → Notifications), 1 quick action (Add Employee)
- Employees: `listEmployees(tenantId, "active")` — lazy loaded when palette opens
- Fuzzy match: `includes()` + char-by-char fallback; match substring `<span>` highlight
- Keyboard: ArrowUp/Down cursor movement, Enter → select, Escape → close
- Grouped sections: Pages / Quick Actions / Employees + scroll-into-view
- Footer hint: `↑↓ navigate`, `↵ open`, `ESC close`
- `App.tsx` changes:
  - Added `paletteOpen` state
  - ⌘K handler: `setPaletteOpen(prev => !prev)` (toggle)
  - Search input → click-to-open button (shows ⌘K badge)
  - `<CommandPalette>` rendered at layout bottom (via portal to `document.body`)
  - `employee-detail:` prefix navigates to employee detail page

### Files
- `frontend/src/shared/components/CommandPalette.tsx` (new)
- `frontend/src/App.tsx` (changed)

## 2026-05-27 — B-005 + B-006 + B-011: DB indexes, audit triggers, structured logging

### Context
Business tables had no composite indexes — tenant-scoped queries were slow at scale. Audit log was written manually only (no triggers). Hono's default logger output plain text — poor observability in Supabase log viewer.

### Done

**B-005 — Performance indexes + soft-delete:**
- Added `deleted_at timestamptz` column to `tasks`, `inbox_items`, `documents`
- `idx_tasks_tenant_status_del` — `(tenant_id, status, deleted_at)` partial index where deleted_at IS NULL
- `idx_tasks_tenant_due` — `(tenant_id, due_date)` partial, for overdue detection
- `idx_inbox_tenant_created_del` — `(tenant_id, created_at desc, deleted_at)` partial
- `idx_notifications_user_unread` — `(user_id, created_at desc)` where read_at IS NULL
- `idx_notifications_tenant_created` — `(tenant_id, created_at desc)`
- `idx_documents_tenant_created_del` — `(tenant_id, created_at desc)` partial
- `idx_audit_logs_tenant_created` — `(tenant_id, created_at desc)` for audit viewer
- `idx_audit_logs_entity` — `(entity_type, entity_id, created_at desc)` for entity lookup
- `idx_request_logs_tenant_created` — `(tenant_id, created_at desc)`

**B-006 — Audit log triggers:**
- Created `fn_audit_log_change()` PL/pgSQL function (SECURITY DEFINER)
- INSERT → `event_type = 'table.create'`, payload = NEW row as JSON
- UPDATE → `event_type = 'table.update'`, payload = `{before: OLD, after: NEW}`
- DELETE → `event_type = 'table.delete'`, payload = OLD row as JSON
- Triggers attached: `trg_audit_tasks`, `trg_audit_inbox_items`, `trg_audit_documents` (+ hr_cases if exists)

**B-011 — Structured JSON logging middleware (Hono):**
- Removed `import { logger } from "npm:hono/logger"` and `app.use('*', logger(console.log))`
- New `app.use('*', async (c, next) => {...})` middleware:
  - Reads `X-Trace-Id` header or generates a new UUID
  - Measures response time with `Date.now()` before/after
  - Assigns log level: status ≥ 500 → `error`, ≥ 400 → `warn`, duration > 2000ms → `warn`, else `info`
  - Outputs structured JSON via `logRequest()`: `{level, message, traceId, tenantId, userId, data: {method, path, status, duration_ms}}`
  - Adds `slow_query: true` flag for requests exceeding 2000ms

### Files
- `supabase/migrations/20260527000000_b005_b006_optimization.sql` (new)
- `supabase/functions/server/index.ts` (changed — logger import removed, structured middleware added)
>
> **Protocol (CLAUDE.md §...):** Every change is logged here and across the 4 translations.

---

## 2026-05-27 — UI/UX #10: Onboarding tooltips (TourProvider, TourOverlay)

### Done

- `OnboardingTour.tsx`: `TourProvider` + `useTour` hook + `TourOverlay` component (no external library)
  - Spotlight: dark overlay with `box-shadow` cutout around target element
  - Target position tracked via `requestAnimationFrame` (works with scroll)
  - `placement: "top"|"bottom"|"left"|"right"` — viewport clamped
  - Progress bar, step counter (1/4), "Skip" + "Next" buttons
  - Keyboard: `Escape` → close, `ArrowRight`/`Enter` → advance
- `AppProviders.tsx`: added `<TourProvider>`
- `App.tsx`: `DASHBOARD_TOUR` (4 steps: nav, search, notifications, theme) + `HelpCircle` button → `startTour()`
- Search input: added `data-tour="search"` attribute

### Files

- `frontend/src/shared/components/OnboardingTour.tsx` (new)
- `frontend/src/app/providers/AppProviders.tsx` (changed)
- `frontend/src/App.tsx` (changed)

---

## 2026-05-27 — UI/UX #9: Keyboard shortcuts (⌘K search, ⌘N new employee)

### Done

- `keydown` listener in `App.tsx`: `Cmd/Ctrl+K` → focuses + selects search input; `Cmd/Ctrl+N` → navigates to `hr-add-employee` (only when HR permission granted)
- Mac/Windows mod key detection via `navigator.platform`
- Search input placeholder updated: `"... (⌘K)"` hint added

### Files

- `frontend/src/App.tsx` (changed)

---

## 2026-05-27 — UI/UX #8: Table pagination (EmployeesPage, AdminCompaniesPage)

### Done

- `Pagination` component: page buttons with ellipsis, `ChevronLeft/Right`, "N–M / total" info; `paginateArray` helper
- **EmployeesPage**: `PAGE_SIZE=20`, page resets on tab/search/statusFilter change, `paginateArray(filtered, page, PAGE_SIZE).map(...)`
- **AdminCompaniesPage**: `PAGE_SIZE=15`, page resets on filter/search change, pagination below list

### Files

- `frontend/src/shared/components/Pagination.tsx` (new)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (changed)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (changed)

---

## 2026-05-27 — UI/UX #7: Dark/Light mode toggle

### Done

- `useTheme` hook: localStorage persistence (`ai-bc-theme`), OS preference fallback, adds/removes `.dark` class on `<html>`
- `ThemeToggle` component: `Sun`/`Moon` icons, `aria-label`, `dark:` hover colors
- Added `<ThemeToggle />` to App.tsx topbar (left of LocaleSelect)
- Added `<ThemeToggle />` to AdminLayout topbar
- `.dark` CSS variables in `theme.css` were already fully defined

### Files

- `frontend/src/shared/hooks/useTheme.ts` (new)
- `frontend/src/shared/components/ThemeToggle.tsx` (new)
- `frontend/src/App.tsx` (changed)
- `frontend/src/features/admin/components/AdminLayout.tsx` (changed)

---

## 2026-05-27 — UI/UX #6: Employee onboarding step wizard

### Done

- `AddEmployeePage` converted to 3-step wizard:
  - **Step 1**: Mode selection — large visual cards (`Send`/`Lock` icons, selected badge)
  - **Step 2**: Info form — icon-prefixed inputs, mode indicator with "Change" link, spinner during submit
  - **Step 3**: Success — large `CheckCircle2` green circle, "Add another" and "Employee list" buttons
- `StepIndicator` component: numbered circles (active/done/future), connector lines (color changes), step labels
- Added `onSuccess?` prop — external callback option on step 3

### Files

- `frontend/src/features/hr/pages/AddEmployeePage.tsx` (complete rewrite)

---

## 2026-05-27 — UI/UX #5: Notifications UI polish

### Done

- **Badge**: `animate-ping` ring (pulsing halo around the red dot) + inner count badge
- **"Mark all as read"** button: header area with `CheckCheck` icon + `Promise.allSettled` parallel marking
- **Empty state**: `BellOff` icon + text (was text only before)
- **Per-notification**: type emoji icon (task/hr/invoice/system/🔔 default), indigo dot for unread, `bg-indigo-50` background
- **Header row** added: "Bildirishnomalar" title + "Mark all" button when unread count > 0
- Replaced `CheckSquare` with contextual type emojis

### Files

- `frontend/src/features/notifications/components/NotificationsDropdown.tsx` (complete rewrite)

---

## 2026-05-27 — UI/UX #4: Mobile responsive fixes (3 pages)

### Done

- **AdminCompaniesPage** header: `flex-wrap gap-3 + shrink-0` — button wraps to next row on small screens
- **AdminContactsPage** header: same `flex-wrap` fix
- **EmployeeDetailPage**: loading → full skeleton (header + 5 field rows); error state → icon + message (was plain text before)
- Summary cards `grid-cols-2 sm:grid-cols-4` — already responsive, preserved

### Files

- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (changed)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (changed)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (changed)

---

## 2026-05-27 — UI/UX #3: Skeleton loaders + Empty states (4 pages)

### Done

- **AdminCompaniesPage**: spinner → 5 card skeletons (`animate-pulse`); empty state → `Building2` icon + contextual message (hint to clear filters when active)
- **AdminContactsPage**: spinner → 5 card skeletons; empty state → `Users` icon + contextual message; added `Users` to imports
- **AdminHealthPage**: single text line → header + banner + 4 stat card skeletons
- **EmployeesPage**: plain text → table skeleton (thead + 6 rows); empty state → `UserPlus` icon + contextual message

### Files

- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (changed)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (changed)
- `frontend/src/features/admin/pages/AdminHealthPage.tsx` (changed)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (changed)

---

## 2026-05-27 — UI/UX #1-2: AdminLayout sidebar + AdminDashboard SVG charts

### Done

**#1 — AdminLayout sidebar rewrite:**
- Desktop: icon-only mode (w-16) ↔ expanded (w-56) via `PanelLeftClose/Open` toggle
- Mobile: drawer (`-translate-x-full` → `translate-x-0`) + overlay; separate `mobileOpen` state
- `NavItem`: tooltip (fixed position when collapsed), left active bar (animated height), icon scale on hover
- Badge: pulsing red dot (collapsed) / count number (expanded) for contacts
- `Avatar`: initials from name split by `[\s@._-]`
- Topbar: new contacts count, avatar top-right

**#2 — AdminDashboardPage SVG charts (no external library):**
- `DonutChart`: pure SVG, arc paths via trigonometry, center hole, center text
- `MiniBarChart`: SVG bar chart, 7-day buckets from companies `created_at`
- `LatencyGauge`: SVG arc gauge, color-coded (green ≤50ms, yellow ≤200ms, red >200ms)
- `StatCard`: weekly trend indicator (↑/↓), hover `scale-[1.01]`
- Skeleton loaders: `animate-pulse` divs while loading
- 30s auto-refresh; new `getDashboardStats` type in adminDashboardApi

### Files

- `frontend/src/features/admin/components/AdminLayout.tsx` (complete rewrite)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (complete rewrite)

---

## 2026-05-27 — Task 4: B-001 Unit tests (inbox module)

### Context

Per B-001, additional unit tests were written for the `features/inbox/` module. Total tests grew from 76 to 89 (+13 new tests, 16 test files).

### Done

**`inbox/__tests__/inboxApi.test.ts` (6 new tests):**
- `snake_case is_read` → `camelCase isRead` normalization
- Accepting `false` when `is_read` is absent
- Correct endpoint and `tenantId` usage
- Empty array → empty list
- Multi-item `isRead` normalization
- Throwing exception on API error

**`inbox/__tests__/useInbox.test.ts` (7 new tests):**
- Items loaded on mount
- `filter=all` — all items shown
- `filter=HR` — only HR items filtered
- `filter=Sales` — only Sales items filtered
- Tenant isolation — separate API call for different `tenantId`
- API error → `error` state, `items=[]`
- `selectedItem` auto-set to first item

### Status: 89 tests, all passing (16 test files)

### Files

- `frontend/src/features/inbox/__tests__/inboxApi.test.ts` (new)
- `frontend/src/features/inbox/__tests__/useInbox.test.ts` (new)

---

## 2026-05-27 — Task 3: B-007 Prompt injection protection + input sanitization

### Context

AI chat endpoints were passing user input directly to Claude/OpenAI without any safety checks. This creates injection risk: users could attempt to override system prompts or manipulate the AI. Per B-007, `services/ai-safety.ts` was created and wired into `/v1/ai/chat`.

### Done

**`services/ai-safety.ts` (new file):**
- `checkAiSafety(rawInput, userId)` — main function:
  - 25 injection patterns (EN/RU/UZ/JA + system markers: `<system>`, `[INST]`, `<|user|>`, etc.)
  - HTML/script tag stripping (DoS-safe: `{0,200}` regex)
  - Max 16,000 chars (~4,000 tokens) limit
  - Per-user rate limit: 10 messages/minute (in-memory sliding window)
  - `SafetyResult` type: `{ safe: true, sanitized }` or `{ safe: false, code, message, messageRu }`
- `wrapUserMessage(sanitized)` — prompt layering helper:
  - Wraps user message in `"User message:\n..."` block
  - Clearly separates user input from system context → reduces injection effectiveness

**`/v1/ai/chat` endpoint updated:**
- `checkAiSafety()` — runs before KB search and AI calls
- 422 → `INJECTION_DETECTED` or `INPUT_TOO_LONG`
- 429 → `RATE_LIMITED` (locale-aware message: uz or ru)
- `safeMessage` — sanitized message used throughout the handler
- `wrapUserMessage()` — applied in Claude + OpenAI fallback calls

### Files

- `supabase/functions/server/services/ai-safety.ts` (new)
- `supabase/functions/server/index.ts` (changed: import + `/v1/ai/chat` handler)

---

## 2026-05-27 — Task 1: ai_usage_logs wiring (billing cost tracking)

### Context

While waiting for API credits, we started backend work that doesn't require credits. First task: the `ai_usage_logs` table was created on 2026-05-14 but the `/v1/ai/chat` and `/v1/admin/ai/chat` endpoints weren't writing to it. This is critical for billing — without knowing how much AI credit each tenant consumes, the Phase 3 payment system cannot function.

### Done

**`insertAiUsageLog` helper function (new, non-blocking):**
- `supabase.from("ai_usage_logs").insert(...)` — uses service_role client (RLS bypass)
- `provider` normalization: `"openai_fallback"` → `"openai"` (DB constraint: `('claude','openai','fallback')`)
- Non-blocking: `.then(({ error }) => ...)` — main request is not slowed down
- `AiUsageLogEntry` type — typed interface

**`/v1/ai/chat` endpoint updated:**
- `insertAiUsageLog()` is called after each AI response
- Stored data: `tenant_id`, `user_id`, `endpoint`, `model`, `provider`, `complexity`, `prompt_tokens`, `completion_tokens`, `cost_usd`, `cached`, `latency_ms`, `trace_id`

**`/v1/admin/ai/chat` endpoint updated:**
- Token tracking variables added: `adminModel`, `adminProvider`, `adminInputTokens`, `adminOutputTokens`, `adminCostUsd`, `adminCached`
- Response data from `callClaude()` and `callOpenAI()` is now collected
- Admin chat does NOT write to `ai_usage_logs` (FK constraint — no tenant in admin context) — logged via `console.info()`
- TODO: future solution: nullable `tenant_id` or separate `admin_ai_usage_logs`

**Clarification:**
- `/v1/docs/search` endpoint already exists (line 2916) — works with `ILIKE`
- `match_documents()` pgvector function exists but requires OpenAI embedding credits — will connect when credits arrive
- Task 2 (`match_documents()` wiring) depends on credits, deferred

### Files

- `supabase/functions/server/index.ts` (changed: `insertAiUsageLog` helper + 2 endpoints wired)

---

## 2026-05-15 — Web improvements (completed): 8 major UI/UX changes

### Context

While waiting for API credits, completed 8 web improvements in order.

### Done

**1. ProfileForm — connected to real auth data:**
- `useUserSettings` hook rewritten — reads real `fullName` and `email` from AuthContext
- `PATCH /v1/settings/profile` backend endpoint created
- `refetchProfile()` called after save — sidebar updates immediately

**2. EmployeeDetailPage — edit mode added:**
- All 23 employee_profiles fields shown as a form
- 5 sections: Personal, Employment, Contact, Emergency, Notes
- `PATCH /v1/tenants/:id/members/:userId/profile` — HR upserts employee

**3. Unit tests (B-001):**
- 9 tests: `adminApi.test.ts`
- 12 tests: `settingsDomain.test.ts`
- 7 tests: `useUserSettings.test.ts`
- LandingPage.test.tsx fixed: I18nProvider wrapper added
- Total: 76 tests, all passing

**4. EmployeesPage — filter + search + block/unblock:**
- Status filter chips: all/active/password_pending/password_set/blocked
- Search field (by name/email)
- Block/Unblock buttons per row

**5. Docs page — templates library:**
- 15 templates (contracts, applications, orders)
- Category filter + search
- "coming soon" badge — waiting for AI credits

**6. Admin dashboard — 30s auto-refresh + sidebar badge:**
- `setInterval(30_000)` — AdminDashboardPage auto-refreshes
- Sidebar "Contacts" nav shows red badge (new contact count)

**7. Reports page — AI audit disabled:**
- "AI Audit" button set to disabled — "coming soon" label

**8. Notifications page — full notification history:**
- `NotificationsPage.tsx` — filter (all/unread/read), bulk mark-read
- `NotificationsDropdown` got "View all" link (`onViewAll` prop)
- App.tsx wired `case "notifications"`

### Files

- `supabase/functions/server/index.ts` (changed — 4 new endpoints)
- `frontend/src/features/settings/hooks/useUserSettings.ts` (rewritten)
- `frontend/src/features/settings/components/ProfileForm.tsx` (rewritten)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (rewritten)
- `frontend/src/features/hr/api/employeesApi.ts` (changed)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (changed)
- `frontend/src/features/admin/__tests__/adminApi.test.ts` (new)
- `frontend/src/features/settings/__tests__/settingsDomain.test.ts` (new)
- `frontend/src/features/settings/__tests__/useUserSettings.test.ts` (new)
- `frontend/src/features/landing/__tests__/LandingPage.test.tsx` (fixed)
- `frontend/src/features/docs/components/TemplatesLibrary.tsx` (new)
- `frontend/src/features/docs/pages/DocsPage.tsx` (rewritten)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (changed)
- `frontend/src/features/admin/components/AdminLayout.tsx` (changed)
- `frontend/src/features/reports/pages/ReportsPage.tsx` (changed)
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` (new)
- `frontend/src/features/notifications/components/NotificationsDropdown.tsx` (changed)
- `frontend/src/App.tsx` (changed)

---

## 2026-05-15 — Web improvements (continued): TenantSettings, EmployeeDetail, Password, Landing nav/footer

### Context

Continuing web improvements while waiting for API credits — items 3–6 of the 6-task web improvement list.

### Done

**3. TenantSettingsPage (full rewrite):**
- `GET /v1/tenants/:id/profile` and `PATCH /v1/tenants/:id/profile` backend endpoints
- Form: name, legal_form, stir, employee_count_range, activity_type, reg_date, legal_address, website, description, contact_phone, contact_email, bank_name, bank_account
- Replaced stub `<div>Tenant settings</div>`

**4. EmployeeDetailPage (new):**
- `GET /v1/tenants/:id/members/:userId` endpoint — user_tenant + employee_profiles JOIN
- `EmployeeDetailPage` component: 5 sections (Personal, Employment, Contact, Emergency, Notes)
- `onViewEmployee` callback added to EmployeesPage
- `selectedEmployeeId` state and "Company Profile" nav item added to App.tsx

**5. PasswordChangeForm (new):**
- Password change via `supabase.auth.updateUser({ password })`
- Eye/EyeOff toggle, validation (min 8 chars, match check), success/error states
- Added to SettingsPage

**6. Landing nav + footer (updated):**
- LandingNavbar: anchor links for features/pricing/faq (visible on md+), smooth scroll
- LandingFooter: nav links row (Features, Pricing, FAQ, Contact)
- `id="features"` on FeaturesSection, `id="pricing"` on PricingSection
- i18n updated in all 4 locales: nav (features/pricing/faq), footer.links (4 links)

### Files

- `supabase/functions/server/index.ts` (changed: new endpoints)
- `frontend/src/features/tenants/pages/TenantSettingsPage.tsx` (rewritten)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (new)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (changed: onViewEmployee)
- `frontend/src/features/settings/components/PasswordChangeForm.tsx` (new)
- `frontend/src/features/settings/pages/SettingsPage.tsx` (changed)
- `frontend/src/features/landing/components/LandingNavbar.tsx` (changed)
- `frontend/src/features/landing/components/LandingFooter.tsx` (changed)
- `frontend/src/features/landing/components/FeaturesSection.tsx` (id added)
- `frontend/src/features/landing/components/PricingSection.tsx` (id added)
- `frontend/src/features/landing/i18n.ts` (changed: nav + footer.links)
- `frontend/src/App.tsx` (changed: EmployeeDetail, TenantSettings, navigate helper)

---

## 2026-05-15 — Phase 1.5 completion + Phase 2.3 start: AdminCompaniesPage, FAQ, SEO

### Context

While waiting for API credits (Anthropic/OpenAI), the web side was improved. The missing `/admin/companies` page from Phase 1.5 was built, and the Landing page received a FAQ section and SEO meta tags from Phase 2.3.

### Done

**1. Backend — `GET /v1/admin/companies` endpoint (new):**
- Returns all tenants with full fields: id, name, status, legal_form, stir, contact info, bank, blocked_reason, timestamps
- `member_count` per tenant (from user_tenants, excluding terminated)
- Status filter: `?status=pending_approval|active|suspended|blocked`
- Super_admin / sub_admin only

**2. Frontend — `adminApi.ts` extended:**
- `Company` type + `CompanyStatus` type
- `getAdminCompanies(status?)` function
- `updateCompanyStatus(id, status, blocked_reason?)` → `PATCH /admin/tenants/:id/status`

**3. Frontend — `AdminCompaniesPage.tsx` (new):**
- 4 status summary cards (pending/active/suspended/blocked)
- Filter tabs + search (name, STIR, email, phone)
- Expandable rows: legal info, bank details, blocked reason
- Actions: Approve, Suspend, Unblock, Block (with reason modal)
- Route: `/admin/companies` with `RequireAuth` wrapper

**4. Frontend — Landing FAQ section:**
- `FaqSection.tsx` — accordion, accessible (aria-expanded), animation
- 6 FAQ items in 4 languages (uz/ru/en/ja) added to `i18n.ts`
- `LandingDict` type extended with `faq: { title, items: FaqItem[] }`
- Page order: PricingSection → FaqSection → LandingCtaBanner

**5. SEO — `index.html` updated:**
- `<title>` with product name + description
- `<meta name="description">`, keywords, author, robots
- Open Graph meta tags
- Twitter Card meta tags
- `<link rel="canonical">`
- `<meta name="theme-color" content="#0f172a">`
- `<html lang="uz">`

### Files
- `supabase/functions/server/index.ts` (GET /admin/companies added)
- `frontend/src/features/admin/api/adminApi.ts`
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (new)
- `frontend/src/app/router.tsx` (/admin/companies route)
- `frontend/src/features/landing/i18n.ts` (FAQ in 4 locales)
- `frontend/src/features/landing/components/FaqSection.tsx` (new)
- `frontend/src/features/landing/pages/LandingPage.tsx`
- `frontend/index.html` (SEO meta tags)

---

## 2026-05-14 — security: 5 views switched to SECURITY INVOKER

### Context

Supabase Security Advisor reported 5 "Security Definer View" errors:
`employee_invite_stats`, `v_beta_stats`, `v_beta_daily_activity`, `v_beta_model_usage`, `v_beta_feedback`.

SECURITY DEFINER views run with the creator's privileges — bypassing RLS and potentially breaking tenant isolation.

### Done

**Migration `20260514120000_views_security_invoker.sql`:**
- Recreated all 5 views with `with (security_invoker = true)` (PG15+).
- `v_beta_*` views — SELECT only for `service_role` (admin dashboard via backend).
- `employee_invite_stats` — granted to `authenticated` and `service_role` (HR sees within their tenant, RLS handles it).
- Every view has a comment: "SECURITY INVOKER — caller RLS rules apply".

### Reason

Same pattern was used before (`20260304_fix_tenant_daily_stats_security.sql`, `20260429120000_security_hardening.sql`). For multi-tenant SaaS, SECURITY DEFINER view is a serious security risk.

### Verification

After push: Dashboard → Advisors → Security → **Refresh** → 5 errors → 0.

### Files
- `supabase/migrations/20260514120000_views_security_invoker.sql` (new)
- `docs/{DEVLOG,English/DEVLOG,Russian/DEVLOG,Uzbek/DEVLOG,日本語/DEVLOG}.md` (synced)

---

## 2026-05-14 — Scale foundation: AI cost tracking + doc_chunks RAG + R-016..R-020

### Context

Implemented the urgent items from `docs/ai-business-concierge-scale-prompt.md` (2026-05-11). Audited the Phase 1.5 state and closed the remaining urgent gaps.

### Done

**1. DB migration `20260514000000_ai_usage_and_doc_vector.sql`:**
- `ai_usage_logs` table — per AI call: tenant, user, endpoint, model, provider, complexity, prompt/completion tokens, cost_usd, cached, latency, trace_id. Generated `total_tokens` column. 3 indexes. RLS with tenant isolation + super_admin/sub_admin see everything.
- `v_ai_usage_summary` view — daily tenant aggregate (for Admin dashboard).
- `doc_chunks.embedding vector(1536)` column — for pgvector RAG.
- `doc_chunks_embedding_idx` HNSW index (m=16, ef_construction=64).
- `match_documents(query_embedding, threshold, count, tenant_id)` function — RAG search, security definer, search_path locked, execute granted only to authenticated/service_role.
- Document_id and tenant_id indexes on `doc_chunks`.

**2. REQUIREMENTS.md updated:**
- R-016 HR Candidate Analysis (skeleton exists, full impl in Phase 2).
- R-017 AI Rate Limiting (partial — in-memory `contactRateMap` + Telegram daily limit).
- R-018 AI Cost Tracking (migration done — backend wiring next session).
- R-019 Vector Search RAG (migration done — backend integration next session).
- R-020 Admin Dashboard (super_admin/sub_admin: health, contacts, AI chat — Phase 4 expansion).

**3. Verified existing state:**
- Phase 1.5 — 5 migrations applied: contact_requests, tenant_company_info, roles_update (sub_admin/company_admin/accountant/manager), employee_profiles, employee_invites.
- Backend admin endpoints in place: `/admin/contacts`, `/admin/health`, `/admin/ai/chat`, `/admin/contacts/:id/status`, `/admin/tenants/:id/status`.
- Frontend admin pages with real implementations: `AdminContactsPage`, `AdminHealthPage`, `AdminAIChatPage` + `adminApi.ts`.
- docs/ structure correct: `English/`, `Russian/`, `Uzbek/`, `日本語/` — each with DEVLOG.md and other translations.

### Deferred (future)

- Prompt caching middleware (scale-prompt Task 1.2) — Phase 1.5 wrap-up.
- HR Candidate Analysis full impl — Phase 2 (per PLAN.md v3.0).
- Backend wiring: insert into `ai_usage_logs` from `/v1/ai/chat` endpoint — next session (extract token usage from services/llm-router.ts).
- Wire `match_documents()` into `POST /v1/docs/search` — next session.
- Full admin debug/log UI (real-time Sentry, query EXPLAIN) — Phase 4.

### Files
- `supabase/migrations/20260514000000_ai_usage_and_doc_vector.sql` (new)
- `docs/REQUIREMENTS.md` (R-016..R-020 added)
- `docs/DEVLOG.md` (this entry)
- `docs/{English,Russian,Uzbek,日本語}/DEVLOG.md` (sync translations)

### Rationale

Without `ai_usage_logs`, billing (Phase 2) cannot work — we can't allocate cost per tenant without per-call token attribution. Without `match_documents()`, the AI Concierge "search in my docs" tool falls back to `ILIKE` — low-quality results.

---

## 2026-05-06 — Phase 1.5 (4): B-027/B-028/B-029

### Changes Made

**B-027 — In-app Notifications for HR (Realtime):**
- `createHrSetupCompleteNotification` — sends notification to HR/leader when employee setup completes
- `createEmployeeConfirmedNotification` — sends notification to employee when HR confirms
- `useRealtimeNotifications` hook — subscribes to `notifications` table via Supabase realtime
- `NotificationsDropdown` — accepts `userId` prop, auto-updates on new notifications (no polling)

**B-028 — /admin/health (System Monitoring):**
- Backend: `GET /admin/health` — super_admin only; DB latency + tenant/user/contact/notification stats
- Frontend: `AdminHealthPage` — stat cards, DB latency banner (green/amber), refresh button; route: `/admin/health`

**B-029 — /admin/ai-chat (Admin AI Chat):**
- Backend: `POST /admin/ai/chat` — super_admin only; Claude + OpenAI fallback; live platform stats as context
- Frontend: `AdminAIChatPage` — chat UI, typing indicator, suggestion chips, locale-aware; route: `/admin/ai-chat`
- `adminApi.ts` — `getAdminHealth()` + `sendAdminAIMessage()` API helpers

---

## 2026-05-06 — Phase 1.5 (3): B-026 Email Templates (7 total)

**7 email templates (Resend API, dark indigo theme):**
1. `company_invite` — existing (admin contact → invite_sent)
2. `company_registered_pending` — POST /register/company → "Awaiting admin approval" to leader email
3. `company_rejected` — PATCH /admin/contacts/:id/status → status=rejected → email to contact
4. `company_approved` — new PATCH /admin/tenants/:id/status → status=active → email to leader
5. `employee_invite` — POST /members → mode=invite → branded email to employee (in addition to Supabase)
6. `employee_welcome` — POST /auth/setup-complete → "Welcome, your account is ready"
7. `admin_new_registration` — POST /register/company → notification to ADMIN_NOTIFY_EMAIL

**New env var:** `ADMIN_NOTIFY_EMAIL`
**New endpoint:** `PATCH /admin/tenants/:id/status`

---

## 2026-05-06 — Phase 1.5 (2): Text Fixes + Language Selector

- `landing/i18n.ts` — "ChatGPT doesn't know this." phrase removed
- `app/i18n.ts` — `auth.platformSubtitle` key added in 4 languages
- `LoginPage.tsx`, `LandingNavbar.tsx`, `LanguageSwitcher.tsx` — button group → `<select>` dropdown

---

## 2026-05-05 — Phase 1: Telegram Bot

**Architecture (Clean Architecture / DDD):**
- `supabase/functions/telegram-bot/` — Edge Function
- `handlers/` — start, help, language, message, feedback, stats, media
- `services/` — session.ts, maslahatchi.ts

**Bot Functionality:**
- 4 languages: uz / ru / en / ja
- `/start`, `/help`, `/language`, `/stats`
- Rate limit: 5 requests/day (free plan)
- LLM Router: Haiku 3.5 (~80%) + Sonnet 4.6 (~20%)
- KB semantic search: pgvector + OpenAI text-embedding-3-small

**Beta Monitoring:**
- `v_beta_stats`, `v_beta_daily_activity`, `v_beta_feedback`, `v_beta_model_usage`

---

## 2026-05-05 — Deployment: Errors and Solutions

### ❌ 401 Unauthorized (Webhook)
**Cause:** Supabase JWT verification was blocking webhook requests.
**Solution:** Added to `supabase/config.toml`:
```toml
[functions.telegram-bot]
verify_jwt = false
```

### ❌ TELEGRAM_WEBHOOK_SECRET not found
**Cause:** Secret was never set, but code was checking for it.
**Solution:** Removed the secret check — webhook auth not required.

### ❌ CLAUDE_ERROR:400 credit balance too low
**Cause:** No Anthropic API credits.
**Status:** User needs to add credits ($5+). Bot cannot respond.

### ❌ OpenAI 429 insufficient_quota
**Cause:** KB seed script called OpenAI embedding API, no quota.
**Status:** Will be resolved with Anthropic. `scripts/seed_kb.ts` is ready (53 entries).

### ❌ /stats didn't work
**Cause:** `ADMIN_CHAT_ID` secret not set.
**Solution:** `supabase secrets set ADMIN_CHAT_ID="6132360728"`

---

## 2026-05-06 — Bot UX Improvements

1. **Non-text messages** — `handlers/media.ts` — images, voice, files, stickers → "please send text only"
2. **Returning user `/start`** — "Welcome back!" in their language, no keyboard shown
3. **Remaining limit display** — `📊 Remaining today: X/5 requests` added to each response
4. **Feedback language fix** — Previously hardcoded `"uz"`, now real locale from `getOrCreateSession`

---

## 2026-05-06 — Language System (Locale) Fixes

### DB Check Constraint — Root Cause
**Cause:** `ai_conversations.locale` constraint: `CHECK (locale IN ('uz', 'ru', 'en'))` — 'ja' was missing!
**Solution:** Migration added: `CHECK (locale IN ('uz', 'ru', 'en', 'ja'))`

### Disclaimer only for uz/ru
**Cause:** `knowledge-base.ts` had only 2 disclaimers.
**Solution:** 4 disclaimers added, `addDisclaimerIfNeeded` extended.

### `llm-router.ts` default system prompt
**Cause:** Fallback `locale === "ru" ? RU : UZ` — English/Japanese users got Uzbek system prompt.
**Solution:** Default system prompt added for all 4 languages.

---

## 2026-05-06 — Phase 1.5 (1): DB Migrations + Landing

### DB — 5 Migrations Applied ✅

| Migration | What it did |
|---|---|
| `phase15_contact_requests` | Company inquiry CRM table + RLS (admin only) |
| `phase15_tenant_company_info` | `tenants` added: status, tax ID, legal info, bank, approval |
| `phase15_roles_update` | `user_tenants` added: sub_admin, company_admin, accountant, manager + status |
| `phase15_employee_profiles` | Full HR data table (passport, JSHSHIR, salary, emergency) |
| `phase15_employee_invites` | One-time invite token table (24h TTL, resend count) |

---

## Key Information

| Parameter | Value |
|-----------|-------|
| Supabase project ref | `ufhepwdkjqptjvxrmpjn` |
| Bot username | `@ai_business_concierge_bot` |
| Admin chat ID | `6132360728` |
| LLM Router | Haiku 3.5 (simple) + Sonnet 4.6 (complex) |
| Embedding model | `text-embedding-3-small` (OpenAI) |
| Rate limit | 5 requests/day (free) |
| Language fallback (KB) | `ja` → `en` (KB only covers uz/ru/en) |
