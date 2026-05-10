# SPEC.md — AI Business Concierge

> ウズベク起業家のための日常ビジネス管理アシスタント
> バージョン: 3.0 | 日付: 2026-05-06

---

## 1. 製品について

### 1.1 一言で

AI Business Concierge — ウズベキスタンで**すでに営業中の**中小企業オーナーのための**日常的な業務管理**アシスタント。ビジネスの開始を助ける銀行ツールとは異なり、私たちは税務、人事、契約、販売において毎日**ビジネスを運営する**のをサポートします。

> **主な違い:** 銀行AI → ビジネスを「始める」のを助ける。私たち → ビジネスを「運営する」のを助ける。

### 1.2 問題

ウズベキスタンには403,800以上の中小企業があります。開業後、日常的な業務問題に直面します：
- **税務/会計:** 申告期限を知らない → 罰金。
- **契約/書類:** 弁護士に1回200-500K UZS → 月に数百万。
- **販売:** 夜間/週末に手動で顧客対応 → 顧客を失う。
- **人事:** 採用/解雇の手順を知らない → 労働法違反。

### 1.3 ソリューション

Telegramボット + Webダッシュボード経由の3つのAIモジュール — **毎日、毎時間、あらゆる質問に:**
1. **AIアドバイザー** — 税務、会計、人事、ビジネス質問
2. **AIドキュメントメーカー** — 契約書、申請書、命令書の生成（PDF/DOCX）
3. **AI販売ボット** — Telegram販売ボットの作成と管理

### 1.4 ターゲット

| セグメント | 規模 | 主な問題 | 私たちからの価値 |
|---|---|---|---|
| 個人事業主（IP） | 200,000+ | 税務申告、契約 | 毎日のAIアドバイス、書類 |
| 小売店/サービス | 150,000+ | 販売自動化 | 販売ボット、24/7顧客対応 |
| 中規模（10-50人）| 50,000+ | 人事、書類 | HRアドバイス、雇用契約 |
| 会計/法務事務所 | 5,000+ | 大量クライアント書類 | 一括書類生成 |

### 1.5 競合分析

| 競合 | 強み | 弱み | 私たちの優位性 |
|---|---|---|---|
| **SQB "AI アドバイザー"** | 国家銀行、信頼性 | 信用/スタートアップ段階のみ | 日常業務、Telegram、3モジュール |
| **My.soliq.uz** | 公式、正確 | 貧弱なUI、AIなし | AI + 自然言語 + 全モジュール |
| **ChatGPT** | 強力なAI | ウズベク法を知らない | ウズベキスタン専用KB |
| **1C会計** | フル機能 | 高価、複雑 | Telegram、シンプル、AIアドバイス |

**競合戦略:** SQBとの提携機会 — 彼らが融資 → クライアントが開業 → **日常の質問で私たちのボットへ**。競合ではなく、ファネル。

---

## 2. ロールと権限

### 2.1 ロールアーキテクチャ

```
システムレベル
  super_admin  ≡  sub_admin  (同一の完全権限)
      │
会社レベル
      └── company_admin
              ├── hr
              ├── accountant
              ├── manager
              └── employee
```

> **重要:** `super_admin`と`sub_admin`は同一の権限を持ちます。両者とも全企業、システム、モニタリング、管理に完全アクセスできます。

### 2.2 ロールの責任

#### SUPER_ADMIN / SUB_ADMIN — システムレベル
| 権限 | 詳細 |
|---|---|
| 企業管理 | 登録、承認、ブロック |
| 問い合わせ表示 | 新規企業申請、ステータス管理 |
| AIモニタリング | 全AIリクエスト、エラー、コスト |
| ナレッジベース | 税務規則、書類テンプレート更新 |
| アナリティクス | システム統計、売上、チャーン |
| ビリング | 支払い、サブスクリプション、MRR |
| ヘルスモニタリング | システム状態、APIステータス |

