# ARCHITECTURE.md — AI Business Concierge

> プロジェクトアーキテクチャ、設計パターン、ユニットテストルール
> バージョン: 1.2 | 更新: 2026-08-11
>
> Current runtime statusは[STATUS.md](STATUS.md)。`hr-candidate` foldersはTODO/stub logicを含むmodular scaffoldであり、production-ready referenceではない。

---

## 1. 全体アーキテクチャ

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

**ルール:** 各レイヤーは自分自身または下位レイヤーのみインポートできます。下位レイヤーは上位レイヤーを知らない。

### 1.1 Deliveryとenvironmentの境界

- 有効なhosting pathは`GitHub -> Netlify`のみ。Vercelはruntime、preview、deployment platformとして使用しない。
- Netlifyの`production` contextはproduction Supabase projectのみに接続する。
- `deploy-preview`、`branch-deploy`、`dev` contextは別のstaging Supabase projectへ接続し、production project ref、key、secret、実データを使用しない。
- Supabase FreeにはBranchingがないため、stagingは別projectとする。Schemaはversioned migrationのみで同期し、test dataはsynthetic seedで作成する。
- `validate:deploy-env` build guardはcontext/project不一致時にfail-closedで停止する。CSPは選択したproject refからbuild時に生成する。

### 1.2 AI文書作成private binary境界

- PDF/DOCXは`bright-api`内だけで生成する。Browserはbinaryを生成せず、Supabase Storageへdirect CRUDしない。
- Binaryはprivate `generated-documents`のimmutable `<tenant>/<user>/documents/<document-id>/document-<storage-version>.<pdf|docx>` pathへ保存する。`storage_path` CASがparallel exportをserializeし、publishは5分provisional leaseを取得、URL signing後に`download_expires_at`を65秒へpinする。`documents.row_version`はedit/export/deleteのCAS boundaryで、旧objectは新metadata/document commit後だけ削除。Legacy pathsはread可能、restrictive policyがdirect browser accessを遮断する。
- `bright-api`はactive tenant membershipを確認する。GenerateはO(n) PDF wrappingでbinaryを準備してからdocument DB rowをpublish。Downloadは60秒signed URLのみ。Exportはeditable contentから再生成し、delete/compensationはDB-first後にprivate objectをcleanupする。
- Pinned Noto Sans JP OTFをSHA-256検証し4言語をcoverする。PDFへfull embed、DOCXへobfuscated `.odttf`としてembedし、private `document-assets`へcacheする。

---

## 2. フロントエンドアーキテクチャ

### 2.1 Feature Slice + Clean Architecture

各フィーチャーには4つのレイヤーが必要です:

```
features/
  {domain}/
    types.ts              # Domain: Entity + Value Object + Interfaceの定義
    api/                  # Infrastructure: サーバーとの通信
      {domain}Api.ts
    hooks/                # Application: ViewModel
      use{Domain}.ts
    components/           # Presentation: Pure UIブロック
      {Domain}Card.tsx
      {Domain}Form.tsx
    pages/                # Presentation: Thin routingシェル
      {Domain}Page.tsx
    __tests__/
      {domain}Api.test.ts
      use{Domain}.test.ts
      {Domain}Card.test.tsx
```

### 2.2 レイヤーの責務

#### `types.ts` — Domainレイヤー
```typescript
// ✅ 正しい: 完全なエンティティ + value objects
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string | null;
};
export type CreateTaskInput = Omit<Task, 'id'>;

// ❌ 誤り: 空のplaceholder
export type Task = { id: string };
```

#### `api/` — Infrastructureレイヤー
```typescript
// ✅ 正しい: 型付き、no 'any'
export async function createTask(tenantId: string, input: CreateTaskInput): Promise<Task>

// ❌ 誤り: any型の使用
export async function createTask(tenantId: string, task: any)
```

#### `hooks/` — Applicationレイヤー
```typescript
// ✅ 正しい: すべての状態+ロジックをhookに
export function useTasks(tenantId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  return { tasks, loading, error, create, remove };
}
```

#### `pages/` — Presentationレイヤー
```typescript
// ✅ 正しい: hookとrenderのみ
export function TasksPage({ tenant }: { tenant: TenantAssignment }) {
  const { tasks, loading, error, create } = useTasks(tenant.id);
  if (loading) return <Spinner />;
  return <TaskBoard tasks={tasks} onCreate={create} />;
}
```

---

## 3. バックエンドアーキテクチャ（Hono + Deno）

### 3.1 フォルダ構造

```
supabase/functions/server/
  domain/types.ts
  application/
    services/
      llm-router.ts
      knowledge-base.ts
      hr-candidate/        ← SKELETON structure; TODO/stubが残る
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

### 3.2 Route Handler — Thinの原則

```typescript
// ✅ 正しい: handlerはHTTPのみ、ロジックはserviceに
router.post("/tasks", authMiddleware, tenantMiddleware, async (c) => {
  const body = await c.req.json();
  const task = await createTaskUseCase(c.var.tenantId, body);
  return c.json({ data: task });
});
```

---

## 4. 設計パターン

### 4.1 Repositoryパターン
```typescript
export interface ITaskRepository {
  findAll(tenantId: string): Promise<Task[]>;
  create(tenantId: string, input: CreateTaskInput): Promise<Task>;
}
```

### 4.2 Strategyパターン — LLMルーター
```typescript
// simple → Haiku、document → Sonnet、analysis → Sonnet
const complexity = classifyComplexity(message);
const model = selectModel(complexity);
```

### 4.3 Observerパターン — Realtime
```typescript
supabase.channel('tasks').on('postgres_changes', ...).subscribe();
```

### 4.4 Facadeパターン — apiClient
```typescript
apiRequest<Task[]>("/tasks", { tenantId });
```

---

## 5. ユニットテスト

### 5.1 スタック
| レイヤー | 技術 |
|---|---|
| フロントエンド | Vitest + @testing-library/react + @testing-library/jest-dom |
| バックエンド（Deno）| Deno組み込みテストランナー |

### 5.2 テストファイルの場所
```
features/tasks/__tests__/
  tasksApi.test.ts
  useTasks.test.ts
  TaskCard.test.tsx
```

### 5.3 カバレッジ目標
| レイヤー | 目標 |
|---|---|
| Domain | 100% |
| Application | 80%+ |
| Infrastructure | 70%+ |
| Presentation | 60%+ |

---

## 6. 命名規則

| 要素 | パターン | 例 |
|---|---|---|
| Feature hook | `use{Domain}` | `useTasks` |
| Repositoryクラス | `{Domain}ApiRepository` | `TaskApiRepository` |
| Use case関数 | `{verb}{Domain}UseCase` | `createTaskUseCase` |
| Domainタイプ | PascalCase | `Task`、`TaskStatus` |
| テストファイル | `{subject}.test.ts(x)` | `tasksApi.test.ts` |

---

## 7. アンチパターン（やってはいけないこと）

| アンチパターン | 代わりに |
|---|---|
| `task: any`パラメータ | `CreateTaskInput`型付きインターフェース |
| 500行超のページ | ロジックをhookへ、UIをcomponentへ |
| route handlerに50行超のビジネスロジック | service / use case |
| テストのないフィーチャー | `__tests__/`フォルダ + 最低3テスト |

---

*ARCHITECTURE.md — AI Business Concierge v1.0 · 2026-05-05*
