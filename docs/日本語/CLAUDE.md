# CLAUDE.md — AI Business Concierge

> Claude Codeのためのプロジェクトコンテキストとルール
> 各セッションの開始時にこのファイルを読んでください
> バージョン: 2.0 | 更新: 2026-04-16

---

## プロジェクトについて

AI Business Concierge — ウズベキスタンで**すでに営業中の**中小企業オーナー向けの**日常的な業務管理**AIアシスタント。

**キーポジション:** 銀行のAIソリューション（SQBなど）はビジネスを「始める」のを助けます。私たちはビジネスを「運営する」のを助けます — 365日、毎日。

**3つのモジュール:**
1. **AIアドバイザー** — 税務/ビジネス/人事の質問（Knowledge Base + Claude）
2. **AIドキュメントメーカー** — 契約書/申請書/命令書の生成（PDF/DOCX）
3. **AI販売ボット** — Telegram販売ボットの作成と管理

**プラットフォーム:** Telegramボット（70%のトラフィック、主要）+ Webダッシュボード（25%）+ 管理パネル（5%）

---

## 技術スタック

- **フロントエンド:** React 18 + TypeScript + Vite + Tailwind CSS + Radix UI
- **バックエンド:** Supabase Edge Functions（Deno）+ Hono framework
- **データベース:** Supabase PostgreSQL + pgvector（knowledge base）
- **認証:** Supabase Auth（マルチテナント）
- **AI:** Claude Haiku 3.5（シンプル、80%）+ Claude Sonnet 4（複雑、20%）
- **Telegram:** grammY framework（Deno）
- **決済:** Click API + Payme API
- **ドキュメント:** pdf-lib（PDF）+ docx（DOCX）
- **ホスティング:** Netlify（フロントエンド）+ Supabase（バックエンド）
- **モニタリング:** Sentry

---

## アーキテクチャ（2026-05-05以降）

> 完全なルールとパターン: `docs/ARCHITECTURE.md`

**フロントエンド — Feature Slice + Clean Architecture:**
```
features/{domain}/
  types.ts          ← 完全なエンティティ + value objects
  api/*.ts          ← 型付き（no 'any'）
  hooks/use{D}.ts   ← すべての状態 + ロジック（ViewModel）
  components/       ← Pure UI（dumb）
  pages/*Page.tsx   ← Thin: hookとrenderのみ（最大~100行）
  __tests__/        ← 最低3テスト
```

**バックエンド — Layered Hono:**
```
server/
  middleware/auth.ts、tenant.ts
  presentation/routes/            ← Thin handlers（最大20行）
  application/services/{domain}/  ← hr-candidate 参考実装
  domain/types.ts
```

**ユニットテストスタック:** Vitest + @testing-library/react + @testing-library/jest-dom

---

## ロールアーキテクチャ

```
システムレベル:
  super_admin ≡ sub_admin  (同一権限)

会社レベル（テナント内）:
  company_admin  → 自社の完全な管理
  hr             → 従業員アカウントの作成 + 承認
  accountant     → 財務 + 税務書類
  manager        → 自部署のタスクと結果
  employee       → 制限付き
```

---

## 重要なルール

### 一般
1. **TypeScript strict mode** — `strict: true`は常に
2. **Zod** — すべてのAPI入出力のバリデーション
3. **RLS** — すべての新規テーブルにRow Level Security必須
4. **言語** — すべてのUI文字列はi18n経由（uz、ru、en、ja）
5. **既存コードを壊さない** — 新機能追加時に既存の機能が継続して動作すること

### AIルール
1. **ハルシネーション防止** — AIはknowledge baseのデータのみを使用
2. **信頼度スコアリング** — すべてのAI応答に信頼度レベル
3. **免責事項** — 「これはAIによるアドバイスであり、専門家のアドバイスの代わりにはなりません」

### LLMルーターロジック
- **simple** → Claude Haiku 3.5、500トークン
- **document** → Claude Sonnet 4、2000トークン
- **analysis** → Claude Sonnet 4、1500トークン
- **default** → Claude Haiku 3.5、800トークン

---

## コミットルール

```
type(scope): description
```
スコープ: `telegram`、`ai`、`docs`、`sales-bot`、`billing`、`admin`、`auth`、`ui`、`db`、`api`

---

## 環境変数

### フロントエンド (.env)
```
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_API_BASE_URL=
VITE_SENTRY_DSN=
VITE_APP_URL=
```

### バックエンド（Supabaseシークレット）
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
TELEGRAM_BOT_TOKEN=
CLICK_MERCHANT_ID=
PAYME_MERCHANT_ID=
RESEND_API_KEY=
OPENAI_API_KEY=
```

---

## 必須SESSION LIFECYCLE

毎sessionでcode/documentationを変更する前に:

1. `docs/README.md`を読む。
2. `docs/STATUS.md`を完全に読む。
3. `docs/DEVLOG.md`先頭の最新entryを読む。
4. `docs/PLAN.md`でscope対象のactive taskを確認。
5. `git status --short`を実行しuser changesを保持。

Material changeを完了と宣言する前にDEVLOG protocolを実行しSTATUS/PLANを更新する。Capability、phase、architectureが変わった場合は該当documentも同期する。完全なrepo rule: `AGENTS.md`。

---

## DEVLOGプロトコル（§DEVLOG）

**ルール：** すべての重要な変更（新機能、バグ修正、マイグレーション、アーキテクチャ決定、デプロイエラー）は**4つのファイルに同時に**記録しなければならない：

1. `docs/DEVLOG.md` — メイン（ウズベク語、詳細）
2. `docs/English/DEVLOG.md` — 英語訳
3. `docs/Russian/DEVLOG.md` — ロシア語訳
4. `docs/日本語/DEVLOG.md` — 日本語訳

**フォーマット：**
```
## YYYY-MM-DD — 短い説明

### コンテキスト
どんな問題があったか、または何が必要だったか。

### 実施内容
- 具体的な変更のリスト

### ファイル
- `path/to/file`（新規/変更）
```

**同期チェック：** 各セッション終了時、すべての4つのDEVLOG.mdの最新エントリが同じ日付であること。差異があれば — すぐに翻訳を追加すること。

---

## 常時リマインダー

- **マイグレーション** — DBの変更はマイグレーションファイル経由のみ
- **テスト** — 新しいAPIエンドポイント = 新しいテスト
- **i18n** — 新しいUI文字列 = uz + ru + en + jaの翻訳
- **モバイル** — すべてのUI変更はモバイルで確認
- **DEVLOG** — すべての重要な変更は4つのDEVLOG.mdに記録する（§DEVLOGを参照）
- **競合** — SQBは競合ではなくファネル。私たちは日常の運営、彼らはスタートアップフェーズ。
