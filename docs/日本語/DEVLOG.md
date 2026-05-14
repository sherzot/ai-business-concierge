# 開発ログ — AI Business Concierge

プロジェクト開発履歴、完了した作業、遭遇したエラーとその解決策。

> **翻訳（同期更新）：** [ウズベク語（メイン）](../DEVLOG.md) · [English](../English/DEVLOG.md) · [Russian](../Russian/DEVLOG.md) · [Uzbek](../Uzbek/DEVLOG.md)
>
> **プロトコル（CLAUDE.md §...）：** すべての変更はここおよび 4 言語の翻訳に記録される。

---

## 2026-05-14 — スケール基盤：AI コスト追跡 + doc_chunks RAG + R-016..R-020

### コンテキスト

`docs/ai-business-concierge-scale-prompt.md`（2026-05-11）の「至急」項目を実装。Phase 1.5 の状態を監査し、残った急務を解消。

### 実施内容

**1. DB マイグレーション `20260514000000_ai_usage_and_doc_vector.sql`：**
- `ai_usage_logs` テーブル — 各 AI 呼び出し：tenant, user, endpoint, model, provider, complexity, prompt/completion トークン, cost_usd, cached, latency, trace_id。Generated カラム `total_tokens`。3 つのインデックス。テナント分離 RLS + super_admin/sub_admin はすべて閲覧可。
- `v_ai_usage_summary` ビュー — テナント別日次集計（Admin ダッシュボード用）。
- `doc_chunks.embedding vector(1536)` カラム — pgvector RAG 用。
- HNSW インデックス `doc_chunks_embedding_idx`（m=16, ef_construction=64）。
- `match_documents(query_embedding, threshold, count, tenant_id)` 関数 — RAG 検索、security definer、search_path 固定、authenticated/service_role のみ実行可。
- `doc_chunks` に document_id と tenant_id インデックス追加。

**2. REQUIREMENTS.md 更新：**
- R-016 HR 候補者分析（スケルトンあり、Phase 2 で本格実装）。
- R-017 AI レート制限（部分的 — in-memory `contactRateMap` + Telegram の日次制限）。
- R-018 AI コスト追跡（マイグレーション完了 — バックエンド連携は次セッション）。
- R-019 ベクトル検索 RAG（マイグレーション完了 — バックエンド統合は次セッション）。
- R-020 Admin Dashboard（super_admin/sub_admin：health, contacts, AI chat — Phase 4 拡張）。

**3. 既存状態の確認：**
- Phase 1.5 — 5 つのマイグレーション適用済み：contact_requests, tenant_company_info, roles_update (sub_admin/company_admin/accountant/manager), employee_profiles, employee_invites。
- バックエンド admin エンドポイント完備：`/admin/contacts`, `/admin/health`, `/admin/ai/chat`, `/admin/contacts/:id/status`, `/admin/tenants/:id/status`。
- フロントエンド admin ページ実装済み：`AdminContactsPage`, `AdminHealthPage`, `AdminAIChatPage` + `adminApi.ts`。
- docs/ 構成正常：`English/`, `Russian/`, `Uzbek/`, `日本語/` — 各フォルダに DEVLOG.md と他翻訳。

### 延期

- Prompt caching ミドルウェア（scale-prompt タスク 1.2）— Phase 1.5 仕上げ。
- HR Candidate Analysis 本格実装 — Phase 2（PLAN.md v3.0 通り）。
- バックエンド連携：`/v1/ai/chat` から `ai_usage_logs` への INSERT — 次セッション（services/llm-router.ts から使用量取得）。
- `match_documents()` を `POST /v1/docs/search` に接続 — 次セッション。
- 完全な admin debug/log UI（Sentry リアルタイム、クエリ EXPLAIN）— Phase 4。

### ファイル
- `supabase/migrations/20260514000000_ai_usage_and_doc_vector.sql`（新規）
- `docs/REQUIREMENTS.md`（R-016..R-020 追加）
- `docs/DEVLOG.md`（このエントリ）
- `docs/{English,Russian,Uzbek,日本語}/DEVLOG.md`（同期翻訳）

