# ARCHITECTURE.md — AI Business Concierge

> Loyiha arxitekturasi, design patternlar va unit testing qoidalari
> Version: 1.3 | Yangilandi: 2026-08-21
>
> Bu hujjat joriy arxitektura chegaralari va target refactoring yo'nalishini birga ko'rsatadi. Runtime holati uchun [STATUS.md](STATUS.md) ustun. `hr-candidate` papkasi partial: GitHub, local PDF/DOCX va private sanitized-text in-memory seam, pure request policy, PostgreSQL quota lease, bounded multipart, tenant/request-scoped server provider/accounting composition, injectable provider-stage orchestration, 30s-deadline application execution hamda deterministic merge/scoring/report real; typed provider-unavailable, live smoke va full HTTP wiring production-ready emas.

---

## 1. UMUMIY ARXITEKTURA

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

**Qoida:** Har qatlam faqat o'zi yoki pastroq qatlamni import qila oladi. Pastroq qatlam yuqorini bilmaydi.

### 1.1 Delivery va environment chegarasi

- Faol hosting zanjiri faqat `GitHub -> Netlify`; Vercel runtime, preview yoki deploy platformasi emas.
- Netlify `production` konteksti faqat production Supabase projectiga ulanadi.
- Netlify `deploy-preview`, `branch-deploy` va `dev` kontekstlari alohida staging Supabase projectiga ulanadi; production project-ref, key, secret yoki real ma'lumot ishlatilmaydi.
- Supabase Free rejasida Branching yo'qligi sabab staging alohida project bo'ladi. Schema faqat versionlangan migrationlar orqali sinxronlanadi, test ma'lumotlari esa synthetic seed bilan yaratiladi.
- `validate:deploy-env` build guardi context/project mos kelmasa fail-closed to'xtaydi. CSP tanlangan project-ref asosida build vaqtida yaratiladi.

### 1.2 AI Hujjatchi private binary chegarasi

- PDF va DOCX faqat `bright-api` ichida yaratiladi; browser binary yaratmaydi va Supabase Storage bilan direct CRUD qilmaydi.
- Binarylar private `generated-documents` bucketida immutable `<tenant>/<user>/documents/<document-id>/document-<storage-version>.<pdf|docx>` yo'lida saqlanadi. `storage_path` CAS parallel export commitlarini serializatsiya qiladi; publish 5 daqiqalik provisional lease oladi va URL sign qilingach `download_expires_at`ni 65 soniyaga pin qiladi. `documents.row_version` edit/export/delete CAS chegarasi bo'lib, faqat committed yangi metadata/documentdan keyin superseded object o'chadi. Legacy unversioned yo'llar o'qiladi; restrictive Storage policy direct browser accessni yopadi.
- `bright-api` active tenant membershipni tekshiradi. Generate binaryni O(n) PDF wrapping bilan oldindan tayyorlab, keyin document DB qatorini publish qiladi. Yuklab olish faqat 60 soniyali signed URL; export editable contentdan qayta generatsiya qiladi, delete/compensation DB-first bo'lib keyin private objectni cleanup qiladi.
- To'rt til uchun pinned va SHA-256 bilan tasdiqlangan `Noto Sans JP` OTF ishlatiladi. Font PDFga to'liq, DOCXga obfuscated `.odttf` sifatida embed qilinadi va private `document-assets` bucketida cache qilinadi.

### 1.3 AI Hujjatchi polishing chegarasi

- Browser current editable draft va foydalanuvchi ko'rsatmasini tenant-scoped `POST /docs/:id/polish` orqali yuboradi; `bright-api` avval document ID ayni active tenantga tegishli ekanini tekshiradi.
- Model javobi DBga avtomatik yozilmaydi. Frontend uni faqat edit textarea previewiga qo'llaydi; mavjud optimistic document update faqat foydalanuvchi **Saqlash**ni bosganda ishlaydi. Request davomida draft revisioni o'zgarsa kech kelgan AI natijasi qo'llanmaydi; modal qisqa viewportda ichki scroll bilan chegaralanadi.
- System prompt document title/contentni untrusted data sifatida ajratadi. Tenant scope, to'liq prompt va effective output-token budjeti SHA-256 cache keyga kiradi; umumiy document chat 2,000 token defaultda, polishing esa explicit 8,000 token bilan chegaralangan.
- Raw hujjat, output va instruction matni observability storage'ga yozilmaydi; interaction log faqat instruction uzunligini saqlaydi. Provider token/costi output validatsiyasidan oldin hisoblanadi. Polishing plan quota'sining authoritative check+incrementi service-role-only `reserve_ai_request` RPCsida bitta atomik PostgreSQL statement sifatida bajariladi; providerga yetib bormagan xatoda reservation qaytariladi. Safety, DB-backed minute rate limit, to'rt tilli standart error envelope va fetch hamda to'liq response body parsingni qamraydigan bounded timeout provider chegarasida qo'llanadi.