**Admin Dashboard:**
- `/admin` — 総合指標
- `/admin/companies` — 企業一覧
- `/admin/contacts` — 問い合わせ
- `/admin/ai` — AIモニタリング
- `/admin/health` — システム状態
- `/admin/ai-chat` — Admin AIアシスタント

#### COMPANY_ADMIN
| 権限 | 詳細 |
|---|---|
| 会社プロフィール | 完全なデータ管理 |
| 従業員管理 | 追加、削除、ロール割り当て |
| 全モジュール | AIアドバイザー、ドキュメント、販売ボット |
| サブスクリプション | プラン変更、支払い履歴 |

#### HR
| 権限 | 詳細 |
|---|---|
| 従業員アカウント作成 | 全従業員データ入力 |
| 従業員アカウント承認 | パスワード設定後に承認 |
| AIアドバイザー | HR質問（無制限）|
| 書類 | 雇用契約、採用/解雇命令 |

#### ACCOUNTANT
| 権限 | 詳細 |
|---|---|
| AIアドバイザー | 税務・会計質問 |
| 書類 | 財務書類 |
| 財務モジュール | 収支、税務報告 |

#### MANAGER
| 権限 | 詳細 |
|---|---|
| AIアドバイザー | 完全（自部署のコンテキストで）|
| タスク | 部署従業員への割り当て |
| レポート | 部署レポート |

#### EMPLOYEE
| 権限 | 詳細 |
|---|---|
| AIアドバイザー | 制限あり（10クエリ/日）|
| タスク | 割り当てられたタスクの確認と完了 |
| 書類 | 自分の書類を閲覧 |

---

## 3. UI/UX仕様

### 3.1 デザイン原則

**「一般の人が30秒で理解できるシステム」**
- 各ページに**1つのメインアクション**
- 現地語で**分かりやすい言葉**
- **大きなボタン** — モバイルで使いやすい
- **エラーメッセージ**は分かりやすい言語で

### 3.2 ページ構造

**公開ページ:**
```
/ (ランディングページ) — Hero、3モジュール、料金、FAQ、CTA
/login、/register、/contact、/pricing、/about
```

**ダッシュボード（認証後）:**
```
/app/dashboard → /app/ai-assistant → /app/documents → /app/sales-bots
/app/inbox → /app/tasks → /app/hr → /app/reports → /app/billing
/admin/* (super_adminのみ)
```

### 3.3 ランディングページHero

```
「あなたのビジネスはすでに動いていますか？」

税務の質問。契約書。販売ボット。
すべて1つのTelegramボットで。毎日。

[Telegramで無料スタート]  [デモを見る]

✓ ローンではなく — 毎日のサポート
✓ 弁護士ではなく — AI契約書
✓ 手動ではなく — 自動販売
```

### 3.4 TelegramボットUX

```
/start → 言語を選択: [Uzbek] [Russian] [English] [日本語]
       → [💼 アドバイスを得る] [📄 書類を作成] [🛒 販売ボット]

アドバイス: ユーザーが入力 → AI回答 + [👍] [👎] [📋 保存]
書類: テンプレート → 質問 → PDF/DOCX → Telegramに送信
```

---

## 4. 技術アーキテクチャ

### 4.1 スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 18 + TypeScript + Vite + Tailwind CSS + Radix UI |
| 状態管理 | Zustand + React Query |
| バックエンド | Supabase Edge Functions（Deno）+ Hono |
| データベース | Supabase PostgreSQL + pgvector |
| 認証 | Supabase Auth（マルチテナント）|
| AI（80%）| Claude Haiku 3.5 |
| AI（20%）| Claude Sonnet 4 |
| Telegram | grammY framework（Deno）|
| 書類生成 | pdf-lib + docx |
| 決済 | Click API + Payme API |
| ホスティング | Netlify + Supabase |
| モニタリング | Sentry |

### 4.2 LLMルーターロジック

