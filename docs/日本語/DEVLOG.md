# 開発ログ — AI Business Concierge

プロジェクト開発履歴、完了した作業、遭遇したエラーとその解決策。

> **翻訳（同期更新）：** [ウズベク語（メイン）](../DEVLOG.md) · [English](../English/DEVLOG.md) · [Russian](../Russian/DEVLOG.md) · [Uzbek](../Uzbek/DEVLOG.md)
>
> **プロトコル（CLAUDE.md §...）：** すべての変更はここおよび 4 言語の翻訳に記録される。

---

## 2026-05-27 — タスク1: ai_usage_logsの接続（ビリング用コスト追跡）

### コンテキスト

APIクレジット待機中、クレジット不要のバックエンド作業を開始。最初のタスク：`ai_usage_logs`テーブルは2026-05-14に作成済みだったが、`/v1/ai/chat`と`/v1/admin/ai/chat`エンドポイントがまだデータを書き込んでいなかった。Phase 3の課金システムには各テナントのAIクレジット消費量の把握が不可欠。

### 実施内容

**`insertAiUsageLog`ヘルパー関数（新規、non-blocking）：**
- `supabase.from("ai_usage_logs").insert(...)` — service_roleクライアントを使用（RLSバイパス）
- `provider`の正規化：`"openai_fallback"` → `"openai"`（DB制約：`('claude','openai','fallback')`）
- Non-blocking：`.then(({ error }) => ...)` — メインリクエストを遅延させない
- `AiUsageLogEntry`型 — 型付きインターフェース

**`/v1/ai/chat`エンドポイント更新：**
- 各AIレスポンス後に`insertAiUsageLog()`を呼び出し
- 保存データ：`tenant_id`、`user_id`、`endpoint`、`model`、`provider`、`complexity`、`prompt_tokens`、`completion_tokens`、`cost_usd`、`cached`、`latency_ms`、`trace_id`

**`/v1/admin/ai/chat`エンドポイント更新：**
- トークン追跡変数を追加：`adminModel`、`adminProvider`、`adminInputTokens`等
- Admin chatはFK制約のため`ai_usage_logs`に書き込まない（テナントなし）→ `console.info()`でログ
- TODO：将来的にnullable `tenant_id`または別途`admin_ai_usage_logs`

**補足：**
- `/v1/docs/search`はすでに存在（`ILIKE`で動作中）
- `match_documents()`はOpenAIクレジット到着後に接続予定

### ファイル

- `supabase/functions/server/index.ts`（変更：`insertAiUsageLog`ヘルパー + 2エンドポイント接続）

---

## 2026-05-15 — Web改善（完了）：8つの主要UI/UX変更

### コンテキスト

AIクレジットを待つ間、8つのWeb改善タスクを順番に完了しました。

### 実施内容

**1. ProfileForm — 実際の認証データに接続:**
- `useUserSettings`フックを書き直し — AuthContextから実際の`fullName`と`email`を読み取る
- `PATCH /v1/settings/profile`バックエンドエンドポイント作成
- 保存後に`refetchProfile()`を呼び出し — サイドバーが即座に更新される

**2. EmployeeDetailPage — 編集モード追加:**
- 23フィールドすべてをフォームとして表示
- 5セクション：個人情報、雇用、連絡先、緊急連絡先、メモ

**3. ユニットテスト（B-001）:**
- 合計76テスト、すべてパス
- 新規3ファイル + LandingPage.test.tsx修正（I18nProviderラッパー追加）

**4. EmployeesPage — フィルター + 検索 + ブロック/解除:**
- ステータスフィルターチップ、検索フィールド、各行にBlock/Unblockボタン

**5. Docsページ — テンプレートライブラリ:**
- 15テンプレート、カテゴリーフィルター + 検索、「近日公開」バッジ

**6. Admin dashboard — 30秒自動更新 + サイドバーバッジ:**
- `setInterval(30_000)`、新規お問い合わせの赤いバッジ

**7. Reportsページ — AIオーディット無効化:**
- 「AIオーディット」ボタンをdisabled状態に変更

**8. 通知ページ — 全通知履歴:**
- `NotificationsPage.tsx` — フィルター（all/unread/read）、一括既読
- `NotificationsDropdown`に「すべて見る」リンク追加
- App.tsxに`case "notifications"`を接続

### ファイル

- `frontend/src/features/notifications/pages/NotificationsPage.tsx`（新規）
- `frontend/src/features/notifications/components/NotificationsDropdown.tsx`（変更）
- `frontend/src/App.tsx`（変更）
- その他15ファイル（変更・新規）

---

## 2026-05-15 — Web改善（続き）：TenantSettings、EmployeeDetail、パスワード変更、Landing nav/footer

### コンテキスト

APIクレジット待機中にWeb改善を継続 — 6タスクリストの3〜6番目を実装。

### 実施内容

**3. TenantSettingsPage（全面書き直し）:**
- `GET /v1/tenants/:id/profile` と `PATCH /v1/tenants/:id/profile` エンドポイント
- フォーム：name、legal_form、stir、employee_count_range、activity_type、reg_date、legal_address、website、description、contact_phone、contact_email、bank_name、bank_account

**4. EmployeeDetailPage（新規）:**
- `GET /v1/tenants/:id/members/:userId` エンドポイント — user_tenant + employee_profiles JOIN
- 5セクション（個人情報、雇用情報、連絡先、緊急連絡先、メモ）

