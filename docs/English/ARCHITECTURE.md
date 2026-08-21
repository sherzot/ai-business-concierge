# ARCHITECTURE.md — AI Business Concierge

> Project architecture, design patterns, and unit testing rules
> Version: 1.3 | Updated: 2026-08-21
>
> Current runtime status is in [STATUS.md](STATUS.md). `hr-candidate` is partial: the GitHub adapter and local PDF/DOCX extractor are real, while semantic LLM/scoring/report/orchestrator flow is scaffold logic and not a production-ready reference implementation.

---

## 1. GENERAL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION                            │
│   React Pages + Telegram Handlers + Hono Route handlers     │
├─────────────────────────────────────────────────────────────┤
│                     APPLICATION                             │
│   React Hooks (ViewModel) + Use Cases + Orchestrators       │
├─────────────────────────────────────────────────────────────┤
│                       DOMAIN                                │
│   Entities · Value Objects · Domain Services · Interfaces   │
├─────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE                            │
│   API calls · Supabase · External APIs · Cache              │
└─────────────────────────────────────────────────────────────┘
```

**Rule:** Each layer can only import itself or a lower layer. A lower layer does not know about higher layers.

### 1.1 Delivery and environment boundary

- The active hosting path is `GitHub -> Netlify` only; Vercel is not a runtime, preview, or deployment platform.
- Netlify `production` connects only to the production Supabase project.
- Netlify `deploy-preview`, `branch-deploy`, and `dev` connect to a separate staging Supabase project; they must never use production project refs, keys, secrets, or real data.
- Supabase Free has no Branching, so staging is a separate project. Schema is synchronized only through versioned migrations and test data comes from synthetic seeds.
- The `validate:deploy-env` build guard fails closed on context/project mismatch. CSP is generated at build time from the selected project ref.

### 1.2 AI Document Assistant private binary boundary

- PDF and DOCX are generated only inside `bright-api`; the browser neither generates binaries nor performs direct Supabase Storage CRUD.
- Binaries live in private `generated-documents` at immutable `<tenant>/<user>/documents/<document-id>/document-<storage-version>.<pdf|docx>` paths. `storage_path` CAS serializes parallel exports; publication takes a five-minute provisional lease and pins `download_expires_at` to 65 seconds after URL signing. `documents.row_version` is the edit/export/delete CAS boundary, and superseded objects are removed only after the new metadata/document commit. Legacy paths remain readable and restrictive Storage policy blocks direct browser access.
- `bright-api` validates active tenant membership. Generate prepares the binary with O(n) PDF wrapping before publishing the document DB row. Downloads use 60-second signed URLs; export regenerates editable content, while delete and compensation are DB-first and clean private objects afterward.
- A pinned SHA-256-verified `Noto Sans JP` OTF covers all four languages. It is fully embedded in PDF, embedded as obfuscated `.odttf` in DOCX, and cached in private `document-assets`.

### 1.3 AI Document Assistant polishing boundary

- The browser sends the current editable draft and user instruction through tenant-scoped `POST /docs/:id/polish`; `bright-api` first verifies that the document belongs to the active tenant.
- Model output is never persisted automatically. The frontend applies it only to the edit-textarea preview, and the existing optimistic document update runs only when the user selects **Save**. If the draft revision changes during a request, the late AI result is not applied; the modal is bounded to short viewports with internal scrolling.
- The system prompt isolates document title/content as untrusted data. Tenant scope, the complete prompt, and the effective output-token budget are included in the SHA-256 cache key; shared document chat defaults to 2,000 tokens while polishing explicitly opts into 8,000.
- Raw document, output, and instruction text is not written to observability storage; interaction logs retain only instruction length. Provider tokens/cost are accounted before output validation. The authoritative polishing plan-quota check and increment run as one atomic PostgreSQL statement in the service-role-only `reserve_ai_request` RPC; a reservation is released when the provider call does not complete. Safety, the DB-backed minute rate limit, the four-locale standard error envelope, and a bounded timeout covering fetch plus complete response-body parsing apply at the provider boundary.

---

## 2. FRONTEND ARCHITECTURE

### 2.1 Feature Slice + Clean Architecture

Each feature must have 4 layers:

```
features/
  {domain}/
    types.ts              # Domain: Entity + Value Object + Interface definitions
    api/                  # Infrastructure: Server communication
      {domain}Api.ts
    hooks/                # Application: ViewModel
      use{Domain}.ts
    components/           # Presentation: Pure UI blocks
      {Domain}Card.tsx
      {Domain}Form.tsx
    pages/                # Presentation: Thin routing shell
      {Domain}Page.tsx
    __tests__/
      {domain}Api.test.ts
      use{Domain}.test.ts
      {Domain}Card.test.tsx
