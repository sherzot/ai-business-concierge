# CONNECTIONS.md — 外部サービスとインテグレーション

> AI Business Concierge — すべての外部接続設定ガイド
> バージョン: 1.0 · 更新: 2026-04-29
> オーナー: Sher（PM/PL）

---

## 目次

1. [ステータスマトリクス](#1-ステータスマトリクス)
2. [Supabase](#2-supabase)
3. [Anthropic Claude](#3-anthropic-claude)
4. [OpenAI](#4-openai)
5. [Telegramボット](#5-telegramボット)
6. [Click & Payme](#6-click--payme)
7. [Resend](#7-resend)
8. [Sentry](#8-sentry)
9. [Netlify](#9-netlify)
10. [接続ヘルスチェック](#10-接続ヘルスチェック)

---

## 1. ステータスマトリクス

| サービス | フェーズ | ステータス (2026-04-29) | 必要なシークレット |
|---|---|---|---|
| Supabase | 0 | ✅ 設定済み | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` |
| Anthropic Claude | 0 | ❌ キーが必要 | `ANTHROPIC_API_KEY` |
| OpenAI (embedding) | 0 | ❌ キーが必要 | `OPENAI_API_KEY` |
| Telegram bot | 1 | ❌ ボットが必要 | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` |
| Sentry | 0 | ⚠️ 任意 | `SENTRY_DSN` |
| Resend | 1 | ❌ 後で | `RESEND_API_KEY` |
| Click | 3 | ❌ 後で | `CLICK_MERCHANT_ID`, `CLICK_SERVICE_ID`, `CLICK_SECRET_KEY` |
| Payme | 3 | ❌ 後で | `PAYME_MERCHANT_ID`, `PAYME_KEY` |
| Netlify | 0 | ✅ 設定済み | — |

---

## 2. Supabase

### 2.1 プロジェクト情報の取得

1. https://supabase.com → Dashboard → Projects → あなたのプロジェクト
2. **Settings → API**ページ:
   - `Project URL` → `SUPABASE_URL`
   - `anon public`キー → `SUPABASE_ANON_KEY`（フロントエンド用）
   - `service_role`キー → `SUPABASE_SERVICE_ROLE_KEY`（**秘密！**）
   - `JWT Secret` → `JWT_SECRET`

### 2.2 マイグレーションのプッシュ

```bash
supabase link --project-ref <your-project-ref>
supabase db push
supabase db remote sql --query "select * from phase0_rls_health;"
```

### 2.3 Edge Functionsのデプロイ

```bash
supabase functions deploy server --project-ref <ref>
supabase functions deploy telegram-bot --project-ref <ref>
```

### 2.4 シークレットの設定

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref <ref>
supabase secrets set OPENAI_API_KEY=sk-... --project-ref <ref>
supabase secrets set JWT_SECRET=... --project-ref <ref>
```

---

## 3. Anthropic Claude

### 3.1 キーの作成

1. https://console.anthropic.com → 登録
2. **Settings → API Keys → Create Key**
3. キータイプ: `Production`
4. キー名: `ai-business-concierge-prod`
5. `sk-ant-api03-...`キーをコピー — 再表示されません！

### 3.2 設定

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-... --project-ref <ref>
```

### 3.3 スモークテスト

```bash
curl -X POST "https://<your-project>.supabase.co/functions/v1/server/v1/ai/chat" \
  -H "Authorization: Bearer <user-jwt>" \
  -H "X-Tenant-Id: <tenant-id>" \
  -H "Content-Type: application/json" \
  -d '{"message": "こんにちは！あなたは誰ですか？", "locale": "ja"}'
```

---

## 4. OpenAI

**エンベディング**（text-embedding-3-small）にのみ必要です。Claudeの推論には使用されません。

### 4.1 キー

1. https://platform.openai.com/api-keys → **Create new secret key**
2. 権限: `Restricted` → embeddingsのみ
3. 名前: `aibc-embedding-only`

### 4.2 設定

```bash
supabase secrets set OPENAI_API_KEY=sk-... --project-ref <ref>
```

---

## 5. Telegramボット

### 5.1 ボットの作成

1. [@BotFather](https://t.me/BotFather)にメッセージを送る
2. `/newbot` → ボット名とユーザー名を指定
3. BotFatherがトークン（`123456789:ABC-DEF...`）を提供

### 5.2 Webhookシークレット

```bash
openssl rand -hex 32
```

### 5.3 設定

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=123456789:ABC... --project-ref <ref>
supabase secrets set TELEGRAM_WEBHOOK_SECRET=<random-hex> --project-ref <ref>
```

### 5.4 Webhookの接続（フェーズ1）

```bash
curl -F "url=https://<your-project>.supabase.co/functions/v1/telegram-bot" \
     -F "secret_token=<TELEGRAM_WEBHOOK_SECRET>" \
     "https://api.telegram.org/bot<TOKEN>/setWebhook"
```

---

## 6. Click & Payme

> ⚠️ フェーズ3（第10〜13週）。今すぐ設定する必要はありませんが、事前にアカウントを開設しておくと便利です（KYCに時間がかかります）。

### 6.1 Click

1. https://merchant.click.uz → 登録
2. Prepare URL: `.../billing/webhook/click/prepare`
3. Complete URL: `.../billing/webhook/click/complete`

### 6.2 Payme

1. https://merchant.payme.uz → 申請
2. Webhook URL: `.../billing/webhook/payme`

---

## 7. Resend

> フェーズ1（第3〜5週）。Resend経由でメール通知。

1. https://resend.com → サインアップ
2. **API Keys → Create API Key** → `aibc-prod`

```bash
supabase secrets set RESEND_API_KEY=re_... --project-ref <ref>
supabase secrets set RESEND_WEBHOOK_SECRET=whsec_... --project-ref <ref>
```

---

## 8. Sentry

### 8.1 プロジェクトの作成

1. https://sentry.io → New Project
2. **Browser/React**用: `ai-business-concierge-frontend` → DSN → `VITE_SENTRY_DSN`
3. **Node/Deno**用: `ai-business-concierge-backend` → DSN → `SENTRY_DSN`

### 8.2 設定

```bash
# フロントエンド (.env)
VITE_SENTRY_DSN=https://...@o123.ingest.sentry.io/456
VITE_SENTRY_ENVIRONMENT=production

# バックエンド
supabase secrets set SENTRY_DSN=https://...@o123.ingest.sentry.io/789 --project-ref <ref>
```

---

## 9. Netlify

### 9.1 フロントエンドのデプロイ

1. https://app.netlify.com → New site from Git
2. ビルド設定:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

### 9.2 リダイレクト（SPAフォールバック）

`frontend/public/_redirects`に:
```
/*    /index.html   200
```

---

## 10. 接続ヘルスチェック

```bash
# ヘルスチェック
curl https://<project>.supabase.co/functions/v1/server/health
# → { "status": "ok" }

# AIチャット
curl -X POST https://<project>.supabase.co/functions/v1/server/v1/ai/chat \
  -H "Authorization: Bearer <jwt>" \
  -H "X-Tenant-Id: <tid>" \
  -H "Content-Type: application/json" \
  -d '{"message":"2026年の消費税率は？","locale":"ja"}'
# → 返答、llm_model: claude-...、kb_found: true
```

---

## 注意事項

- **絶対に**実際のシークレットを`.env.example`に書かない
- 本番シークレットのローテーション: 90日ごとにトークンを更新

---

*CONNECTIONS.md v1.0 — すべてのインテグレーションを一箇所に*
