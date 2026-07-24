# 開発ログ — AI Business Concierge

プロジェクト開発履歴、完了した作業、遭遇したエラーとその解決策。

> **翻訳（同期更新）：** [ウズベク語（メイン）](../DEVLOG.md) · [English](../English/DEVLOG.md) · [Russian](../Russian/DEVLOG.md)

## 2026-07-24 — プロジェクト再開監査とテスト復旧

### コンテキスト
ドキュメント、Git履歴、現在のコードを比較した。`DEVLOG.md`は2026-06-04で終了していたが、最新コードcommitは2026-06-12だった。

### 実施内容
- Landingテストで`LandingNavbar`と`HeroSection`用auth contextをmock化
- `npm run test:run`: 16/16 test files、89/89 tests成功
- `npm run build`: production build成功
- Phase 1.5完了、Phase 2 landing開始済み、HR Candidate Analysisは501 skeletonのままと確認
- Production Supabaseは`ACTIVE_HEALTHY`、Anthropic/OpenAI/Resend secretsの存在を確認
- `TELEGRAM_WEBHOOK_SECRET`不足を検出し、Telegram POST webhookが503になることを確認
- Frontend API fallbackを無効な`server/...`からcanonical `bright-api/...`へ修正
- Phase 2 AI書類メーカー開始: 15 template seed migration、template/generate API、動的frontend form、月次usage limit
- Migration driftを安全に整合し、ローカル`h003`/`m002`ファイルのtimestampをproduction historyに合わせた
- `h005_match_knowledge_tenant`と15 template seed migrationをproduction Supabaseへdeploy
- `bright-api` v69をdeployし、health smoke-testは`200`、保護されたtemplate endpointはauthなしで`401`
- 最終確認: 17/17 test files、92/92 tests、production build成功

### ファイル
- `frontend/src/features/landing/__tests__/LandingPage.test.tsx`
- `frontend/src/features/docs/`
- `frontend/src/app/config.ts`
- `supabase/functions/server/services/document-generator.ts`
- `supabase/migrations/20260724051655_seed_phase2_document_templates.sql`
- `docs/{DEVLOG,PLAN,ROADMAP,REQUIREMENTS}.md`および翻訳

---

## 2026-06-12 — Frontend UI・layout・themeの改善

### コンテキスト
Light/Clean SaaS移行後、landing、auth、admin、company dashboard全体の視覚的一貫性を改善した。作業はcommit `2ae377a`に含まれていたが、DEVLOGには未記録だった。

### 実施内容
- Landing sectionsと共通theme tokensを更新
- Admin/company layouts、sidebar/topbar、dashboard pagesを改善
- Loginおよびprotected routeのUI・ナビゲーション状態を改善

### ファイル
- `frontend/src/features/landing/`
- `frontend/src/features/admin/components/AdminLayout.tsx`
- `frontend/src/features/reports/`
- `frontend/src/features/auth/`
- `frontend/src/styles/theme-indigo-slate.css`

---

## 2026-06-04 — ライトテーマ移行完了 — push & deploy

### コンテキスト
前セッションでLight/Clean SaaSテーマ移行を開始したが、grep検証で`text-white`・`bg-slate-700/800/900`の残留を発見：AdminDashboardPage、AdminKnowledgeBasePage、AdminRiskPage、AdminCompaniesPage、AdminContactsPage。

### 実施内容
- `AdminDashboardPage.tsx`: 完全書き直し — StatCard値`text-white`→`text-slate-900`、SEV_CONFIGバッジをopacity変種から solid light（`bg-red-100 text-red-700`）へ、アイコンコンテナ`bg-*-500/15`→`bg-*-100`、dark:変種を全削除、更新ボタン`bg-slate-700`→`bg-white border`、DBステータスバナー`text-emerald-300`→`text-emerald-700`、スケルトン`bg-slate-200`
- `AdminKnowledgeBasePage.tsx`: カテゴリ/タグバッジ`bg-slate-700 text-slate-300`→`bg-slate-100 text-slate-600`、質問テキスト`text-white`→`text-slate-900`、削除モーダル`bg-slate-900`→`bg-white`
- `AdminRiskPage.tsx`: 空状態h2・スキャンテキスト`text-white`→`text-slate-900`、「該当なし」`text-white`→`text-slate-900`、ステータスフィルターアクティブボタン`bg-slate-700`→`bg-indigo-600`
- `AdminCompaniesPage.tsx` + `AdminContactsPage.tsx`: 見出し・カウント・フィルタータブ・検索・スケルトン・リスト・モーダル — すべてライトパレットへ移行
- ビルド確認：`✓ built in 3.14s` — エラーなし
- git pushでNetlifyデプロイ起動

