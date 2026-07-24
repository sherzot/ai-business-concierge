# PLAN.md — AI Business Concierge

> 段階的な実装計画
> バージョン: 3.0 | 更新: 2026-05-06
> ⚡ 市場の緊急性: SQB「AI アドバイザー」が登場 — 加速スケジュール

---

## 戦略的コンテキスト

国家銀行SQBが2026年に「AI アドバイザー」製品を発売。これは：
- **市場を検証する** — 需要があり、投資が正当化される
- **私たちを加速させる** — 水平的な日常ソリューションで市場に最初に参入する必要あり
- **競合ではなくファネル** — SQBはスタートアップ段階をカバー、私たちは日常業務をカバー

**目標:** 2026年Q2（6月）までにTelegram MVPで市場に参入。

---

## 加速タイムライン

```
Phase 0:   準備 ........................ 第1-2週    ✅ 完了
Phase 1:   Telegram MVP ............... 第3-5週    ✅ 完了
Phase 1.5: 企業認証・管理 .............. 第6-8週    ✅ 完了
Phase 2:   書類メーカー + ランディング . 第9-12週   🚧 開始済み
Phase 3:   販売ボット + 決済 .......... 第13-16週  (4週間)
Phase 4:   Admin AI + 仕上げ .......... 第17-20週  (4週間)
Phase 5:   スケール .................... 第21-27週  (7週間)
```

> **Phase 1.5が緊急の理由:** ビリング/決済が機能するには、企業が適切に登録・承認され、ロールに分けられている必要があります。登録 → ビリング → 収益の連鎖がこのフェーズにあります。

---

## Phase 0: 準備（第1-2週）✅ 完了

**目標:** インフラ準備完了、AI動作、KB充填済み

### 0.1 LLM移行（OpenAI → Claude）
- [x] Anthropic SDK インストール（Deno用）
- [x] LLM Router service — Haiku/Sonnet自動選択、コスト追跡、キャッシュ
- [x] `/ai/chat` エンドポイントをClaudeに移行
- [x] OpenAIをフォールバックとして保持

### 0.2 Knowledge Base セットアップ
- [x] pgvector拡張機能の有効化（Supabase）
- [x] `knowledge_base` テーブル + マイグレーション
- [x] KBサービス — 埋め込み（OpenAI text-embedding-3-small）、セマンティック検索
- [x] 初期コンテンツ（50以上のQ&A）: 税務規則、期限、労働法

### 0.3 DBマイグレーション（12の新テーブル）
- [x] `subscriptions`、`payments`、`ai_conversations`、`ai_messages`、`ai_feedback`
- [x] `doc_templates`、`doc_generated`、`sales_bots`、`catalogs`、`orders`
- [x] `knowledge_base`（pgvector）、`audit_log`、`usage_tracking`
- [x] RLSポリシー + パフォーマンスインデックス

**結果:** Claude API動作、KBが50以上の質問に回答、DB準備完了

---

## Phase 1: Telegram MVP（第3-5週）✅ 完了

**目標:** Telegramボットでai AIアドバイザー動作、50ベータユーザー

### 1.1 Telegramボットのセットアップ
- [x] grammYフレームワークのセットアップ（Supabase Edge Function）
- [x] コマンド: `/start`、`/help`、`/language`、`/stats`
- [x] エラーハンドラー — ボットは絶対にクラッシュしない

### 1.2 オンボーディングフロー
- [x] `/start` → 言語選択（UZ/RU/EN/JA）
- [x] 再訪ユーザーの区別
- [x] レート制限: 5クエリ/日（無料）

### 1.3 AIアドバイザー（モジュール1）
- [x] AIパイプライン: メッセージ → LLM Router → KBセマンティック検索 → Claude → 応答
- [x] 信頼度チェック → 免責事項
- [x] フィードバック: [👍] [👎]
- [x] 残りリミット表示

### 1.4 ベータ起動
- [x] 50ベータユーザー
- [x] フィードバック収集

**結果:** ボット稼働、50ベータユーザー、90%以上の精度、<3秒応答