### 理由

`ai_usage_logs` がないと請求（Phase 2）が機能しない — テナント単位でコストを配分できない。`match_documents()` がないと AI Concierge の「自分のドキュメントを検索」ツールが `ILIKE` フォールバック — 結果品質が低い。

---

## 2026-05-06 — Phase 1.5 (4): B-027/B-028/B-029

### 変更内容

**B-027 — HR向けIn-appリアルタイム通知:**
- `createHrSetupCompleteNotification` — 従業員のセットアップ完了時にHR/リーダーへ通知
- `createEmployeeConfirmedNotification` — HRが従業員を承認した時に従業員へ通知
- `useRealtimeNotifications` フック — Supabase realtimeで`notifications`テーブルを購読
- `NotificationsDropdown` — `userId` propsを受け取り、新規通知時に自動更新（ポーリングなし）

**B-028 — /admin/health（システムモニタリング）:**
- バックエンド: `GET /admin/health` — super_adminのみ; DBレイテンシ + テナント/ユーザー/連絡先/通知の統計
- フロントエンド: `AdminHealthPage` — 統計カード、DBレイテンシバナー（緑/琥珀）、更新ボタン; ルート: `/admin/health`

**B-029 — /admin/ai-chat（管理者AIチャット）:**
- バックエンド: `POST /admin/ai/chat` — super_adminのみ; Claude + OpenAIフォールバック; ライブプラットフォーム統計をコンテキストに
- フロントエンド: `AdminAIChatPage` — チャットUI、タイピングインジケーター、提案チップ、ロケール対応; ルート: `/admin/ai-chat`
- `adminApi.ts` — `getAdminHealth()` + `sendAdminAIMessage()` APIヘルパー

---

## 2026-05-06 — Phase 1.5 (3): B-026 メールテンプレート（7件）

**7件のメールテンプレート（Resend API、ダークインディゴテーマ）:**
1. `company_invite` — 既存（管理者連絡先 → invite_sent）
2. `company_registered_pending` — POST /register/company → リーダーへ「管理者承認待ち」
3. `company_rejected` — PATCH /admin/contacts/:id/status → status=rejected → 連絡先へメール
4. `company_approved` — 新規 PATCH /admin/tenants/:id/status → status=active → リーダーへメール
5. `employee_invite` — POST /members → mode=invite → ブランドメールを従業員へ（Supabaseに加えて）
6. `employee_welcome` — POST /auth/setup-complete → 「ようこそ、アカウントの準備ができました」
7. `admin_new_registration` — POST /register/company → ADMIN_NOTIFY_EMAILへ通知

**新規環境変数:** `ADMIN_NOTIFY_EMAIL`
**新規エンドポイント:** `PATCH /admin/tenants/:id/status`

---

## 2026-05-06 — Phase 1.5 (2): テキスト修正 + 言語セレクター

- `landing/i18n.ts` — 「ChatGPTはこれを知らない。」フレーズを削除
- `app/i18n.ts` — `auth.platformSubtitle`キーを4言語で追加
- `LoginPage.tsx`, `LandingNavbar.tsx`, `LanguageSwitcher.tsx` — ボタングループ → `<select>`ドロップダウンに変更

---

## 2026-05-05 — Phase 1: Telegramボット

**アーキテクチャ（Clean Architecture / DDD）:**
- `supabase/functions/telegram-bot/` — Edge Function
- `handlers/` — start, help, language, message, feedback, stats, media
- `services/` — session.ts, maslahatchi.ts

**ボット機能:**
- 4言語: uz / ru / en / ja
- `/start`, `/help`, `/language`, `/stats`
- レート制限: 5リクエスト/日（無料プラン）
- LLMルーター: Haiku 3.5（~80%）+ Sonnet 4.6（~20%）
- KBセマンティック検索: pgvector + OpenAI text-embedding-3-small

**ベータモニタリング:**
- `v_beta_stats`, `v_beta_daily_activity`, `v_beta_feedback`, `v_beta_model_usage`

---

## 2026-05-05 — デプロイ: エラーと解決策

