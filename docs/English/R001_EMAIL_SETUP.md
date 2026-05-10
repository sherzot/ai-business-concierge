# R-001: Resend Email Inbox – Setup

Setting up Resend Inbound and webhook to add real email messages to the Inbox.

**Domain:** If you don't have a real domain, you can use Resend's free `*.resend.app` domain. Your domain: `doroufdalu.resend.app` – any address (`inbox@doroufdalu.resend.app`, `support@doroufdalu.resend.app`, etc.) is accepted.

---

## 1. Resend Account and Receiving Domain

1. Go to [resend.com](https://resend.com) (or sign up)
2. **Emails** → **Receiving** tab
3. **⋯** (three dots) → **Receiving address** – your assigned domain appears here
4. Domain looks like: `ai-business-concierge1.resend.app` or `re_xxxxx.resend.app`
5. **Any** address under this domain is accepted

---

## 2. Webhook Setup

**Webhook** is configured in the **Webhooks** section in the left menu, not inside Emails.

1. Select **Webhooks** from the left menu
2. Click **Add Webhook**
3. Enter the following in **Endpoint URL**:
   ```
   https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/inbox/webhook/resend
   ```
4. **Event type:** Select `email.received`
5. Click **Add**
6. After the webhook is created, copy the **Signing Secret** (whsec_...)

---

## 3. Supabase Edge Function Secrets

1. **Supabase Dashboard** → **Edge Functions** → **bright-api** → **Secrets**
2. **Add secret:**
   - Name: `RESEND_WEBHOOK_SECRET`
   - Value: Signing Secret copied from Resend (whsec_...)

---

## 4. Tenant-Email Mapping (Supabase SQL)

1. **Supabase Dashboard** → **SQL Editor** → **New query**
2. Run the following SQL:

```sql
-- t_001 tenant: doroufdalu.resend.app
insert into tenant_inbox_emails (tenant_id, email_address, source) values
  ('t_001', 'inbox@doroufdalu.resend.app', 'resend')
on conflict (email_address) do update set tenant_id = excluded.tenant_id;
```

---

## 5. Quick Steps

| # | Step | Where |
|---|------|-------|
| 1 | Log in to Resend | [resend.com](https://resend.com) |
| 2 | **Emails** → **Receiving** tab | Left menu |
| 3 | **⋯** → **Receiving address** | View your domain |
| 4 | **Webhooks** → **Add Webhook** | [resend.com/webhooks](https://resend.com/webhooks) |
| 5 | Enter the endpoint URL | Endpoint |
| 6 | Event: `email.received` | Select |
| 7 | Copy the **Signing Secret** | After webhook is created |
| 8 | Supabase → bright-api → Secrets → `RESEND_WEBHOOK_SECRET` | Add secret |
| 9 | Supabase SQL Editor → insert into `tenant_inbox_emails` | SQL above |
| 10 | Send email to `inbox@doroufdalu.resend.app` | Test |

---

## 6. Schema Update

If `tenant_inbox_emails` table doesn't exist:

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

## 7. Testing

1. Send an email to `inbox@doroufdalu.resend.app`
2. A few seconds later, the new message should appear in the Inbox page

---

## 8. Troubleshooting

| # | Check | Where |
|---|-------|-------|
| 1 | Did the email reach Resend? | **Resend** → **Emails** → **Receiving** tab |
| 2 | Did the webhook fire? | **Resend** → **Webhooks** → Recent deliveries – status 200 |
| 3 | Did the Edge Function receive a request? | **Supabase** → **Edge Functions** → **Logs** |
| 4 | Is the `tenant_inbox_emails` mapping present? | Supabase SQL Editor |
| 5 | Is `RESEND_WEBHOOK_SECRET` correct? | Same as Resend webhook Signing Secret |
