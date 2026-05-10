# R-001: Resend Email Inbox – Sozlash

Real email xabarlarini Inbox ga qo'shish uchun Resend Inbound va webhook sozlash.

**Domen:** Haqiqiy domen bo'lmasa, Resend'ning bepul `*.resend.app` domenidan foydalanishingiz mumkin. Sizda: `doroufdalu.resend.app` – har qanday manzil (`inbox@doroufdalu.resend.app`, `support@doroufdalu.resend.app` va hokazo) qabul qilinadi.

---

## 1. Resend hisob va receiving domen

1. [resend.com](https://resend.com) ga kiring (yoki ro'yxatdan o'ting)
2. **Emails** → **Receiving** tab
3. **⋯** (uch nuqta) → **Receiving address** – bu yerda sizga berilgan domen ko'rinadi
4. Domen ko'rinishi: `ai-business-concierge1.resend.app` yoki `re_xxxxx.resend.app` kabi
5. Bu domen bilan **har qanday** manzilga kelgan email qabul qilinadi

---

## 2. Webhook sozlash

**Webhook** Emails ichida emas – chap menyudagi **Webhooks** bo'limida sozlanadi.

1. Chap menyudan **Webhooks** ni tanlang
2. **Add Webhook** bosing
3. **Endpoint URL** ga quyidagini kiriting:
   ```
   https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/inbox/webhook/resend
   ```
4. **Event type:** `email.received` ni tanlang
5. **Add** bosing
6. Webhook yaratilgach, **Signing Secret** (whsec_...) ni nusxalab oling

---

## 3. Supabase Edge Function secrets

1. **Supabase Dashboard** → **Edge Functions** → **bright-api** → **Secrets**
2. **Add secret:**
   - Name: `RESEND_WEBHOOK_SECRET`
   - Value: Resend'dan nusxalangan Signing Secret (whsec_...)

---

## 4. Tenant-email mapping (Supabase SQL)

1. **Supabase Dashboard** → **SQL Editor** → **New query**
2. Quyidagi SQL'ni ishga tushiring:

```sql
-- t_001 tenant: doroufdalu.resend.app
insert into tenant_inbox_emails (tenant_id, email_address, source) values
  ('t_001', 'inbox@doroufdalu.resend.app', 'resend')
on conflict (email_address) do update set tenant_id = excluded.tenant_id;
```

---

## 5. Qisqacha tartib

| # | Qadam | Qayerda |
|---|-------|---------|
| 1 | Resend'ga kiring | [resend.com](https://resend.com) |
| 2 | **Emails** → **Receiving** tab | Chap menyu |
| 3 | **⋯** → **Receiving address** | Domeningizni ko'ring |
| 4 | **Webhooks** → **Add Webhook** | [resend.com/webhooks](https://resend.com/webhooks) |
| 5 | URL'ni kiriting | Endpoint |
| 6 | Event: `email.received` | Tanlang |
| 7 | **Signing Secret** ni nusxalang | Webhook yaratilgach |
| 8 | Supabase → bright-api → Secrets → `RESEND_WEBHOOK_SECRET` | Secret qo'shing |
| 9 | Supabase SQL Editor → `tenant_inbox_emails` ga insert | Yuqoridagi SQL |
| 10 | `inbox@doroufdalu.resend.app` ga email yuboring | Sinov |

---

## 6. Schema yangilash

Agar `tenant_inbox_emails` jadvali yo'q bo'lsa:

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

## 7. Sinov

1. `inbox@doroufdalu.resend.app` ga email yuboring
2. Bir necha soniyadan keyin Inbox sahifasida yangi xabar paydo bo'lishi kerak

---

## 8. Muammo bo'lsa (troubleshooting)

| # | Tekshirish | Qayerda |
|---|------------|---------|
| 1 | Email Resend'ga yetganmi? | **Resend** → **Emails** → **Receiving** tab |
| 2 | Webhook ishlaganmi? | **Resend** → **Webhooks** → Recent deliveries – status 200 |
| 3 | Edge Function so'rov oldimi? | **Supabase** → **Edge Functions** → **Logs** |
| 4 | `tenant_inbox_emails` mapping bormi? | Supabase SQL Editor |
| 5 | `RESEND_WEBHOOK_SECRET` to'g'rimi? | Resend webhook Signing Secret bilan bir xil |