```

### 2.2 Layer Responsibilities

#### `types.ts` — Domain layer
```typescript
// ✅ Correct: full entity + value objects
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string | null;
};
export type CreateTaskInput = Omit<Task, 'id'>;

// ❌ Incorrect: empty placeholder
export type Task = { id: string };
```

#### `api/` — Infrastructure layer (Repository pattern)
```typescript
// ✅ Correct: typed, no 'any'
export async function createTask(tenantId: string, input: CreateTaskInput): Promise<Task>

// ❌ Incorrect: using any type
export async function createTask(tenantId: string, task: any)
```

#### `hooks/` — Application layer (ViewModel)
```typescript
// ✅ Correct: all state + logic in hook
export function useTasks(tenantId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  return { tasks, loading, error, create, remove };
}

// ❌ Incorrect: empty hook or return []
export function useTasks() { return []; }
```

#### `pages/` — Presentation layer (Thin Page)
```typescript
// ✅ Correct: hook + render only
export function TasksPage({ tenant }: { tenant: TenantAssignment }) {
  const { tasks, loading, error, create } = useTasks(tenant.id);
  if (loading) return <Spinner />;
  if (error) return <ErrorState />;
  return <TaskBoard tasks={tasks} onCreate={create} />;
}

// ❌ Incorrect: state management in page
export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  useEffect(() => { fetch(...).then(setTasks) }, []); // should be in hook
}
```

---

## 3. BACKEND ARCHITECTURE (Hono + Deno)

### 3.1 Folder Structure

```
supabase/functions/server/
  domain/types.ts
  application/
    services/
      llm-router.ts
      knowledge-base.ts
      hr-candidate/        ← PARTIAL; real GitHub + local PDF/DOCX, semantic LLM/orchestrator stubs remain
        index.ts           # Orchestrator
        types.ts
        candidate-scorer.ts
        github-analyzer.ts
        cv-parser.ts
  infrastructure/
    repositories/
      task-repository.ts
  presentation/
    routes/
      hr-candidate.ts
      tasks.ts
    middleware/
      auth.ts
      tenant.ts
  index.ts
```

### 3.2 Route Handler — Thin Principle

```typescript
// ✅ Correct: handler is HTTP only, logic is in service
router.post("/tasks", authMiddleware, tenantMiddleware, async (c) => {
  const body = await c.req.json();
  const task = await createTaskUseCase(c.var.tenantId, body);
  return c.json({ data: task });
});

// ❌ Incorrect: all logic in route handler
router.post("/tasks", async (c) => {
  const { data: { user } } = await supabase.auth.getUser(...);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  // ...50 lines of business logic...
});
```

---

## 4. DESIGN PATTERNS

### 4.1 Repository Pattern — Data Access Abstraction
```typescript
export interface ITaskRepository {
  findAll(tenantId: string): Promise<Task[]>;
  create(tenantId: string, input: CreateTaskInput): Promise<Task>;
  update(tenantId: string, id: string, input: UpdateTaskInput): Promise<Task>;
  delete(tenantId: string, id: string): Promise<void>;
}
```

### 4.2 Strategy Pattern — LLM Router (EXISTS, reference)
```typescript
// simple → Haiku, document → Sonnet, analysis → Sonnet
const complexity = classifyComplexity(message);
const model = selectModel(complexity);
```

### 4.3 Observer Pattern — Realtime subscriptions
```typescript
supabase.channel('tasks').on('postgres_changes', ...).subscribe();
```

### 4.4 Facade Pattern — apiClient (EXISTS, reference)
```typescript
// All API calls go through this — auth token, tenant header, error handling
apiRequest<Task[]>("/tasks", { tenantId });
```

### 4.5 Use Case Pattern — Application Logic Isolation
```typescript
export async function createTaskUseCase(
  tenantId: string,
  input: CreateTaskInput,
  repository: ITaskRepository,
): Promise<Task> {
  if (!input.title.trim()) throw new DomainError("Task title cannot be empty");
  return repository.create(tenantId, { ...input, status: 'todo' });
}
```

---

## 5. UNIT TESTING

### 5.1 Stack
| Layer | Technology |
|---|---|
| Frontend | Vitest + @testing-library/react + @testing-library/jest-dom |
| Backend (Deno) | Deno built-in test runner (`deno test`) |
| API mocking | `vi.fn()` / `vi.mock()` (frontend), `Deno.test` stubs (backend) |

### 5.2 Test File Location
```
features/tasks/__tests__/
  tasksApi.test.ts       # Infrastructure: API call shapes and response mapping
  useTasks.test.ts       # Application: hook state transitions
  TaskCard.test.tsx      # Presentation: UI render + user interactions
