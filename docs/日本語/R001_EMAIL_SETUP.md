# R-001: Resend Email Inbox – セットアップ

リアルなメールメッセージをInboxに追加するための Resend Inbound と Webhook の設定。

**ドメイン:** 実際のドメインがない場合、Resendの無料ドメイン`*.resend.app`を使用できます。あなたのドメイン: `doroufdalu.resend.app` – どのアドレス（`inbox@doroufdalu.resend.app`、`support@doroufdalu.resend.app`など）でも受信可能です。

---

## 1. Resendアカウントと受信ドメイン

1. [resend.com](https://resend.com)にアクセス（またはサインアップ）
2. **Emails** → **Receiving**タブ
3. **⋯**（三点）→ **Receiving address** – ここに割り当てられたドメインが表示される
4. ドメインは例: `ai-business-concierge1.resend.app`または`re_xxxxx.resend.app`
5. このドメインの**どのアドレス**でもメールが受信される

---

## 2. Webhookの設定

**Webhook**はEmailsの中ではなく、左メニューの**Webhooks**セクションで設定します。

1. 左メニューから**Webhooks**を選択
2. **Add Webhook**をクリック
3. **Endpoint URL**に以下を入力:
   ```
   https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/inbox/webhook/resend
   ```
4. **Event type:** `email.received`を選択
5. **Add**をクリック
6. Webhook作成後、**Signing Secret**（whsec_...）をコピー

---

## 3. Supabase Edge Functionシークレット

1. **Supabase Dashboard** → **Edge Functions** → **bright-api** → **Secrets**
2. **Add secret:**
   - Name: `RESEND_WEBHOOK_SECRET`
   - Value: ResendからコピーしたSigning Secret（whsec_...）

---

## 4. テナント・メールマッピング（Supabase SQL）

1. **Supabase Dashboard** → **SQL Editor** → **New query**
2. 以下のSQLを実行:

```sql
-- t_001テナント: doroufdalu.resend.app
insert into tenant_inbox_emails (tenant_id, email_address, source) values
  ('t_001', 'inbox@doroufdalu.resend.app', 'resend')
on conflict (email_address) do update set tenant_id = excluded.tenant_id;
```

---

## 5. クイック手順

| # | 手順 | 場所 |
|---|------|------|
| 1 | Resendにログイン | [resend.com](https://resend.com) |
| 2 | **Emails** → **Receiving**タブ | 左メニュー |
| 3 | **⋯** → **Receiving address** | ドメインを確認 |
| 4 | **Webhooks** → **Add Webhook** | [resend.com/webhooks](https://resend.com/webhooks) |
| 5 | エンドポイントURLを入力 | Endpoint |
| 6 | Event: `email.received` | 選択 |
| 7 | **Signing Secret**をコピー | Webhook作成後 |
| 8 | Supabase → bright-api → Secrets → `RESEND_WEBHOOK_SECRET` | シークレット追加 |
| 9 | Supabase SQL Editor → `tenant_inbox_emails`にinsert | 上記SQL |
| 10 | `inbox@doroufdalu.resend.app`にメール送信 | テスト |

---

## 6. スキーマ更新

`tenant_inbox_emails`テーブルが存在しない場合:

```sql
create table if not exists tenant_inbox_emails (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references tenants(id) on delete cascade,
  email_address text not null,
  source text not null default 'resend',
  created_at timestamptz not null default now(),
  unique (email_address)
);
create index if not exists tenant_inbox_emails_email_idx on tenant_inbox_emails (email_address);
create index if not exists tenant_inbox_emails_tenant_idx on tenant_inbox_emails (tenant_id);
alter table tenant_inbox_emails enable row level security;
```

---

## 7. テスト

1. `inbox@doroufdalu.resend.app`にメールを送信
2. 数秒後、Inboxページに新しいメッセージが表示されるはずです

---

## 8. トラブルシューティング

| # | 確認事項 | 場所 |
|---|----------|------|
| 1 | メールがResendに届いたか？ | **Resend** → **Emails** → **Receiving**タブ |
| 2 | Webhookが発火したか？ | **Resend** → **Webhooks** → Recent deliveries – ステータス200 |
| 3 | Edge Functionがリクエストを受け取ったか？ | **Supabase** → **Edge Functions** → **Logs** |
| 4 | `tenant_inbox_emails`マッピングはあるか？ | Supabase SQL Editor |
| 5 | `RESEND_WEBHOOK_SECRET`は正しいか？ | ResendウェブフックのSigning Secretと同一であること |