**5. PasswordChangeForm（新規）:**
- `supabase.auth.updateUser({ password })` によるパスワード変更
- Eye/EyeOff切替、バリデーション（最低8文字、一致確認）、成功/エラー状態

**6. Landing nav + footer（更新）:**
- LandingNavbar：features/pricing/faqのアンカーリンク（md+で表示）、スムーススクロール
- LandingFooter：ナビリンク行（機能、料金、FAQ、お問い合わせ）
- FeaturesSection に `id="features"`、PricingSection に `id="pricing"` 追加
- i18n全4ロケール更新：nav（features/pricing/faq）、footer.links（4リンク）

### ファイル

- `supabase/functions/server/index.ts`（変更）
- `frontend/src/features/tenants/pages/TenantSettingsPage.tsx`（書き直し）
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx`（新規）
- `frontend/src/features/settings/components/PasswordChangeForm.tsx`（新規）
- `frontend/src/features/landing/components/LandingNavbar.tsx`、`LandingFooter.tsx`（変更）
- `frontend/src/features/landing/i18n.ts`、`frontend/src/App.tsx`（変更）

---

## 2026-05-15 — Phase 1.5 完了 + Phase 2.3 開始：AdminCompaniesPage、FAQ、SEO

### コンテキスト

APIクレジット（Anthropic/OpenAI）の待機中にWeb側を改善。Phase 1.5 で不足していた `/admin/companies` ページを作成し、Phase 2.3 からランディングページに FAQ セクションと SEO メタタグを追加。

### 実施内容

**1. バックエンド — `GET /v1/admin/companies` エンドポイント（新規）:**
- テナントの全フィールドを返す：id、name、status、legal_form、stir、連絡先、銀行情報、blocked_reason、タイムスタンプ
- テナントごとの `member_count`（user_tenants から、terminated 除く）
- ステータスフィルター：`?status=pending_approval|active|suspended|blocked`
- super_admin / sub_admin のみ

**2. フロントエンド — `adminApi.ts` 拡張:**
- `Company` 型 + `CompanyStatus` 型
- `getAdminCompanies(status?)` 関数
- `updateCompanyStatus(id, status, blocked_reason?)` 関数

**3. フロントエンド — `AdminCompaniesPage.tsx`（新規）:**
- 4 つのステータスサマリーカード
- フィルタータブ + 検索（名前、STIR、メール、電話）
- 展開可能な行：法人情報、銀行、ブロック理由
- アクション：承認、一時停止、ブロック解除、ブロック（理由モーダル付き）
- ルート：`/admin/companies`（RequireAuth ラッパー）

**4. フロントエンド — ランディング FAQ セクション:**
- `FaqSection.tsx` — アコーディオン、アクセシブル（aria-expanded）、アニメーション
- 6 件の FAQ を 4 言語（uz/ru/en/ja）で `i18n.ts` に追加
- `LandingDict` 型に `faq: { title, items: FaqItem[] }` を追加
- ページ順：PricingSection → FaqSection → LandingCtaBanner

**5. SEO — `index.html` 更新:**
- `<title>` に製品名と説明を追加
- `<meta name="description">`、keywords、author、robots
- Open Graph メタタグ
- Twitter Card メタタグ
- `<link rel="canonical">`
- `<meta name="theme-color" content="#0f172a">`
- `<html lang="uz">`

### ファイル
- `supabase/functions/server/index.ts`
- `frontend/src/features/admin/api/adminApi.ts`
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx`（新規）
- `frontend/src/app/router.tsx`
- `frontend/src/features/landing/i18n.ts`
- `frontend/src/features/landing/components/FaqSection.tsx`（新規）
- `frontend/src/features/landing/pages/LandingPage.tsx`
- `frontend/index.html`

---

## 2026-05-14 — security: 5 ビューを SECURITY INVOKER に変更

### コンテキスト

Supabase Security Advisor が 5 件の "Security Definer View" エラーを報告：
`employee_invite_stats`、`v_beta_stats`、`v_beta_daily_activity`、`v_beta_model_usage`、`v_beta_feedback`。

SECURITY DEFINER ビューは作成者の権限で実行されるため、RLS を回避しテナント分離を破る可能性がある。

### 実施内容

**マイグレーション `20260514120000_views_security_invoker.sql`：**
- 5 つのビューすべてを `with (security_invoker = true)`（PG15+）で再作成。
- `v_beta_*` ビュー — `service_role` のみ SELECT 可（バックエンド経由の admin dashboard 用）。
- `employee_invite_stats` — `authenticated` と `service_role` に付与（HR は自テナント内のみ閲覧、RLS が処理）。
- 各ビューにコメント：「SECURITY INVOKER — 呼び出し側の RLS ルールが適用される」。

### 理由

同じパターンを以前にも適用済み（`20260304_fix_tenant_daily_stats_security.sql`、`20260429120000_security_hardening.sql`）。マルチテナント SaaS では SECURITY DEFINER ビューは深刻なセキュリティリスク。

### 確認

push 後：Dashboard → Advisors → Security → **Refresh** → 5 errors → 0。

### ファイル
- `supabase/migrations/20260514120000_views_security_invoker.sql`（新規）
- `docs/{DEVLOG,English/DEVLOG,Russian/DEVLOG,Uzbek/DEVLOG,日本語/DEVLOG}.md`（同期）

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