---

## Phase 1.5: 企業認証・管理（第6-8週）✅ 完了

**目標:** 企業オンボーディング、従業員オンボーディング、ロールシステム、ビリング基盤
**今すぐの理由:** ビリングが機能するには、企業が適切に登録されて明確なロールを持つ必要があります。

### 1.5.1 データベース — 新テーブル

#### A. `contact_requests` テーブル（新規）
```sql
CREATE TABLE contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  company_name text,
  stir text,
  phone text NOT NULL,
  email text NOT NULL,
  business_type text,        -- ip, llc, jsc, other
  employee_count text,       -- 1-10, 11-50, 51-200, 200+
  message text,
  source text,               -- ads, referral, search, telegram
  status text DEFAULT 'new', -- new, contacted, invite_sent, registered, rejected
  admin_note text,
  invite_token text,
  invite_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- RLS: super_admin/sub_adminのみ
```

#### B. `tenants` への新しいカラム
```sql
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS
  status text DEFAULT 'active',  -- pending_approval, active, suspended, blocked
  legal_form text,
  stir text,
  legal_address text,
  activity_type text,
  bank_name text,
  bank_account text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  blocked_reason text;
```

#### C. `user_tenants` ロールの更新
```sql
ALTER TABLE user_tenants ADD CONSTRAINT user_tenants_role_check
  CHECK (role IN ('super_admin','sub_admin','company_admin','hr','accountant','manager','employee'));
```

#### D. `employee_invites` テーブル
```sql
CREATE TABLE employee_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  tenant_id uuid REFERENCES tenants(id),
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending',  -- pending, used, expired
  created_at timestamptz DEFAULT now()
);
```

### 1.5.2 バックエンドAPI — 新エンドポイント

```
POST /v1/contact                          — お問い合わせフォーム（公開）
GET  /v1/admin/contacts                   — お問い合わせ一覧
PATCH /v1/admin/contacts/:id/status       — ステータス変更
POST /v1/admin/contacts/:id/invite        — invite URL送信
GET  /v1/admin/companies                  — 企業一覧
PATCH /v1/admin/companies/:id/approve     — 承認
PATCH /v1/admin/companies/:id/block       — ブロック
GET  /v1/register/validate/:token         — トークン確認
POST /v1/register/company                 — 企業登録
POST /v1/employees                        — 新規従業員
PATCH /v1/employees/:id/confirm           — 従業員確認
POST /v1/employees/:id/resend-invite      — invite再送信
GET  /v1/invite/validate/:token           — 従業員トークン確認
POST /v1/invite/set-password              — パスワード設定
```

### 1.5.3 フロントエンド — 新しいページ

**公開:**
- [x] `/contact` — お問い合わせページ
- [x] `/register?token=...` — 企業登録
- [x] `/set-password?token=...` — 従業員パスワード設定
- [x] `/login` — 更新済み（ステータスメッセージ）
- [x] `/forgot-password`、`/reset-password?token=...`

**Admin:**
- [x] `/admin/contacts` — お問い合わせ管理
- [x] `/admin/companies` — 企業一覧
- [x] `/admin/health` — システム状態
- [x] `/admin/ai-chat` — Admin AIアシスタント（基本）

**企業:**
- [x] `/app/employees` — 従業員一覧 + 管理
- [x] `/app/employees/:id` — 従業員プロフィール

### 1.5.4 メールテンプレート（Resend）

```
1. company_invite.html       — 企業へのinvite URL
2. company_pending.html      — 登録後（承認待ち）
3. company_approved.html     — 承認時
4. company_rejected.html     — 却下時
5. employee_invite.html      — 従業員へのパスワード設定URL
6. employee_approved.html    — 従業員承認時
7. password_reset.html       — パスワードリセット
```

### 1.5.5 セキュリティ要件

- Inviteトークン: JWT、RS256、一回限り
- 企業invite: 48時間TTL
- 従業員invite: 24時間TTL
- パスワード強度: 最低8文字、大文字+小文字+数字
- ブルートフォース: 5回失敗 → 15分ブロック