```typescript
function routeToLLM(query: string): LLMChoice {
  if (cache.has(query.normalized)) return cache.get(query);
  const complexity = classifyQuery(query);
  if (complexity === 'simple')   return { model: 'claude-haiku-3-5', maxTokens: 500 };
  if (complexity === 'document') return { model: 'claude-sonnet-4',  maxTokens: 2000 };
  if (complexity === 'analysis') return { model: 'claude-sonnet-4',  maxTokens: 1500 };
  return { model: 'claude-haiku-3-5', maxTokens: 800 };
}
```

---

## 5. 品質基準

| 基準 | 標準 |
|---|---|
| AI精度 | 単純な質問で95%以上 |
| ハルシネーション | 価格/日付データで0% |
| 応答時間 | <3秒（Haiku）、<8秒（Sonnet）|
| 「わかりません」| 信頼度<70% → 免責事項 |

---

## 6. 収益化

| プラン | 料金 | AI | 書類 | 販売ボット |
|---|---|---|---|---|
| **無料** | 0 UZS | 5/日 | 2/月 | なし |
| **起業家** | 49,000 UZS/月 | 50/日 | 20/月 | 1 |
| **ビジネス** | 149,000 UZS/月 | 無制限 | 無制限 | 5 |
| **企業** | 499,000 UZS/月 | 無制限+ | 無制限 | 20 |

**支払い:** Click、Payme、銀行振込（企業プラン）

---

## 7. データベーススキーマ

```sql
subscriptions, payments, ai_conversations, ai_messages,
ai_feedback, doc_templates, doc_generated, sales_bots,
catalogs, orders, knowledge_base (pgvector), audit_log, usage_tracking
```

---

## 8. APIエンドポイント

| グループ | エンドポイント |
|---|---|
| AI | POST /v1/ai/chat、GET /v1/ai/conversations、POST /v1/ai/feedback |
| 書類 | GET /v1/doc-templates、POST /v1/docs/generate |
| 販売ボット | POST/GET /v1/sales-bots |
| ビリング | GET/POST /v1/billing/subscription、POST /v1/billing/webhook/click |
| Admin | GET /v1/admin/stats、GET /v1/admin/tenants |

---

## 9. セキュリティ

Supabase Auth + JWT、全テーブルにRLS、Supabase Vault（APIキー）、Zodバリデーション、レート制限、CORS、監査ログ、HTTPS。

---

## 10. 言語

| 言語 | コード | 用途 |
|---|---|---|
| ウズベク語（ラテン文字）| `uz` | 主要言語 |
| ロシア語 | `ru` | 第二言語 |
| English | `en` | ダッシュボード、admin |
| 日本語 | `ja` | Telegramボット、ランディング |

---

## 11. 企業登録プロセス

### 11.1 問い合わせの受付

**問い合わせフォームのフィールド:**
- フルネーム / 担当者名
- 会社名
- 納税者番号（任意）
- 電話番号 *
- メール *
- 事業形態（個人 / 合同会社 / 株式会社 / その他）
- 従業員数
- 主な課題（任意）
- 知ったきっかけ

**プロセス:**
1. フォーム送信 → `contact_requests`テーブルに記録
2. super_admin/sub_adminへメール + システム通知
3. Adminが確認 → `contacted` → `invite_sent`
4. システムが会社メールに**一回限りのinvite URL**を送信（48時間有効）

### 11.2 企業登録（Invite URL）

**登録フォーム:**
- 会社: 正式名称、法的形態、納税者番号、住所、銀行口座情報
- Company Admin: 氏名、役職、電話、メール、パスワード

**登録後:**
1. アカウントが`status: "pending_approval"`で作成される
2. Adminが承認 → 会社へ「アカウントが承認されました！」メール
3. 却下の場合 → 会社へメール + 理由

### 11.3 アカウントステータス

```
contact_request → invite_sent → pending_approval → active → suspended / blocked
```