### ファイル
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx`（完全書き直し）
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx`（変更）
- `frontend/src/features/admin/pages/AdminRiskPage.tsx`（変更）
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx`（変更）
- `frontend/src/features/admin/pages/AdminContactsPage.tsx`（変更）

---

## 2026-06-04 — Light/Clean Modern SaaSテーマへの全面移行

### コンテキスト
アプリは以前 `forcedTheme="dark"` でロックされ、全コンポーネントがハードコードされたダークカラーで記述されていた。ユーザーがNotion/Linear/Vercel風のライトクリーンデザインへの移行を要求した。

### 実施内容
- `AppProviders.tsx`: `forcedTheme="dark"` → `forcedTheme="light"` — 全 `dark:` Tailwindクラスが無効化
- `LoginPage.tsx`: 完全書き直し — 白背景、インディゴグラデーションの左ブランディングパネル、白いフォームカード
- 認証ページ3件（ForgotPassword、ResetPassword、SetupAccount）: ライトデザインに統一
- `AdminHealthPage.tsx`: ダークカード → 白カード、`shadow-sm` 追加
- `AdminAIChatPage.tsx`: チャット領域・バブル・入力欄をライトパレットに変換
- `AdminAuditPage.tsx`: アクションバッジ色修正、入力欄 → `bg-white`
- `AdminRiskPage.tsx`: SVGトラック `stroke="#e2e8f0"`、見出し `text-slate-900`
- `AdminKnowledgeBasePage.tsx`: 全入力欄 `bg-white text-slate-900`、モーダル → `bg-white`
- `AdminDashboardPage.tsx`: SVGハードコード色を全てライトモード用に変換

### ファイル
- `frontend/src/app/providers/AppProviders.tsx`
- `frontend/src/features/auth/pages/` (4ファイル)
- `frontend/src/features/admin/pages/` (6ファイル)

## 2026-06-04 — ダークモードとログインリダイレクトのバグ修正

### コンテキスト
1. 管理パネルとダッシュボードページが混乱した色で表示されていた — `dark:` Tailwindクラスは`.dark`親要素がないと適用されない。`ThemeProvider`が追加されていなかった。
2. super_adminがログイン中にLPに移動して「ログイン」ボタンを押すと、`/admin`ではなく`/app`にリダイレクトされていた。

### 実施内容
- `AppProviders.tsx` — `next-themes`から`ThemeProvider`を追加（`attribute="class"`、`defaultTheme="dark"`）— 自動的に`<html class="dark">`を設定し、すべての`dark:`クラスが正しく動作
- `LandingNavbar.tsx` — 「ログイン」ボタンが認証状態を確認：ログイン済みなら→`/admin`または`/app`、未ログインなら→`/login`
- `HeroSection.tsx` — 同様の修正

### ファイル
- `frontend/src/app/providers/AppProviders.tsx`（変更）
- `frontend/src/features/landing/components/LandingNavbar.tsx`（変更）
- `frontend/src/features/landing/components/HeroSection.tsx`（変更）

---

## 2026-06-03 — タスクモックデータのバグ修正（PATCH 500エラー）

### コンテキスト
`PATCH /tasks/t-2` → 500エラー。テナントに実タスクが存在しない場合、`GET /tasks`は`getMockTasks()`を返していた（`t-1`、`t-2`などの偽ID）。ユーザーがこれらの"タスク"を更新しようとすると、`t-2`がUUIDでないためPostgreSQLがタイプエラー（500）を発生させていた。

### 実施内容
- `server/index.ts` — `getMockTasks()`関数を削除；`GET /tasks`は空配列`[]`を返すように変更
- `bright-api`を再デプロイ（バージョン68）

### ファイル
- `supabase/functions/server/index.ts`（変更）

---

## 2026-06-03 — ContactフォームとRegisterフォームのバグ修正（2件）

### コンテキスト
`/contact`（ダブル`/v1`パスバグ）と`/register?token=...`（パスワードバリデーション＋エラーフォーマット不一致）の"Server error"を修正。両方とも本番環境でテスト済み。

### 実施内容

**バグ1：`/contact` → "Server error"（前セッション）：**
- `ContactPage.tsx` — ローカル`API_BASE` + `/v1/contact`がダブルパス`/v1/v1/contact`を生成。共有`API_BASE_URL`に変更
- `config.ts` — フォールバックURL更新
- `config.toml` — `[functions.server] verify_jwt = false`追加
- `bright-api`再デプロイ

**バグ2：`/register` → "Server error"（本セッション）：**
- **根本原因：** バックエンドの`password.length < 12`チェックが8〜11文字のパスワードを拒否；フロントエンドは`json?.error?.message`を読んでいたが`failure()`は`json.meta.errors[0].message`形式で返すため、すべてのエラーが"Server error"として表示されていた
- `server/index.ts:4543` — `< 12`を`< 8`に修正
- `RegisterCompanyPage.tsx` — 両方のエラーフォーマットをサポート
- `RegisterCompanyPage.tsx` — パスワード入力に`minLength={8}`追加
- `bright-api`再デプロイ

**招待メールが届かない（未解決）：**
- 原因：`RESEND_API_KEY`がSupabase Secretsに設定されていない
- 必要な対応：`supabase secrets set RESEND_API_KEY=re_xxx` + Resendで`aibizconcierge.uz`ドメインの認証

### ファイル
- `frontend/src/features/landing/pages/ContactPage.tsx`（変更）
- `frontend/src/features/landing/pages/RegisterCompanyPage.tsx`（変更）
- `frontend/src/app/config.ts`（変更）
- `supabase/config.toml`（変更）
- `supabase/functions/server/index.ts`（変更）

---

## 2026-06-03 — ダーク/ライトテーマ、管理者サイドバー拡張、ユーザー・AI統計ページ

### コンテキスト
全ダッシュボード（super_admin・企業）でのダーク/ライトテーマ完全対応；管理者サイドバーをグループ化ナビゲーションで再編成；super adminが全企業ユーザーを閲覧可能に；新AI統計ページ追加。

### 実施内容

**ダーク/ライトテーマ — 全ダッシュボード：**
- `AdminLayout.tsx` — 完全書き直し：新しい`NAV_GROUPS`グループ構造、全コンポーネントに`dark:`バリアント追加（sidebar、topbar、nav、tooltip、avatar、logout）
- `App.tsx` — 企業dashboardのsidebar、topbar、全リンク、`NavItem`コンポーネントを`dark:`バリアントで更新
- 全8件のadminページ — `dark:`クラス一括置換

**管理者サイドバー拡張：**
- ナビゲーションをグループ化：メイン、管理、モニタリング、コンテンツ
- 新メニュー：**ユーザー**（`/admin/users`）、**AI統計**（`/admin/ai-stats`）
- `Globe`アイコン（メインサイト用）、`PanelLeftOpen/Close`（折りたたみ用）
- 折りたたみモードのツールチップがダークモードで正しく表示

**新しいadminページ：**
- `AdminUsersPage.tsx` — 全プラットフォームユーザー表示：メール、氏名、企業、ロール（カラーbadge）、ステータス、日付；ロールフィルター、検索、ページネーション
- `AdminAiStatsPage.tsx` — AI利用分析：KPIカード、日次棒グラフ、モデル別内訳（プログレスバー）、上位企業；7/14/30/60/90日の期間選択

**バックエンド新エンドポイント：**
- `GET /admin/users` — `user_tenants` + `profiles` + `tenants`のjoin；super_admin/sub_adminのみ；500件制限

**ルーター更新：**
- `router.tsx` — `/admin/users`と`/admin/ai-stats`を追加

**APIレイヤー：**
- `adminApi.ts` — `AdminUser`型と`getAdminUsers()`関数を追加

### ファイル
- `frontend/src/features/admin/components/AdminLayout.tsx`（変更 — 完全書き直し）
- `frontend/src/App.tsx`（変更 — ダークモード + NavItem）
- `frontend/src/features/admin/pages/AdminUsersPage.tsx`（新規）
- `frontend/src/features/admin/pages/AdminAiStatsPage.tsx`（新規）
- `frontend/src/features/admin/api/adminApi.ts`（変更）
- `frontend/src/app/router.tsx`（変更）
- `supabase/functions/server/index.ts`（変更 — GET /admin/users）
- `frontend/src/features/admin/pages/*.tsx`（8ファイル — ダークモード）

---

## 2026-06-02 — RBAC、管理者ダッシュボード、ULTRAセキュリティ継続（H-008〜H-010）

### コンテキスト
前セッションからの継続：ログインリダイレクトのバグ修正、ロール権限の整備、管理者ダッシュボードへの新パネル追加、ULTRAセキュリティ監査の継続。

### 実施内容

**ログインリダイレクト修正：**
- `LoginPage.tsx` — `super_admin`/`sub_admin`は`/admin`へ、その他は`/app`へリダイレクト
- `ProtectedLayout.tsx` — 管理者ロールが直接`/app`にアクセスした場合も`/admin`へ戻す

**RBACロール拡張：**
- `types.ts` — `sub_admin`、`company_admin`、`manager`ロールを追加
- `index.ts` — 9つのロール全てに`ROLE_ACCESS`マップを完全定義

**管理者ダッシュボード新パネル：**
- `GET /admin/ai-stats` — AI利用統計エンドポイント（リクエスト数、トークン、コスト、モデル別、トップテナント）
- `AdminDashboardPage.tsx` — 2つの新パネル：
  - **セキュリティポスチャ** — 完了した18件の修正の視覚リスト（クリティカル/高/中）
  - **AIビジネス分析** — 日次コストグラフ + モデル別内訳 + トップ企業

**ULTRAセキュリティ監査（継続）：**
- **H-008** — 全APIレスポンスにセキュリティヘッダー追加：`X-Content-Type-Options`、`X-Frame-Options: DENY`、`Strict-Transport-Security`、`Content-Security-Policy: default-src 'none'`、`Permissions-Policy`
- **H-009** — 管理者の重要な変更操作に監査ログ追加：
  - `PATCH /admin/tenants/:id/status` → `admin.tenant.status_changed`を記録
  - `PATCH /admin/contacts/:id/status` → `admin.contact.status_changed`を記録
- **H-010** — Netlify SPAのセキュリティヘッダー（`netlify.toml`の`[[headers]]`セクション）：
  - CSP：`connect-src`でSupabaseとWSSを許可
  - HSTS、X-Frame-Options、Referrer-Policy、Permissions-Policy

**デプロイ：** `supabase functions deploy server`でEdge Functionをデプロイ済み。

### ファイル
- `frontend/src/features/auth/pages/LoginPage.tsx`（変更）
- `frontend/src/features/auth/components/ProtectedLayout.tsx`（変更）
- `frontend/src/features/auth/types.ts`（変更）
- `supabase/functions/server/index.ts`（変更 — ROLE_ACCESS, ai-stats, H-008, H-009）
- `frontend/src/features/admin/api/adminApi.ts`（変更）
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx`（変更）
- `netlify.toml`（変更 — H-010）

---

## 2026-06-02 — セキュリティ強化：14件の修正（コミット `fb5bde5`）

### コンテキスト
システムの包括的なセキュリティ監査を実施。合計14件の重大・中程度の脆弱性を特定し修正した。

### 実施内容

**クリティカル（K）：**
- **K-001** `getTenantContext()` — 未認証の `x-tenant-id` ヘッダーフォールバックを削除；JWT + DBメンバーシップ検証に置き換え
- **K-002** `/ai/chat` — `system_prompt` パラメータを拒否（プロンプトインジェクションベクターを閉鎖）
- **K-004** `frontend/config.ts` — ハードコードされたSupabase認証情報を削除；env vars未設定時はアプリが起動しない
- **K-005** `telegram-bot/index.ts` — `TELEGRAM_WEBHOOK_SECRET` が必須に；未設定時は503を返す
- **K-006** `docs/DEMO_USERS.md` — デモユーザーのパスワードをドキュメントから削除

**高（H）：**
- **H-001** CORS — ワイルドカード `*` を明示的なドメインリストに変更：`aibizconcierge.uz`、`netlify.app`、`localhost`
- **H-002** AIクォータ — `guardUsage()` + `recordUsage()` を `/ai/chat` に接続
- **H-004** `RequireRole.tsx` — 新規コンポーネント作成；`/admin` ルートをDB経由のロール検証で保護
- **H-005** `match_knowledge()` — `match_tenant_id` パラメータを追加；DBレベルでテナント分離を実現
- **H-006** Resend webhook — 署名検証を必須化；`RESEND_WEBHOOK_SECRET` 未設定時は503
- **H-007** `apiClient.ts` — anonキーフォールバックを削除；認証トークンがない場合はエラーをスロー

**中（M）：**
- **M-003** 招待トークン — 再送信のたびに新トークンを生成（旧トークンは無効化）
- **M-005** ハード削除 — `hr` ロールを除外；`leader/company_admin/super_admin` のみ実行可能
- **M-006** 通知既読化 — `tenant_id` フィルターを追加
- **M-008** パスワード最小長を8文字から12文字に引き上げ（3か所）

**手動対応（ユーザーが完了 ✅）：**
- Supabase anonキーをローテーション
- Netlify env varsを更新（`VITE_SUPABASE_PROJECT_ID`、`VITE_SUPABASE_ANON_KEY`）
- デモユーザーのパスワードをSupabase Authで更新

### ファイル
- `supabase/functions/server/index.ts`（変更）
- `supabase/functions/server/services/knowledge-base.ts`（変更 — H-005）
- `supabase/functions/telegram-bot/index.ts`（変更 — K-005）
- `frontend/src/app/config.ts`（変更 — K-004）
- `frontend/src/shared/lib/apiClient.ts`（変更 — H-007）
- `frontend/src/app/router.tsx`（変更 — H-004）
- `frontend/src/features/auth/components/RequireRole.tsx`（新規 — H-004）
- `docs/DEMO_USERS.md`（変更 — K-006）
- `supabase/migrations/20260602000000_h005_match_knowledge_tenant.sql`（新規 — H-005）

---

## 2026-06-02 — バグ修正：AdminRiskPage `color` クラッシュ、statusFilter、Netlify Node.js

### コンテキスト
Risk Scannerページ公開後、複数のランタイムエラーが発見された。NetlifyとローカルビルドでアセットハッシュÅが異なる問題もあった。

### 実施内容
- **AdminRiskPage `TypeError: Cannot read properties of undefined (reading 'color')`** — 原因：バックエンドの `findings` 配列に `status` フィールドがなく `STATUS_CONFIG[undefined]` がクラッシュ。修正：
  - `risk-scan.ts`：すべての `findings.push()` に `status: "open"` を追加
  - `AdminRiskPage.tsx`：`STATUS_CONFIG[finding.status] ?? STATUS_CONFIG["open"]` フォールバックを追加
- **`statusFilter` エラー** — `AdminContactsPage` と `AdminCompaniesPage` が `statusFilter` を送信していたが、APIは `filter` を期待していた。修正済み。
- **Netlify ハッシュ不一致** — ローカルのNode 22 vs NetlifyのNode 18でビルドハッシュが異なっていた。`netlify.toml` に `NODE_VERSION = "22"` を追加。
- **`frontend/.gitignore`** — `dist/` エントリを含め初めてコミット。

### ファイル
- `supabase/functions/server/routes/risk-scan.ts`（変更）
- `frontend/src/features/admin/pages/AdminRiskPage.tsx`（変更）
- `frontend/src/features/admin/pages/AdminContactsPage.tsx`（変更）
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx`（変更）
- `netlify.toml`（変更）
- `frontend/.gitignore`（新規）

---

## 2026-05-30 — B-014 セキュリティリスクスキャナー：AdminRiskPage + `POST /risk/scan`

### コンテキスト
Super Admin / Sub Admin がシステムのセキュリティをリアルタイムでスキャンし、結果を視覚的に確認できる機能が必要だった。

### 実施内容
- **DBマイグレーション** `20260530000000_risk_scanner.sql`：
  - `risk_scans` テーブル — 各スキャンセッション：`status`、`score`、`critical/high/medium/low_count`、`duration_ms`、`source`
  - `risk_findings` テーブル — 個別の検出項目：`severity`、`title`、`description`、`location`、`remediation`、`status`
  - RLS：`super_admin/sub_admin` のみ閲覧可能
- **バックエンド** `POST /v1/risk/scan`（`routes/risk-scan.ts`）：
  - ハイブリッドモード：静的チェック + Supabase Advisor API
  - 静的チェック：CORSコンフィグ、env vars存在確認、テーブルごとのRLSステータス
  - Advisor検出：DBセキュリティ勧告（RLSなしテーブル、インデックスなしFKなど）
  - 結果を `risk_scans` + `risk_findings` に保存；`score` を算出（0–100）
- **フロントエンド** `AdminRiskPage.tsx`（新規）：
  - 「スキャン開始」ボタン + ローディング状態
  - 深刻度バッジ：`critical`（赤）、`high`（オレンジ）、`medium`（黄）、`low`（青）
  - 検出リスト：title、description、location、remediation
  - スコアインジケーター
- **Router**：`/admin/risk` ルートを追加
- **AdminLayout**：「Risk Scanner」サイドバーリンクを追加

### ファイル
- `supabase/migrations/20260530000000_risk_scanner.sql`（新規）
- `supabase/functions/server/routes/risk-scan.ts`（新規）
- `supabase/functions/server/index.ts`（変更 — ルート登録）
- `frontend/src/features/admin/pages/AdminRiskPage.tsx`（新規）
- `frontend/src/app/router.tsx`（変更）
- `frontend/src/features/admin/components/AdminLayout.tsx`（変更）

---

## 2026-05-27 — B-005/B-006 DB最適化：パフォーマンスインデックス + 監査トリガー

### コンテキスト
`tasks`、`inbox_items`、`documents` テーブルにソフトデリート機能がなかった。頻繁にクエリされるテーブルのパーシャルインデックスも不足していた。監査ログトリガーも未実装だった。

### 実施内容
- **`deleted_at`** カラムを `tasks`、`inbox_items`、`documents` に追加
- **パーシャルインデックス**（`WHERE deleted_at IS NULL`）：`tasks`、`inbox_items`、`documents`、`notifications`、`audit_logs`、`request_logs` — アクティブレコードのクエリが高速化
- **監査ログトリガー**：`company_info`、`employee_profiles`、`documents`、`tasks` — 重要な変更が自動的に `audit_logs` に記録される

### ファイル
- `supabase/migrations/20260527105554_b005_b006_optimization.sql`（新規）

---

## 2026-05-27 — #8 B-013 OpenAPI/Scalar docs — `GET /docs/api` + `GET /docs`

### コンテキスト
APIにドキュメントがなかった。外部インテグレーションとフロントエンド開発者向けのインタラクティブなAPIドキュメントが必要だった。

### 実施内容
- `supabase/functions/server/openapi.ts`（新規）: 完全なOpenAPI 3.1仕様（`OPENAPI_SPEC` const）— 全主要エンドポイント（health、contact、tasks、inbox、employees、KB、audit、analytics）とコンポーネントスキーマ（Error、Task、InboxItem、Employee、KbArticle、AuditLog、AnalyticsData）
- `renderScalarHtml(apiJsonUrl)` — Scalar CDN HTMLページ（purple/modernテーマ）を返す
- `server/index.ts`: `openapi.ts`インポート追加；`registerRoutes(prefix)`内に2ルート:
  - `GET ${prefix}/docs/api` → `c.json(OPENAPI_SPEC)` — OpenAPI 3.1 JSON仕様
  - `GET ${prefix}/docs` → Scalar HTML UI（動的URL、pathnameリプレース）
- 4つの全登録プレフィックスで動作

### ファイル
- `supabase/functions/server/openapi.ts`（新規）
- `supabase/functions/server/index.ts`（変更 — インポート + 2ルート）

## 2026-05-27 — #7 レポート/分析チャート — 実際のDBデータ

### コンテキスト
ReportsPageはモックデータを使用していた。実際のDB集計と可視化が必要だった。

### 実施内容
- バックエンド`GET /analytics`: タスク統計、7日トレンド、inbox分類（30日）、従業員統計
- `analyticsApi.ts`（新規）、`AnalyticsPage.tsx`（新規）:
  - staggerアニメーションのKPIカード行
  - Recharts AreaChart（作成/完了トレンド、グラデーション塗りつぶし）
  - Recharts PieChart（ドーナツ、4色）
  - Recharts BarChart（inbox categoriy別カラーバー）
  - 従業員統計グリッド、リフレッシュ + ローディング/エラー状態
- `App.tsx`: `case "analytics"` → `<AnalyticsPage>`追加
- `CommandPalette.tsx`: "Analytics"ページ項目追加

### ファイル
- `analyticsApi.ts`、`AnalyticsPage.tsx`（新規）; `server/index.ts`、`App.tsx`、`CommandPalette.tsx`（変更）

## 2026-05-27 — #6 PWAマニフェスト — オフラインシェル、ホーム画面インストール

### コンテキスト
アプリはブラウザタブでのみアクセス可能だった。モバイルデバイスでのホーム画面インストールとオフラインシェル機能が必要だった。

### 実施内容
- `vite-plugin-pwa@1.3.0`をインストール（devDependency）
- `vite.config.ts`更新: `VitePWA()`プラグイン追加
  - Webアプリマニフェスト: name/short_name、theme_color `#4f46e5`、standalone表示、start_url `/app`
  - アイコン: `icon.svg`（any/maskable）+ `favicon.ico`
  - Workbox: JS/CSS/HTML/ICO/SVG/WOFF2をプリキャッシュ; API URLのランタイムキャッシュ（StaleWhileRevalidate、5分）
- `public/icon.svg`（新規）— indigoの六角形SVGアイコン
- `index.html`: theme-color → `#4f46e5`、apple-touch-icon、PWAメタタグ
- ビルド結果: `dist/sw.js` + `dist/workbox-*.js`生成

### ファイル
- `vite.config.ts`（変更）、`public/icon.svg`（新規）、`index.html`（変更）、`package.json`（変更）

## 2026-05-27 — #5 Admin Audit Logビューア + バックエンド

### コンテキスト
B-006トリガーがaudit_logsテーブルを自動的に埋める。スーパー管理者がこのデータを閲覧・フィルタリング・検査する手段が必要だった。

### 実施内容
- `GET /admin/audit`エンドポイント: super_admin/sub_adminロール確認、フィルター（entity_type/action/from/to/limit）
- `auditApi.ts`型付きクライアント
- `AdminAuditPage.tsx`: staggerアコーディオンリスト、actionバッジ（create/update/delete色分け）、payload JSON展開
- Router: `/admin/audit`ルート; AdminLayout: Shieldアイコン + "Audit Log"ナビ項目

### ファイル
- `auditApi.ts`、`AdminAuditPage.tsx`（新規）; `router.tsx`、`AdminLayout.tsx`、`server/index.ts`（変更）

## 2026-05-27 — #4 Admin Knowledge Base CRUD UI + バックエンド

### コンテキスト
`knowledge_base`テーブル（pgvector + セマンティック検索）は既に存在していたが、管理UIやCRUD APIがなかった。スーパー管理者が記事を追加・編集・削除・有効/無効切り替えできる機能が必要だった。

### 実施内容
**バックエンド (server/index.ts):**
- `GET /admin/kb` — 記事一覧（locale、category、is_activeフィルター）
- `POST /admin/kb` — 記事作成（locale+category+question+answer必須）
- `PUT /admin/kb/:id` — 記事更新
- `DELETE /admin/kb/:id` — 記事削除
- 全エンドポイントでsuper_admin / sub_adminロール確認

**フロントエンド:**
- `frontend/src/features/admin/api/kbApi.ts`（新規）— 型付きAPIクライアント
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx`（新規）:
  - ヘッダー: 記事数/有効数 + 更新 + 「新規記事」ボタン
  - フィルター: 検索 + ロケール選択 + カテゴリ選択
  - staggerアニメーション付きアコーディオンリスト
  - 各行: locale/categoryバッジ、質問テキスト、タグ、トグルスイッチ
  - 展開時: 完全な回答 + 編集/削除ボタン
  - `FormModal` — 2カラムフォーム（locale+category）、質問、回答、タグ、is_activeトグル
  - 削除確認モーダル
- `router.tsx` — `/admin/knowledge-base`ルート追加
- `AdminLayout.tsx` — BookOpenアイコン + "Knowledge Base"ナビ項目

### ファイル
- `frontend/src/features/admin/api/kbApi.ts`（新規）
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx`（新規）
- `router.tsx`、`AdminLayout.tsx`、`server/index.ts`（変更）

## 2026-05-27 — #3 Framer-motionマイクロアニメーション

### コンテキスト
Framer-motionはインストール済みだったが、ページトランジションにしか使われていなかった。KPIカード、従業員テーブル行、会社カードにhover/staggerアニメーションが必要だった。

### 実施内容
- `shared/lib/motionVariants.ts` 新規作成 — 共有バリアント:
  - `fadeInUp` — ページセクションの入場アニメーション
  - `staggerContainer` + `staggerItem` — リストのstagger（55ms間隔）
  - `cardHover` — scale 1.02 + indigoボックスシャドウ（hover時）
  - `rowHover` — テーブル行の繊細なhover
- `DashboardPage.tsx`: KPIグリッド → `motion.div`（staggerContainer）; 各`KpiCard` → `motion.div`（staggerItem + cardHover）
- `EmployeesPage.tsx`: `<tbody>` → `<motion.tbody>`（staggerContainer）; 各`<tr>` → `<motion.tr>`（staggerItem、55ms stagger）
- `AdminCompaniesPage.tsx`: カードラッパー → `motion.div`（staggerContainer）; 各カード → `motion.div`（staggerItem + indigo枠hover）

### ファイル
- `frontend/src/shared/lib/motionVariants.ts`（新規）
- `DashboardPage.tsx`、`EmployeesPage.tsx`、`AdminCompaniesPage.tsx`（変更）

## 2026-05-27 — #2 CommandPalette: ⌘Kグローバルモーダル検索

### コンテキスト
以前の⌘Kは検索入力にフォーカスするだけだった。適切なCommandPalette — モーダル、ファジー検索、キーボードナビゲーション — が必要だった。

### 実施内容
- `CommandPalette.tsx`コンポーネントを新規作成（`shared/components/`）
- Framer-motion: バックドロップ + scale/fadeモーダルアニメーション
- 13ページアイテム（Dashboard → Notifications）、1クイックアクション（Add Employee）
- 従業員: `listEmployees(tenantId, "active")` — パレット開時にレイジーロード
- ファジーマッチ: `includes()` + 文字単位フォールバック; マッチ部分を`<span>`ハイライト
- キーボード: ArrowUp/Downでカーソル移動、Enter → 選択、Escape → 閉じる
- グループセクション: Pages / Quick Actions / Employees + scroll-into-view
- フッターヒント: `↑↓`、`↵`、`ESC`
- `App.tsx`変更: `paletteOpen`状態追加、⌘Kハンドラーでトグル、
  検索入力 → クリック時オープンボタン（⌘Kバッジ表示）、
  `<CommandPalette>`をレイアウト末尾にレンダリング（portal経由）

### ファイル
- `frontend/src/shared/components/CommandPalette.tsx`（新規）
- `frontend/src/App.tsx`（変更）

## 2026-05-27 — B-005 + B-006 + B-011: DBインデックス、監査トリガー、構造化ログ

### コンテキスト
ビジネステーブルに複合インデックスがなく、テナントスコープのクエリが大規模では遅かった。監査ログは手動書き込みのみ（トリガーなし）。HonoのデフォルトロガーはプレーンテキストでSupabaseの可観測性が低かった。

### 実施内容

**B-005 — パフォーマンスインデックス + ソフトデリート:**
- `tasks`、`inbox_items`、`documents` に `deleted_at timestamptz` カラムを追加
- 9つの複合/部分インデックスを作成（tenant_id + status/created_at/due_date + deleted_at）
- `idx_notifications_user_unread` — `(user_id, created_at desc)` where read_at IS NULL
- `idx_audit_logs_entity` — `(entity_type, entity_id, created_at desc)`

**B-006 — 監査トリガー:**
- `fn_audit_log_change()` PL/pgSQL関数を作成（SECURITY DEFINER）
- INSERT → `event_type = 'table.create'`、UPDATE → `{before, after}` JSON、DELETE → OLD行JSON
- トリガー: `trg_audit_tasks`、`trg_audit_inbox_items`、`trg_audit_documents`（+ hr_casesが存在する場合）

**B-011 — 構造化JSONログミドルウェア（Hono）:**
- `hono/logger`インポートを削除
- 新しい `app.use('*', async (c, next) => {...})` ミドルウェア:
  - `X-Trace-Id`ヘッダーを読み取るかUUIDを生成
  - `Date.now()`でレスポンス時間を計測
  - ログレベル自動判定: status ≥ 500 → `error`、≥ 400 → `warn`、2000ms超 → `warn`
  - `logRequest()`でJSON出力: `{level, traceId, tenantId, userId, method, path, status, duration_ms}`
  - 2000ms超リクエストに `slow_query: true` フラグ

### ファイル
- `supabase/migrations/20260527000000_b005_b006_optimization.sql`（新規）
- `supabase/functions/server/index.ts`（変更 — loggerインポート削除、構造化ミドルウェア追加）
>
> **プロトコル（CLAUDE.md §...）：** すべての変更はここおよび 4 言語の翻訳に記録される。

---

## 2026-05-27 — UI/UX #10: オンボーディングツールチップ（TourProvider、TourOverlay）

### 実施内容

- `OnboardingTour.tsx`: `TourProvider` + `useTour`フック + `TourOverlay`コンポーネント（外部ライブラリなし）
  - スポットライト: `box-shadow`でターゲット周りにダークオーバーレイ
  - `requestAnimationFrame`でターゲット位置追跡（スクロールも対応）
  - `placement`オプション（top/bottom/left/right）、ビューポートクランプ
  - プログレスバー、ステップカウンター(1/4)、「スキップ」「次へ」ボタン
  - キーボード: `Escape`→閉じる、`ArrowRight`/`Enter`→次へ
- `AppProviders.tsx`: `<TourProvider>`追加
- `App.tsx`: `DASHBOARD_TOUR`(4ステップ) + `HelpCircle`ボタン→`startTour()`

### ファイル

- `frontend/src/shared/components/OnboardingTour.tsx` (新規)
- `frontend/src/app/providers/AppProviders.tsx` (変更)
- `frontend/src/App.tsx` (変更)

---

## 2026-05-27 — UI/UX #9: キーボードショートカット（⌘K検索、⌘N従業員追加）

### 実施内容

- `App.tsx`に`keydown`リスナー: `Cmd/Ctrl+K` → 検索inputにフォーカス+選択; `Cmd/Ctrl+N` → `hr-add-employee`へナビゲート（HR権限がある場合のみ）
- `navigator.platform`でMac/Windowsモッドキー判定
- 検索プレースホルダー更新: `"... (⌘K)"`ヒント追加

### ファイル

- `frontend/src/App.tsx` (変更)

---

## 2026-05-27 — UI/UX #8: テーブルページネーション（EmployeesPage、AdminCompaniesPage）

### 実施内容

- `Pagination`コンポーネント: 省略記号付きページボタン、`ChevronLeft/Right`、"N–M / 合計"表示；`paginateArray`ヘルパー
- **EmployeesPage**: `PAGE_SIZE=20`、tab/search/statusFilter変更時にページリセット
- **AdminCompaniesPage**: `PAGE_SIZE=15`、filter/search変更時にページリセット、リスト下にページネーション

### ファイル

- `frontend/src/shared/components/Pagination.tsx` (新規)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (変更)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (変更)

---

## 2026-05-27 — UI/UX #7: ダーク/ライトモードトグル

### 実施内容

- `useTheme`フック: localStorage永続化(`ai-bc-theme`)、OSプリファレンスフォールバック、`<html>`への`.dark`クラス追加/削除
- `ThemeToggle`コンポーネント: `Sun`/`Moon`アイコン、`aria-label`、`dark:`ホバーカラー
- App.tsxトップバーに`<ThemeToggle />`追加（LocaleSelectの左）
- AdminLayoutトップバーにも`<ThemeToggle />`追加
- `theme.css`の`.dark` CSS変数は既に完全定義済み

### ファイル

- `frontend/src/shared/hooks/useTheme.ts` (新規)
- `frontend/src/shared/components/ThemeToggle.tsx` (新規)
- `frontend/src/App.tsx` (変更)
- `frontend/src/features/admin/components/AdminLayout.tsx` (変更)

---

## 2026-05-27 — UI/UX #6: 従業員オンボーディングステップウィザード

### 実施内容

- `AddEmployeePage`を3ステップウィザードに変換:
  - **Step 1**: 方法選択 — 大きなビジュアルカード（`Send`/`Lock`アイコン、選択バッジ）
  - **Step 2**: 情報フォーム — アイコン付きinput、方法インジケーター+「変更」リンク、送信中スピナー
  - **Step 3**: 成功 — 大きな緑の`CheckCircle2`、「もう1人追加」「従業員一覧」ボタン
- `StepIndicator`コンポーネント: 番号付き円（active/done/future）、コネクター線（色変化）、ステップラベル
- `onSuccess?`プロップ追加

### ファイル

- `frontend/src/features/hr/pages/AddEmployeePage.tsx` (完全再構築)

---

## 2026-05-27 — UI/UX #5: 通知UI改善

### 実施内容

- **バッジ**: `animate-ping`リング（赤い点の周りに脈動するハロー）+ カウントバッジ
- **「全て既読」ボタン**: ヘッダーに`CheckCheck`アイコン + `Promise.allSettled`で並列マーク
- **空状態**: `BellOff`アイコン + テキスト（以前はテキストのみ）
- **各通知**: タイプ絵文字（task/hr/invoice/system/🔔）、未読インジゴ点、`bg-indigo-50`背景
- ヘッダー行追加: タイトル + 未読数ある時「全て既読」ボタン

### ファイル

- `frontend/src/features/notifications/components/NotificationsDropdown.tsx` (完全再構築)

---

## 2026-05-27 — UI/UX #4: モバイルレスポンシブ修正（3ページ）

### 実施内容

- **AdminCompaniesPage** ヘッダー: `flex-wrap gap-3 + shrink-0` — 小画面でボタンが次行に折り返し
- **AdminContactsPage** ヘッダー: 同様の `flex-wrap` 修正
- **EmployeeDetailPage**: ローディング → 完全なスケルトン（ヘッダー + 5フィールド行）；エラー状態 → アイコン + メッセージ

### ファイル

- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (変更)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (変更)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (変更)

---

## 2026-05-27 — UI/UX #3: スケルトンローダー + 空状態（4ページ）

### 実施内容

- **AdminCompaniesPage**: スピナー → 5件のカードスケルトン (`animate-pulse`)；空状態 → `Building2`アイコン + コンテキストメッセージ
- **AdminContactsPage**: スピナー → 5件のカードスケルトン；空状態 → `Users`アイコン + コンテキストメッセージ；`Users`インポート追加
- **AdminHealthPage**: テキスト1行 → ヘッダー + バナー + 統計カード4件のスケルトン
- **EmployeesPage**: テキスト → テーブルスケルトン（thead + 6行）；空状態 → `UserPlus`アイコン

### ファイル

- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx`, `AdminContactsPage.tsx`, `AdminHealthPage.tsx` (変更)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (変更)

---

## 2026-05-27 — UI/UX #1-2: AdminLayoutサイドバー + AdminDashboard SVGチャート

### 実施内容

**#1 — AdminLayoutサイドバー再構築:**
- デスクトップ: アイコンのみ (w-16) ↔ 展開 (w-56)、`PanelLeftClose/Open`トグル
- モバイル: ドロワー (`-translate-x-full` → `translate-x-0`) + オーバーレイ
- `NavItem`: ツールチップ（折り畳み時fixed位置）、左アクティブバー（高さアニメ）、ホバー時アイコンスケール
- バッジ: 点滅する赤い点（折り畳み）/ 数字（展開）
- `Avatar`: `[\s@._-]`で分割したイニシャル
- トップバー: 新着問い合わせ数、右上アバター

**#2 — AdminDashboard SVGチャート（外部ライブラリなし）:**
- `DonutChart`: 純粋SVG、三角関数による弧パス、中央穴、中央テキスト
- `MiniBarChart`: SVGバーチャート、companiesのcreated_atから7日間バケット
- `LatencyGauge`: SVG弧ゲージ、カラーコード（緑≤50ms、黄≤200ms、赤>200ms）
- `StatCard`: 週次トレンド指標（↑/↓）、hover `scale-[1.01]`
- スケルトンローダー: ロード中 `animate-pulse` div
- 30秒自動更新

### ファイル

- `frontend/src/features/admin/components/AdminLayout.tsx` (完全再構築)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (完全再構築)

---

## 2026-05-27 — タスク4: B-001 ユニットテスト（inboxモジュール）

### コンテキスト

B-001に基づき`features/inbox/`モジュールのユニットテストを追加。テスト数76→89（+13件、16ファイル）。

### 実施内容

**`inboxApi.test.ts`（6件）：** `is_read`正規化、tenantId、空配列、複数アイテム、APIエラー

**`useInbox.test.ts`（7件）：** マウント時ロード、filter=all/HR/Sales、テナント分離、APIエラー状態、selectedItem自動設定

### ステータス：89テスト、全件通過

### ファイル

- `frontend/src/features/inbox/__tests__/inboxApi.test.ts`（新規）
- `frontend/src/features/inbox/__tests__/useInbox.test.ts`（新規）

---

## 2026-05-27 — タスク3: B-007 プロンプトインジェクション対策 + 入力サニタイズ

### コンテキスト

AIチャットエンドポイントがユーザー入力をチェックなしでClaude/OpenAIに渡していた。B-007に従い`services/ai-safety.ts`を作成し`/v1/ai/chat`に組み込んだ。

### 実施内容

**`services/ai-safety.ts`（新規）：**
- `checkAiSafety()` — 25パターン（EN/RU/UZ/JA + システムマーカー）、HTMLストリップ、16,000字制限、10メッセージ/分のレート制限
- `wrapUserMessage()` — プロンプトレイヤリング（`"User message:\n..."`ブロックでユーザー入力を分離）

**`/v1/ai/chat`更新：**
- KB検索・LLM呼び出し前に`checkAiSafety()`実行
- 422 → `INJECTION_DETECTED` / `INPUT_TOO_LONG`
- 429 → `RATE_LIMITED`（ロケール対応メッセージ）
- `safeMessage`をハンドラー全体で使用

### ファイル

- `supabase/functions/server/services/ai-safety.ts`（新規）
- `supabase/functions/server/index.ts`（変更）

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

---

## 2026-07-24 — 4言語対応とテーマ修正の完了

- テンプレートライブラリ、タブ、検索、カテゴリ、モーダル、検証、形式ラベルを共通の `uz`、`ru`、`en`、`ja` ロケール契約へ移行。
- Production上の15件の有効テンプレートについて、タイトル、説明、全フィールドラベル、書類本文を4言語で整備（`20260724065619_localize_document_templates_four_languages.sql`）。
- 書類APIとOpenAPIのlocale enumが4言語すべてを受け付け、frontendで`en`と`ja`が`uz`へ置換される問題を解消。
- `next-themes`を唯一のテーマソースとし、強制ライトテーマを削除。既存utilityカラー向けのdark-mode互換レイヤーを追加。
- 共通ナビゲーション、通知、設定、会社プロフィール、分析、AIチャット、command paletteの細部をlocaleシステムへ移行。
- 検証: frontend build成功、95/95テスト成功、backend bundle成功。Production DBでtitle、body、field localeが`15/15`完全であることを確認。