**Phase 1.5 結果:** 企業が適切に登録でき、従業員が安全なアカウントを得て、ビリング基盤が完成。

---

## Phase 2: 書類メーカー + ランディング（第9-12週）

**目標:** 書類生成、ランディングページ

### 2.1 AI書類メーカー（モジュール2）
- [x] 15テンプレート: seed migrationをproductionへdeploy済み
- [x] 下書きpipeline: template → dynamic fields → `documents` + `doc_generated`
- [ ] AI質問/polish → 実際のPDF/DOCX binary
- [ ] Noto Sansフォント（ウズベク語/ロシア語文字）
- [ ] Supabase Storageとの統合

### 2.2 Telegramでの書類メーカー
- [ ] ステップバイステップQ&Aフロー
- [ ] 書類送信（Telegram documentメッセージ）

### 2.3 ランディングページ
- [ ] Hero、3モジュール、料金、FAQ
- [ ] モバイルファースト、UZ/RU/EN/JA、SEO

**結果:** 15テンプレート、ランディング稼働、書類生成<10秒

---

## Phase 3: 販売ボット + 決済（第13-16週）

**目標:** マネタイズ、販売ボット

### 3.1 AI販売ボット（モジュール3）
- [ ] ボット作成フロー（トークン → カタログ → アクティベーション）
- [ ] 顧客機能: 商品、注文
- [ ] オーナー向け: カタログ、注文、統計

### 3.2 決済（Click + Payme）
- [ ] Click: Prepare + Complete + webhook（idempotent）
- [ ] Payme: CreateTransaction + PerformTransaction + webhook
- [ ] サブスクリプション管理（アップ/ダウングレード、3日間猶予）

### 3.3 使用量制限
- [ ] プランベースの制限ミドルウェア
- [ ] アップセルメッセージ（限度達成時）

**結果:** 決済動作、販売ボット動作、初収益
**指標:** 50以上の有料ユーザー、$200以上MRR

---

## Phase 4: Admin AI + 仕上げ（第17-20週）

**目標:** 完全なAdmin AIシステム、95%以上の品質

### 4.1 Super Admin パネル — 完全版
- [ ] `/admin` — 統計ダッシュボード
- [ ] `/admin/ai` — AIモニタリング（精度、コスト、KBギャップ）
- [ ] `/admin/knowledge-base` — KB管理（CRUD、バージョニング）
- [ ] `/admin/billing` — MRR、チャーン、LTV
- [ ] `/admin/audit` — 監査ログ（グローバル）

### 4.2 Admin AIエージェント（`/admin/ai-chat`）— 完全版
- [ ] KBエージェント: ギャップ、古い回答、新コンテンツ提案
- [ ] サポートエージェント: 企業問題の説明、解決策提案
- [ ] アナリティクスエージェント: MRR理由、チャーン分析
- [ ] ヘルスエージェント: 異常検知、リアルタイムアラート

### 4.3 品質向上
- [ ] AI精度95%以上
- [ ] API <200ms（非AI）、<3秒（Haiku）、<8秒（Sonnet）
- [ ] モバイルテスト（全ページ）

**結果:** 完全なAdmin AI、95%以上精度、安定システム

---

## Phase 5: スケール（第21-27週）

**目標:** 5,000以上ユーザー、$8,000以上MRR、IT Park

### 5.1 マーケティング
- [ ] Telegramチャンネル（コンテンツ）
- [ ] YouTube: 「AIでビジネス管理」（ウズベク語）
- [ ] SQB顧客向けリターゲティング
- [ ] リファラルプログラム（invite → 1ヶ月Proを無料）

### 5.2 IT Park
- [ ] IT Parkレジデント申請
- [ ] Digital Startupsプログラム（12%税制優遇）

### 5.3 機能拡張
- [ ] my.soliq.uz統合
- [ ] 電子請求書（EHF）
- [ ] 銀行明細インポート
- [ ] APIアクセス（企業プラン）