### ❌ 401 Unauthorized（Webhook）
**原因:** Supabase JWT検証がWebhookリクエストをブロックしていた。
**解決策:** `supabase/config.toml`に追加:
```toml
[functions.telegram-bot]
verify_jwt = false
```

### ❌ TELEGRAM_WEBHOOK_SECRET が見つからない
**原因:** シークレットが設定されていなかったが、コードが確認していた。
**解決策:** シークレットチェックを削除 — Webhook認証は不要。

### ❌ CLAUDE_ERROR:400 credit balance too low
**原因:** Anthropic APIクレジットなし。
**ステータス:** ユーザーがクレジットを追加する必要あり（$5+）。ボットは応答できない。

### ❌ OpenAI 429 insufficient_quota
**原因:** KBシードスクリプトがOpenAI埋め込みAPIを呼び出したが、クォータなし。
**ステータス:** Anthropicと同時に解決予定。`scripts/seed_kb.ts`準備完了（53エントリー）。

### ❌ /stats が機能しない
**原因:** `ADMIN_CHAT_ID`シークレットが設定されていなかった。
**解決策:** `supabase secrets set ADMIN_CHAT_ID="6132360728"`

---

## 2026-05-06 — ボットUX改善

1. **テキスト以外のメッセージ** — `handlers/media.ts` — 画像、音声、ファイル、スタンプ → 「テキストのみ送信してください」
2. **再訪ユーザーの `/start`** — 「おかえりなさい！」をユーザーの言語で表示、キーボードは表示しない
3. **残りリミット表示** — `📊 今日の残り: X/5リクエスト`を各応答に追加
4. **フィードバック言語修正** — 以前は`"uz"`にハードコード、現在は`getOrCreateSession`から実際のロケールを取得

---

## 2026-05-06 — 言語システム（ロケール）修正

### DBチェック制約 — 根本原因
**原因:** `ai_conversations.locale`制約: `CHECK (locale IN ('uz', 'ru', 'en'))` — 「ja」が欠けていた！
**解決策:** マイグレーション追加: `CHECK (locale IN ('uz', 'ru', 'en', 'ja'))`

### uz/ruのみの免責事項
**原因:** `knowledge-base.ts`に免責事項が2件しかなかった。
**解決策:** 4件の免責事項を追加、`addDisclaimerIfNeeded`を拡張。

### `llm-router.ts`のデフォルトシステムプロンプト
**原因:** フォールバック `locale === "ru" ? RU : UZ` — 英語/日本語ユーザーがウズベク語のシステムプロンプトを受け取っていた。
**解決策:** 全4言語のデフォルトシステムプロンプトを追加。

---

## 2026-05-06 — Phase 1.5 (1): DBマイグレーション + ランディングページ

### DB — 5件のマイグレーション適用済み ✅

| マイグレーション | 内容 |
|---|---|
| `phase15_contact_requests` | 企業問い合わせCRMテーブル + RLS（管理者のみ）|
| `phase15_tenant_company_info` | `tenants`に追加: ステータス、納税者番号、法的情報、銀行、承認 |
| `phase15_roles_update` | `user_tenants`に追加: sub_admin、company_admin、accountant、manager + status/position |
| `phase15_employee_profiles` | 完全なHRデータテーブル（パスポート、JSHSHIR、給与、緊急連絡先）|
| `phase15_employee_invites` | 一回限りの招待トークンテーブル（24時間TTL、再送回数）|

---

## キー情報

| パラメーター | 値 |
|-------------|-----|
| Supabase プロジェクトref | `ufhepwdkjqptjvxrmpjn` |
| ボットユーザー名 | `@ai_business_concierge_bot` |
| 管理者チャットID | `6132360728` |
| LLMルーター | Haiku 3.5（シンプル）+ Sonnet 4.6（複雑）|
| 埋め込みモデル | `text-embedding-3-small`（OpenAI）|
| レート制限 | 5リクエスト/日（無料）|
| 言語フォールバック（KB）| `ja` → `en`（KBはuz/ru/enのみカバー）|
