# ARCHITECTURE.md — AI Business Concierge

> Архитектура проекта, паттерны проектирования и правила unit-тестирования
> Версия: 1.3 | Обновлено: 2026-08-21
>
> Текущий runtime-статус находится в [STATUS.md](STATUS.md). Папки `hr-candidate` — modular scaffold с TODO/stub logic, а не production-ready эталон.

---

## 1. ОБЩАЯ АРХИТЕКТУРА

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

**Правило:** Каждый слой может импортировать только себя или нижестоящий слой. Нижний слой не знает о верхнем.

### 1.1 Граница delivery и environments

- Активный hosting path — только `GitHub -> Netlify`; Vercel не используется как runtime, preview или deployment platform.
- Контекст Netlify `production` подключается только к production-проекту Supabase.
- Контексты `deploy-preview`, `branch-deploy` и `dev` подключаются к отдельному staging-проекту Supabase; production project ref, keys, secrets и реальные данные запрещены.
- В Supabase Free нет Branching, поэтому staging — отдельный project. Схема синхронизируется только versioned migrations, а тестовые данные создаются synthetic seed.
- Build guard `validate:deploy-env` fail-closed останавливает сборку при несовпадении context/project. CSP генерируется во время build из выбранного project ref.

### 1.2 Private binary boundary AI Документолога

- PDF/DOCX генерируются только внутри `bright-api`; browser не создаёт binary и не выполняет direct Supabase Storage CRUD.
- Binary хранятся в private `generated-documents` по immutable path `<tenant>/<user>/documents/<document-id>/document-<storage-version>.<pdf|docx>`. `storage_path` CAS сериализует parallel exports; publish получает 5-minute provisional lease и pin `download_expires_at` на 65 секунд после URL signing. `documents.row_version` — CAS boundary для edit/export/delete; прежний object удаляется только после commit новой metadata/document. Legacy paths читаются, restrictive policy блокирует direct browser access.
- `bright-api` проверяет active tenant membership. Generate готовит binary с O(n) PDF wrapping до публикации document DB row. Download выдаётся через 60-second signed URL; export регенерирует editable content, delete и compensation выполняются DB-first и затем cleanup private object.
- Pinned Noto Sans JP OTF проверяется SHA-256, покрывает 4 языка, полностью embedded в PDF, как obfuscated `.odttf` в DOCX и cached в private `document-assets`.

### 1.3 Граница polishing AI Документолога

- Browser отправляет current editable draft и инструкцию user через tenant-scoped `POST /docs/:id/polish`; `bright-api` сначала проверяет принадлежность document активному tenant.
- Model output автоматически в DB не сохраняется. Frontend применяет его только как preview edit textarea, а существующий optimistic document update выполняется лишь после нажатия **Сохранить**. Если draft revision изменился во время request, поздний AI result не применяется; modal ограничен коротким viewport и использует internal scroll.
- System prompt отделяет document title/content как untrusted data. Tenant scope, полный prompt и effective output-token budget входят в SHA-256 cache key; общий document chat использует 2,000-token default, а polishing явно запрашивает 8,000.
- Raw document, output и instruction text не пишутся в observability storage; interaction log хранит только длину instruction. Provider tokens/cost учитываются до output validation. Authoritative polishing plan-quota check+increment выполняется одним atomic PostgreSQL statement в service-role-only `reserve_ai_request`; reservation возвращается, если provider call не завершился. Safety, DB-backed minute rate limit, four-locale standard error envelope и bounded timeout, покрывающий fetch и полный response-body parsing, применяются на provider boundary.

---

## 2. АРХИТЕКТУРА ФРОНТЕНДА

### 2.1 Feature Slice + Clean Architecture

В каждой фиче должно быть 4 слоя:

```
features/
  {domain}/
    types.ts              # Domain: Entity + Value Object + Interface
    api/                  # Infrastructure: Общение с сервером
      {domain}Api.ts
    hooks/                # Application: ViewModel
      use{Domain}.ts
    components/           # Presentation: Чистые UI-блоки
      {Domain}Card.tsx
      {Domain}Form.tsx
    pages/                # Presentation: Thin routing shell
      {Domain}Page.tsx
    __tests__/
      {domain}Api.test.ts
      use{Domain}.test.ts
      {Domain}Card.test.tsx
```