| ステータス | 意味 |
|---|---|
| `contact_request` | フォーム送信済み |
| `invite_sent` | Invite URL送信済み |
| `pending_approval` | 登録済み、承認待ち |
| `active` | アクティブ、フルアクセス |
| `suspended` | 支払い失敗（3日間の猶予）|
| `blocked` | 管理者によるブロック |

---

## 12. 従業員アカウント作成プロセス

### 12.1 HRによるアカウント作成

**新規従業員フォーム:**
- 個人情報: 氏名、生年月日、性別、パスポート、JSHSHIR、電話、メール、住所
- 勤務情報: 役職、部署、ロール、入社日、給与、雇用形態
- 追加情報: 血液型（任意）、緊急連絡先

### 12.2 自動プロセス

```
1. HRがフォームを送信
2. システムがアカウントを作成（status: "password_pending"）
3. 従業員メールにパスワード設定URLを送信（24時間有効）
4. HRへ警告: 「すぐに従業員に電話してください」
5. 従業員がパスワードを設定
6. HRへ警告: 「承認を待っています」
7. HRが承認 → 従業員へ「アカウントが承認されました！」メール
```

### 12.3 従業員アカウントステータス

```
password_pending → password_set → active → blocked
```

| ステータス | 意味 |
|---|---|
| `password_pending` | HRが作成、従業員未設定 |
| `password_set` | パスワード設定済み、HR承認待ち |
| `active` | HR承認済み、フルアクセス |
| `blocked` | HRまたはcompany_adminによるブロック |

---

## 13. ログインと認証ページ

### 13.1 ログインページ

```
- メールとパスワードでログイン
- 「パスワードを忘れた」リンク
- ステータスメッセージ（pending/suspended/blocked）
- 「会社を登録していませんか？」→ 問い合わせフォーム
- 言語セレクター（uz/ru/en/ja）
```

### 13.2 パスワードリセット

```
/login → 「パスワードを忘れた」
→ /forgot-password → メール入力
→ リセットURLをメールに送信（15分有効）
→ /reset-password?token=... → 新しいパスワード
→ /login + 「パスワードが更新されました」
```

### 13.3 お問い合わせページ（`/contact`）

```
対象: 公開（誰でも）
目的: システムを試したい企業の最初のステップ

ページ内容:
  1. 簡単な説明
  2. お問い合わせフォーム
  3. 待機時間: 「1営業日以内に回答」
  4. 直接連絡: Telegram、電話
```

---

## 14. SUPER ADMIN AIシステム

### 14.1 Admin AIアシスタント（`/admin/ai-chat`）

**定型質問:**
- 「今日のシステム状態は？」
- 「過去7日間で最もエラーが多かった企業は？」
- 「チャーンリスクが高い企業はどこ？」

**専門エージェント:**
1. **KBエージェント** — KB不足箇所、新コンテンツ提案、品質分析
2. **サポートエージェント** — 企業問題の分析、迅速な解決策
3. **アナリティクスエージェント** — MRR変化、チャーン確率、利用統計
4. **ヘルスエージェント** — リアルタイムシステム状態監視、異常検知

### 14.2 システムヘルスモニタリング（`/admin/health`）

```
リアルタイムチェック:
  🟢/🔴 Supabase DB（レイテンシ、接続数）
  🟢/🔴 Supabase Auth（応答時間）
  🟢/🔴 Anthropic API（ping、クォータ）
  🟢/🔴 OpenAI API（埋め込みエンドポイント）
  🟢/🔴 Telegramボット（webhookステータス）
  🟢/🔴 Resend Email（配信率）
  🟢/🔴 Netlify（ビルドステータス）

メトリクス（過去24時間）:
  - 総リクエスト数、エラー率、平均応答時間
  - AI使用クレジット、アクティブ企業数
```

---

*SPEC.md — AI Business Concierge v3.0*
*更新: 2026-05-06 — ロールアーキテクチャ、企業オンボーディング、従業員オンボーディング、Admin AI*
