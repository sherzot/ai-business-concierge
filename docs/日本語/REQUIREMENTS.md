# AI Business Concierge – 要件定義

このドキュメントはプロジェクトの要件と今後の方向性を定義します。新機能を追加する際はこのドキュメントを参照してください。

> 2026-08-11更新。現在snapshot: [STATUS.md](STATUS.md)。Status: Done、Partial、Skeleton、Planned。

---

## 1. 現状（MVP）

### 1.1 認証・ロール
- [x] Supabase Auth（メール/パスワード）
- [x] マルチテナント: `tenants`、`user_tenants`
- [x] ロール: super_admin、sub_admin、company_admin、leader、hr、accounting/accountant、department_head/manager、employee
- [x] ロールベースアクセス: `canAccess(module)`
- [x] テナント切り替え

### 1.2 モジュール
- [x] Reports – KPI、ヘルススコア、日次レポート
- [x] Inbox – 統合受信ボックス（メール/Telegram）
- [x] Tasks – ボード/リスト、CRUD
- [x] HR – ケース、アンケート
- [x] Docs – リスト、検索、インデックス
- [x] Integrations – Telegram、メール、AmoCRM
- [x] AI Concierge – チャット、ツール
- [x] Settings – プロフィール、言語

### 1.3 技術スタック
- フロントエンド: React + Vite + TypeScript
- バックエンド: Supabase Edge Function（Hono）
- DB: Supabase Postgres
- デプロイ: Netlify + Supabase

---

## 2. 今後の要件（優先度順）

### 2.1 高優先度
| ID | 要件 | 説明 | モジュール |
|----|------|------|----------|
| R-001 | リアル受信ボックス統合 | Email（Resend）webhook – 部分実装済み ✅ | Inbox |
| R-002 | リアルタイム更新 | Supabase Realtime – inbox、tasks ✅ | Inbox、Tasks |
| R-015 | タスク割り当て通知 | リーダーが割り当てた際の担当者への通知、確認、ステータスの透明性 ✅ | Tasks |
| R-016 | HR Candidate Analysis | Skeleton; GitHub/CV/LLM business logicとtestsが残る | HR |
| R-017 | AI rate limiting | Partial; DB-backed AI limitあり、unified plan/endpoint policyが残る | Backend |
| R-018 | AI cost tracking | Partial; loggingあり、tenant dashboard/enforcementが残る | Backend |
| R-019 | Vector Search (RAG) | Partial; vector/embedding基盤あり、explicit tool/citationsが残る | Docs |
| R-020 | Admin Dashboard | Partial; core pagesあり、billing/advanced agentsが残る | Admin |
| R-021 | AI書類メーカーbinary output | Staging verified / production pending。実PDF/DOCX、embedded Noto Sans JP、private Storage、canonical path、restrictive RLS、60秒signed URLはgreen | Docs |
| R-003 | 課金/支払い | サブスクリプション、プラン、支払い履歴 | 新規 |
| R-004 | 監査ログ表示 | Admin audit logページとbackend endpoint ✅ | Settings |
| R-005 | エクスポート/インポート | Excel、CSVエクスポート、一括インポート | Reports、Tasks |

### 2.2 中優先度
| ID | 要件 | 説明 | モジュール |
|----|------|------|----------|
| R-006 | プッシュ/通知 | ブラウザプッシュ、メール通知 | すべて |
| R-007 | モバイル対応 | Partial PWA shell; deep offline sync/pushが残る | すべて |
| R-008 | 多言語対応拡張 | Done: uz、ru、en、ja | Settings |
| R-009 | カスタムブランディング | テナント別ロゴ・カラー | Settings |
| R-010 | API レート制限 | Partial: AI protectionあり、unified API policyが残る | Backend |

### 2.3 低優先度
| ID | 要件 | 説明 | モジュール |
|----|------|------|----------|
| R-011 | SSO / OAuth | Google、Microsoftログイン | Auth |
| R-012 | 2FA | 二要素認証 | Auth |
| R-013 | 高度な分析 | カスタムレポート、グラフ | Reports |
| R-014 | Webhook送信 | 外部システムへのイベント送信 | Integrations |

---

## 3. 要件追加のルール

新しい要件を追加する際:
1. **ID** – `R-XXX`形式（次の番号）
2. **説明** – 簡潔・明確
3. **モジュール** – どのモジュールに属するか
4. **優先度** – 高 / 中 / 低
5. **依存関係** – 他の要件への依存

---

## 4. アーキテクチャ原則

- **Feature-based** – 各モジュールは独自の`features/`フォルダに
- **API-first** – まずバックエンドのエンドポイント、次にフロントエンド
- **ロールベース** – 各モジュールは`canAccess`をチェック
- **テナント分離** – すべてのデータは`tenant_id`で分離
