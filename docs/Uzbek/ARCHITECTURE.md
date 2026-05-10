# ARCHITECTURE.md — AI Business Concierge

> Loyiha arxitekturasi, design patternlar va unit testing qoidalari
> Version: 1.0 | Sana: 2026-05-05

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

---

## 2. FRONTEND ARXITEKTURASI

### 2.1 Feature Slice + Clean Architecture

Har feature ichida 4 qatlam bo'lishi kerak:

```
features/
  {domain}/
    types.ts              # Domain: Entity + Value Object + Interface ta'riflari
    api/                  # Infrastructure: Server bilan muloqot
      {domain}Api.ts
    hooks/                # Application: ViewModel
      use{Domain}.ts
    components/           # Presentation: Pure UI
      {Domain}Card.tsx
      {Domain}Form.tsx
    pages/                # Presentation: Thin routing shell
      {Domain}Page.tsx
    __tests__/
      {domain}Api.test.ts
      use{Domain}.test.ts
      {Domain}Card.test.tsx
```

### 2.2 Qatlam vazifalari

#### `types.ts` — Domain qatlami
```typescript
// ✅ To'g'ri
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string | null;
};
export type CreateTaskInput = Omit<Task, 'id'>;

// ❌ Noto'g'ri
export type Task = { id: string };
```

#### `api/` — Infrastructure qatlami
```typescript
// ✅ To'g'ri: typed, no 'any'
export async function createTask(tenantId: string, input: CreateTaskInput): Promise<Task>

// ❌ Noto'g'ri
export async function createTask(tenantId: string, task: any)
```

#### `hooks/` — Application qatlami
```typescript
// ✅ To'g'ri
export function useTasks(tenantId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  return { tasks, loading, error, create, remove };
}
```

#### `pages/` — Presentation qatlami
```typescript
// ✅ To'g'ri: faqat hook + render
export function TasksPage({ tenant }: { tenant: TenantAssignment }) {
  const { tasks, loading, error, create } = useTasks(tenant.id);
  if (loading) return <Spinner />;
  return <TaskBoard tasks={tasks} onCreate={create} />;
}
```

---

## 3. BACKEND ARXITEKTURASI (Hono + Deno)

### 3.1 Papka tuzilishi

```
supabase/functions/server/
  domain/types.ts
  application/
    services/
      llm-router.ts
      knowledge-base.ts
      hr-candidate/        ← ETALON pattern
        index.ts
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

### 3.2 Route handler — thin principle

```typescript
// ✅ To'g'ri: handler faqat HTTP, logika serviceda
router.post("/tasks", authMiddleware, tenantMiddleware, async (c) => {
  const body = await c.req.json();
  const task = await createTaskUseCase(c.var.tenantId, body);
  return c.json({ data: task });
});
```

---

## 4. DESIGN PATTERNLAR

### 4.1 Repository Pattern
```typescript
export interface ITaskRepository {
  findAll(tenantId: string): Promise<Task[]>;
  create(tenantId: string, input: CreateTaskInput): Promise<Task>;
}
```

### 4.2 Strategy Pattern — LLM Router
```typescript
// simple → Haiku, document → Sonnet, analysis → Sonnet
const complexity = classifyComplexity(message);
const model = selectModel(complexity);
```

### 4.3 Observer Pattern — Realtime
```typescript
supabase.channel('tasks').on('postgres_changes', ...).subscribe();
```

### 4.4 Facade Pattern — apiClient
```typescript
apiRequest<Task[]>("/tasks", { tenantId });
```

---

## 5. UNIT TESTING

### 5.1 Stack
| Qatlam | Texnologiya |
|---|---|
| Frontend | Vitest + @testing-library/react |
| Backend (Deno) | Deno built-in test runner |

### 5.2 Test fayl joylashuvi
```
features/tasks/__tests__/
  tasksApi.test.ts
  useTasks.test.ts
  TaskCard.test.tsx
```

### 5.3 Coverage maqsad
| Qatlam | Target |
|---|---|
| Domain | 100% |
| Application | 80%+ |
| Infrastructure | 70%+ |
| Presentation | 60%+ |

---

## 6. NAMING KONVENSIYASI

| Element | Pattern | Misol |
|---|---|---|
| Feature hook | `use{Domain}` | `useTasks` |
| Repository class | `{Domain}ApiRepository` | `TaskApiRepository` |
| Use case fn | `{verb}{Domain}UseCase` | `createTaskUseCase` |
| Domain type | PascalCase | `Task`, `TaskStatus` |
| Test file | `{subject}.test.ts(x)` | `tasksApi.test.ts` |

---

## 7. ANTI-PATTERNLAR (QILMANG)

| Anti-pattern | O'rniga |
|---|---|
| `task: any` parametrlar | `CreateTaskInput` typed interfeys |
| 500+ qatorlik sahifalar | Logikani hookga, UI ni componentga |
| Route handlerda 50+ qator logika | Service / use case |
| Test yo'q feature | `__tests__/` papka + kamida 3 test |

---

*ARCHITECTURE.md — AI Business Concierge v1.0 · 2026-05-05*