---

## 2. FRONTEND ARXITEKTURASI

### 2.1 Feature Slice + Clean Architecture

Har feature ichida 4 qatlam bo'lishi kerak:

```
features/
  {domain}/
    types.ts              # Domain: Entity + Value Object + Interface ta'riflari
    api/                  # Infrastructure: Server bilan muloqot
      {domain}Api.ts      #   — Typed API calls (no 'any')
    hooks/                # Application: ViewModel (React-specific use case)
      use{Domain}.ts      #   — State + business logic + CRUD actions
    components/           # Presentation: Pure, dumb UI blocks
      {Domain}Card.tsx
      {Domain}Form.tsx
    pages/                # Presentation: Thin routing shell
      {Domain}Page.tsx    #   — FAQAT: hook chaqirish + render
    __tests__/            # Tests (har qatlam uchun)
      {domain}Api.test.ts
      use{Domain}.test.ts
      {Domain}Card.test.tsx
```

### 2.2 Qatlam vazifalari

#### `types.ts` — Domain qatlami
```typescript
// ✅ To'g'ri: to'liq entity + value objects
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  // ...
};
export type CreateTaskInput = Omit<Task, 'id'>;

// ❌ Noto'g'ri: bo'sh placeholder
export type Task = { id: string };
```

#### `api/` — Infrastructure qatlami (Repository pattern)
```typescript
// ✅ To'g'ri: typed, no 'any'
export async function createTask(tenantId: string, input: CreateTaskInput): Promise<Task>

// ❌ Noto'g'ri: any type ishlatish
export async function createTask(tenantId: string, task: any)
```

#### `hooks/` — Application qatlami (ViewModel)
```typescript
// ✅ To'g'ri: barcha state + logika hookda
export function useTasks(tenantId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  // ... async funksiyalar, side-effectlar, CRUD
  return { tasks, loading, error, create, remove, acknowledge };
}

// ❌ Noto'g'ri: bo'sh hook yoki return []
export function useTasks() { return []; }
```

#### `pages/` — Presentation qatlami (Thin Page)
```typescript
// ✅ To'g'ri: faqat hook + render
export function TasksPage({ tenant }: { tenant: TenantAssignment }) {
  const { tasks, loading, error, create, remove } = useTasks(tenant.id);
  if (loading) return <Spinner />;
  if (error) return <ErrorState />;
  return <TaskBoard tasks={tasks} onCreate={create} onDelete={remove} />;
}

// ❌ Noto'g'ri: sahifada useEffect, fetch, state management
export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  useEffect(() => { fetch(...).then(setTasks) }, []); // bu hookga ketishi kerak
  // ...500 qator logika + UI...
}
```

---

## 3. BACKEND ARXITEKTURASI (Hono + Deno)

### 3.1 Papka tuzilishi

```
supabase/functions/server/
  domain/                        # Domain qatlami
    types.ts                     #   — Umumiy entity turlar
  application/
    services/                    # Application use cases
      llm-router.ts              #   ✅ Mavjud
      knowledge-base.ts          #   ✅ Mavjud
      hr-candidate/              #   🚧 PARTIAL — adapters/request/quota/multipart/orchestrator real; semantic LLM stub
        index.ts                 #     Orchestrator
        types.ts                 #     Domain types
        candidate-scorer.ts      #     Domain service
        github-analyzer.ts       #     Infrastructure adapter
        cv-parser.ts             #     Infrastructure adapter
  infrastructure/
    repositories/                # Supabase data access
      task-repository.ts
      inbox-repository.ts
  presentation/
    routes/                      # Thin Hono route handlers
      hr-candidate.ts            #   🚧 Mavjud scaffold; canonical index.ts hali 501 qaytaradi
      tasks.ts                   #   TODO: index.ts dan ajratish
      inbox.ts                   #   TODO: index.ts dan ajratish
    middleware/                  # Auth, tenant, logging
      auth.ts
      tenant.ts
  index.ts                       # FAQAT: Hono setup + middleware + route mounting
```

### 3.2 Route handler — thin principle

```typescript
// ✅ To'g'ri: handler faqat HTTP, logika serviceda
router.post("/tasks", authMiddleware, tenantMiddleware, async (c) => {
  const body = await c.req.json();
  const task = await createTaskUseCase(c.var.tenantId, body);
  return c.json({ data: task });
});

// ❌ Noto'g'ri: barcha logika route handlerdа
router.post("/tasks", async (c) => {
  const { data: { user } } = await supabase.auth.getUser(...);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const tenantId = c.req.header("X-Tenant-Id");
  // ...50 qator business logika...
});
```