```

### 5.3 What to Test

#### Infrastructure (api/) — input/output
```typescript
it('createTask sends due_date format correctly', async () => {
  const spy = vi.fn().mockResolvedValue({ data: mockTask });
  vi.mocked(apiRequest).mockImplementation(spy);
  await createTask('tenant1', { title: 'Test', dueDate: '2026-06-01' });
  expect(spy.mock.calls[0][1].body).toContain('"due_date":"2026-06-01"');
});
```

#### Application (hooks/) — state transitions
```typescript
it('useTasks: starts with loading true, false after data arrives', async () => {
  vi.mocked(getTasks).mockResolvedValue([mockTask]);
  const { result } = renderHook(() => useTasks('tenant1'));
  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.tasks).toHaveLength(1);
});
```

### 5.4 Coverage Goals
| Layer | Target |
|---|---|
| Domain (types + pure functions) | 100% |
| Application (use cases + hooks) | 80%+ |
| Infrastructure (api calls) | 70%+ |
| Presentation (components) | 60%+ |

### 5.5 What NOT to Test
- **Supabase client internals** — Supabase's responsibility
- **CSS/styling** — no snapshot tests added, only interactions
- **Third-party lib internals** — Radix UI, React Router, etc.
- **Simple getters/setters** — functions with no logic

---

## 6. RULE: HOW TO WRITE A NEW FEATURE

### 6.1 Frontend Checklist
```
✅ types.ts — full entity (not empty)
✅ api/*.ts  — typed functions (no 'any')
✅ hooks/use{Domain}.ts — all state + logic
✅ pages/*Page.tsx — hook + render only (max 100 lines)
✅ __tests__/*.test.ts — at least 3 tests (infrastructure + application + domain)
```

### 6.2 Backend Checklist
```
✅ Complex logic → services/{domain}/ folder (hr-candidate pattern)
✅ Route handler → max 20 lines (validate + call service + return json)
✅ Auth/tenant check → via middleware (not inline)
✅ Zod schema → for each input
✅ Deno test → at least 3 tests for services
```

---

## 7. NAMING CONVENTIONS

| Element | Pattern | Example |
|---|---|---|
| Feature hook | `use{Domain}` | `useTasks`, `useInbox` |
| Repository class | `{Domain}ApiRepository` | `TaskApiRepository` |
| Use case fn | `{verb}{Domain}UseCase` | `createTaskUseCase` |
| Domain type | PascalCase | `Task`, `TaskStatus` |
| Input type | `{Action}{Domain}Input` | `CreateTaskInput` |
| Test file | `{subject}.test.ts(x)` | `tasksApi.test.ts` |

---

## 8. ANTI-PATTERNS (DON'T DO)

| Anti-pattern | Instead |
|---|---|
| `task: any` parameters | `CreateTaskInput` typed interface |
| 500+ line pages | Move logic to hooks, UI to components |
| `export type X = { id: string }` placeholder | Full domain entity |
| `return []` hooks | Full ViewModel hook |
| 50+ lines of business logic in route handler | Service / use case |
| Inline `supabase.auth.getUser()` in every route | `authMiddleware` |
| Feature without tests | `__tests__/` folder + at least 3 tests |

---

*ARCHITECTURE.md — AI Business Concierge v1.0*
*Date: 2026-05-05*
*The HR Candidate folder is the target modular pattern; the GitHub adapter and bounded local PDF/DOCX extractor are real, while semantic LLM/scoring/report/orchestrator flow remains a partial scaffold.*