### 5.4 地域展開
- [ ] カザフスタン、キルギスタン市場調査
- [ ] 日本市場調査（`ja`ローカライズ既存）

---

## バックログ分布

| ID | タスク | フェーズ | 工数 | ステータス |
|---|---|---|---|---|
| B-018 | Contact requests（フォーム + admin CRM） | Phase 1.5 | M | DONE |
| B-019 | Company registration flow | Phase 1.5 | L | DONE |
| B-020 | Employee onboarding | Phase 1.5 | L | DONE |
| B-021 | Login page UX（ステータスメッセージ） | Phase 1.5 | S | DONE |
| B-022 | Forgot/Reset password pages | Phase 1.5 | S | DONE |
| B-023 | ロールシステム更新 | Phase 1.5 | M | DONE |
| B-024 | Admin company management | Phase 1.5 | M | DONE |
| B-025 | Employee management UI | Phase 1.5 | M | DONE |
| B-026 | メールテンプレート（7件） | Phase 1.5 | S | DONE |
| B-027 | HR向けin-app通知 | Phase 1.5 | S | DONE |
| B-028 | /admin/health — システムモニタリング | Phase 1.5 | M | DONE |
| B-029 | Admin AIチャット（基本） | Phase 1.5 | M | DONE |
| B-030 | Admin AIエージェント（KB、Support、Analytics、Health） | Phase 4 | L | TODO |
| B-001 | Unit tests（Vitest） | Phase 2 | M | 部分的（89件成功） |
| B-002 | E2E tests（Playwright） | Phase 4 | L | TODO |
| B-003 | Async AI jobパターン | Phase 3 | M | TODO |
| B-004 | Rate limiting（sliding window） | Phase 3 | M | 部分的 |
| B-005 | DB最適化（deleted_at + インデックス） | Phase 0 | S | DONE |
| B-006 | Audit logトリガー | Phase 0 | M | DONE |
| B-007 | Prompt injection保護 | Phase 1 | M | DONE |
| B-008 | AIコストダッシュボード | Phase 1 | S | DONE |
| B-009 | PWA実装 | Phase 5 | L | 部分的（manifest + offline shell） |
| B-010 | 使用量ベースビリング | Phase 3 | L | 部分的 |
| B-011 | 構造化ログミドルウェア | Phase 0 | S | DONE |
| B-012 | ヘルスチェック（拡張） | Phase 2 | S | 部分的 |
| B-013 | OpenAPI自動生成 | Phase 2 | M | DONE |
| B-014 | セマンティック検索（RAG） | Phase 1 | S | DONE |
| B-015 | Multi-turn AI記憶 | Phase 4 | M | TODO |
| B-016 | GDPRデータエクスポート | Phase 4 | M | TODO |
| B-017 | Resend webhook idempotency | Phase 3 | S | TODO |

**工数:** S=1-3日 · M=1週間 · L=2週間

---

## 成功指標

| 指標 | Phase 1 | Phase 3 | Phase 5 |
|---|---|---|---|
| 総ユーザー数 | 50 | 500 | 5,000 |
| 有料ユーザー | 0 | 50 | 2,000 |
| MRR | $0 | $200 | $8,000 |
| AI精度 | 90% | 93% | 95%以上 |
| 応答時間（Haiku） | <5秒 | <3秒 | <2秒 |
| 書類テンプレート | 0 | 15 | 30以上 |
| KB記事 | 50 | 200 | 500以上 |

---

## 変更履歴

| 日付 | バージョン | 変更 |
|---|---|---|
| 2026-07-24 | v3.1 | Phase 1.5完了とPhase 2開始を確認し、backlogをコードおよびDEVLOGと同期。 |
| 2026-05-06 | v3.0 | Phase 1.5追加（Company Auth）。B-018..B-030バックログ。 |
| 2026-04-30 | v2.1 | 17の戦略的要件をフェーズに分配（B-001..B-017） |
| 2026-04-16 | v2.0 | SQB競合分析 + Telegram MVPタイムライン加速 |

---

*PLAN.md — AI Business Concierge v3.1 · 2026-07-24*