### 3.3 Target pattern: modular service papkasi

`hr-candidate` papkasi kerakli modular strukturani ko'rsatadi. GitHub REST va local PDF/DOCX adapterlari bounded; pure request/role/tariff policy providerdan oldin ishlaydi; service-role-only PostgreSQL RPC quota lease'ni rezervatsiya qiladi va alohida idempotent RPC provider logi bilan token counterni bitta tranzaksiyada yozadi; prompt/CV/output accounting chegarasidan o'tmaydi. Quota lifecycle reservation denialda operationni boshlamaydi, accepted lease'ni esa success/error oqimida `finally`da release qiladi; cleanup failure asl natijani bosmaydi va 45 soniyalik DB expiry fallback bo'lib qoladi. Trusted system prompt va escaped untrusted JSON data blocklari ajratilgan; provider evidence projectioni identity/prestige/free-text maydonlarini chiqarib tashlaydi va CV/JD/serialized byte limitlarini fail-closed saqlaydi. Injectable provider-stage boundary model/budget/cache scope'ni tanlaydi, completed receiptni parsingdan oldin hisoblaydi va exact JSON validatoridan o'tkazadi; configuration secret/DB client composition rootda qoladi. Deterministik merge overall/grade/recommendation va local conservative flaglarni saqlaydi. Multipart adapter body'ni 5 MiB CV + 64 KiB overhead bilan cheklaydi; orchestrator failure oqimlarini boshqaradi. Real key composition, raw CV in-memory seam va full HTTP route wiring hali partial.

```
services/{domain}/
  types.ts            # Domain types (Zod schema yoki TypeScript)
  index.ts            # Orchestrator (use case): input → validate → parallelize → assemble
  {step-1}.ts         # Infrastructure adapter (external API)
  {step-2}.ts         # Infrastructure adapter (DB, file parsing)
  {step-3}.ts         # Domain service (scoring, classification)
  prompts.ts          # AI prompt strings (ixtiyoriy)
```

---

## 4. DESIGN PATTERNLAR

### 4.1 Repository Pattern — data access abstraktsiyasi

```typescript
// domain/types.ts
export interface ITaskRepository {
  findAll(tenantId: string): Promise<Task[]>;
  create(tenantId: string, input: CreateTaskInput): Promise<Task>;
  update(tenantId: string, id: string, input: UpdateTaskInput): Promise<Task>;
  delete(tenantId: string, id: string): Promise<void>;
}

// infrastructure/repositories/taskApiRepository.ts
export class TaskApiRepository implements ITaskRepository {
  async findAll(tenantId: string): Promise<Task[]> {
    return apiRequest<Task[]>("/tasks", { tenantId });
  }
  // ...
}
```

### 4.2 Strategy Pattern — LLM Router (MAVJUD, etalon)

```typescript
// ✅ Mavjud va to'g'ri (llm-router.ts):
// simple → Haiku, document → Sonnet, analysis → Sonnet
const complexity = classifyComplexity(message); // Strategy
const model = selectModel(complexity);           // Model selection
```

### 4.3 Observer Pattern — Realtime subscriptions (MAVJUD)

```typescript
// ✅ Mavjud (useRealtimeTasks.ts):
supabase.channel('tasks').on('postgres_changes', ...).subscribe();
```

### 4.4 Facade Pattern — apiClient (MAVJUD, etalon)

```typescript
// ✅ Mavjud (shared/lib/apiClient.ts):
// Barcha API chaqiruvlar shu orqali — auth token, tenant header, error handling
apiRequest<Task[]>("/tasks", { tenantId });
```

### 4.5 Use Case Pattern — application logic izolyatsiyasi

```typescript
// application/use-cases/createTask.ts
export async function createTaskUseCase(
  tenantId: string,
  input: CreateTaskInput,
  repository: ITaskRepository,
): Promise<Task> {
  // business rules bu yerda
  if (!input.title.trim()) throw new DomainError("Vazifa nomi bo'sh bo'lishi mumkin emas");
  return repository.create(tenantId, { ...input, status: 'todo' });
}
```

---

## 5. UNIT TESTING

### 5.1 Stack

| Qatlam | Texnologiya |
|---|---|
| Frontend | Vitest + @testing-library/react + @testing-library/jest-dom |
| Backend (Deno) | Deno built-in test runner (`deno test`) |
| API mocking | `vi.fn()` / `vi.mock()` (frontend), `Deno.test` stubs (backend) |

### 5.2 Test fayl joylashuvi