### 2.2 Ответственности слоёв

#### `types.ts` — Domain-слой
```typescript
// ✅ Правильно: полная сущность + value objects
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string | null;
};
export type CreateTaskInput = Omit<Task, 'id'>;

// ❌ Неправильно: пустой placeholder
export type Task = { id: string };
```

#### `api/` — Infrastructure-слой
```typescript
// ✅ Правильно: типизировано, no 'any'
export async function createTask(tenantId: string, input: CreateTaskInput): Promise<Task>

// ❌ Неправильно: использование any
export async function createTask(tenantId: string, task: any)
```

#### `hooks/` — Application-слой
```typescript
// ✅ Правильно: всё состояние + логика в хуке
export function useTasks(tenantId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  return { tasks, loading, error, create, remove };
}
```

#### `pages/` — Presentation-слой
```typescript
// ✅ Правильно: только hook + render
export function TasksPage({ tenant }: { tenant: TenantAssignment }) {
  const { tasks, loading, error, create } = useTasks(tenant.id);
  if (loading) return <Spinner />;
  return <TaskBoard tasks={tasks} onCreate={create} />;
}
```

---

## 3. АРХИТЕКТУРА БЭКЕНДА (Hono + Deno)

### 3.1 Структура папок

```
supabase/functions/server/
  domain/types.ts
  application/
    services/
      llm-router.ts
      knowledge-base.ts
      hr-candidate/        ← SKELETON structure; остаются TODO/stub
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

### 3.2 Route Handler — принцип тонкого слоя

```typescript
// ✅ Правильно: handler только HTTP, логика в сервисе
router.post("/tasks", authMiddleware, tenantMiddleware, async (c) => {
  const body = await c.req.json();
  const task = await createTaskUseCase(c.var.tenantId, body);
  return c.json({ data: task });
});
```

---

## 4. ПАТТЕРНЫ ПРОЕКТИРОВАНИЯ

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

## 5. UNIT-ТЕСТИРОВАНИЕ

### 5.1 Стек
| Слой | Технология |
|---|---|
| Frontend | Vitest + @testing-library/react + @testing-library/jest-dom |
| Backend (Deno) | Встроенный test runner Deno |

### 5.2 Расположение тестовых файлов
```
features/tasks/__tests__/
  tasksApi.test.ts
  useTasks.test.ts
  TaskCard.test.tsx
```

### 5.3 Цели покрытия
| Слой | Цель |
|---|---|
| Domain | 100% |
| Application | 80%+ |
| Infrastructure | 70%+ |
| Presentation | 60%+ |

### 5.4 Что НЕ тестировать
- **Внутренняя логика Supabase client** — ответственность Supabase
- **CSS/стили** — только интерактивность
- **Внутренние компоненты сторонних библиотек** — Radix UI, React Router

---

## 6. СОГЛАШЕНИЯ ОБ ИМЕНОВАНИИ

| Элемент | Паттерн | Пример |
|---|---|---|
| Feature hook | `use{Domain}` | `useTasks` |
| Repository class | `{Domain}ApiRepository` | `TaskApiRepository` |
| Use case fn | `{verb}{Domain}UseCase` | `createTaskUseCase` |
| Domain type | PascalCase | `Task`, `TaskStatus` |
| Test file | `{subject}.test.ts(x)` | `tasksApi.test.ts` |

---

## 7. АНТИ-ПАТТЕРНЫ (НЕ ДЕЛАЙТЕ)

| Анти-паттерн | Вместо |
|---|---|
| Параметры `task: any` | Типизированный интерфейс `CreateTaskInput` |
| Страницы с 500+ строками | Перенести логику в хуки, UI в компоненты |
| 50+ строк бизнес-логики в route handler | Service / use case |
| Фича без тестов | Папка `__tests__/` + минимум 3 теста |

---

*ARCHITECTURE.md — AI Business Concierge v1.0 · 2026-05-05*