```
features/tasks/__tests__/
  tasksApi.test.ts       # Infrastructure layer: API call shaplar va response mapping
  useTasks.test.ts       # Application layer: hook state transitions
  TaskCard.test.tsx      # Presentation layer: UI render + user interactions
```

### 5.3 Nima test qilish kerak

#### Infrastructure (api/) — input/output
```typescript
it('createTask due_date formatni to'g'ri yuboradi', async () => {
  const spy = vi.fn().mockResolvedValue({ data: mockTask });
  vi.mocked(apiRequest).mockImplementation(spy);
  await createTask('tenant1', { title: 'Test', dueDate: '2026-06-01' });
  expect(spy.mock.calls[0][1].body).toContain('"due_date":"2026-06-01"');
});
```

#### Application (hooks/) — state transitions
```typescript
it('useTasks: loading true boshlaydi, data kelgandan keyin false bo'ladi', async () => {
  vi.mocked(getTasks).mockResolvedValue([mockTask]);
  const { result } = renderHook(() => useTasks('tenant1'));
  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.tasks).toHaveLength(1);
});
```

#### Domain (types/) — business rules
```typescript
it('overdue: tugash sanasi o'tgan va done emas bo'lsa true', () => {
  const task = { ...mockTask, dueDate: '2020-01-01', status: 'todo' as const };
  expect(isOverdue(task)).toBe(true);
});
it('overdue: done status bo'lsa false', () => {
  const task = { ...mockTask, dueDate: '2020-01-01', status: 'done' as const };
  expect(isOverdue(task)).toBe(false);
});
```

### 5.4 Coverage maqsad

| Qatlam | Target |
|---|---|
| Domain (types + pure functions) | 100% |
| Application (use cases + hooks) | 80%+ |
| Infrastructure (api calls) | 70%+ |
| Presentation (components) | 60%+ |

### 5.5 Nima test QILMASLIK kerak

- **Supabase client ichki logikasi** — bu Supabase javobgarligi
- **CSS/styling** — snapshot testlar qo'shilmagan, faqat interaksiya
- **Third-party lib ichki ishlar** — Radix UI, React Router, etc.
- **Simple getters/setters** — hech qanday logikasi yo'q funksiyalar

---

## 6. QOIDA: YANGI FEATURE QANDAY YOZILADI

### 6.1 Frontend checklist

```
✅ types.ts — to'liq entity (bo'sh emas)
✅ api/*.ts  — typed funksiyalar (no 'any')
✅ hooks/use{Domain}.ts — barcha state + logika
✅ pages/*Page.tsx — faqat hook + render (max 100 qator)
✅ __tests__/*.test.ts — kamida 3 test (infrastructure + application + domain)
```

### 6.2 Backend checklist

```
✅ Murakkab logika → services/{domain}/ papkaga (hr-candidate strukturasi, lekin stub kodini ko'chirmang)
✅ Route handler → max 20 qator (validate + call service + return json)
✅ Auth/tenant tekshiruvi → middleware orqali (inline emas)
✅ Zod schema → har input uchun
✅ Deno test → services uchun kamida 3 test
```

---

## 7. NAMING KONVENSIYASI

| Element | Pattern | Misol |
|---|---|---|
| Feature hook | `use{Domain}` | `useTasks`, `useInbox` |
| Repository class | `{Domain}ApiRepository` | `TaskApiRepository` |
| Use case fn | `{verb}{Domain}UseCase` | `createTaskUseCase` |
| Domain type | PascalCase | `Task`, `TaskStatus` |
| Input type | `{Action}{Domain}Input` | `CreateTaskInput`, `UpdateTaskInput` |
| Test file | `{subject}.test.ts(x)` | `tasksApi.test.ts` |

---

## 8. ANTI-PATTERNLAR (QILMANG)

| Anti-pattern | O'rniga |
|---|---|
| `task: any` parametrlar | `CreateTaskInput` typed interfeys |
| 500+ qatorlik sahifalar | Logikani hookga, UI ni componentga ko'chiring |
| `export type X = { id: string }` placeholder | To'liq domain entity |
| `return []` hooklari | To'liq ViewModel hook |
| Route handlerda 50+ qator business logika | Service / use case |
| Inline `supabase.auth.getUser()` har routeda | `authMiddleware` |
| Test yo'q feature | `__tests__/` papka + kamida 3 test |

---

*ARCHITECTURE.md — AI Business Concierge v1.0*
*Sana: 2026-05-05*
*HR Candidate target modular pattern: bounded adapter/request/quota-lifecycle/multipart/orchestrator/30s-deadline application, private in-memory CV seam, minimized prompt/injectable provider-stage/strict output, server key/accounting composition hamda deterministic merge boundary real; typed provider-unavailable/full HTTP wiring partial scaffold.*
