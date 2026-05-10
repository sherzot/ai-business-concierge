# R-001: Resend Email Inbox – Настройка

Настройка Resend Inbound и webhook для добавления реальных email-сообщений в Inbox.

**Домен:** Если у вас нет реального домена, можно использовать бесплатный домен Resend `*.resend.app`. Ваш домен: `doroufdalu.resend.app` – принимается любой адрес (`inbox@doroufdalu.resend.app`, `support@doroufdalu.resend.app` и т.д.).

---

## 1. Аккаунт Resend и домен для приёма

1. Зайдите на [resend.com](https://resend.com) (или зарегистрируйтесь)
2. **Emails** → вкладка **Receiving**
3. **⋯** (три точки) → **Receiving address** – здесь отображается ваш домен
4. Домен выглядит так: `ai-business-concierge1.resend.app` или `re_xxxxx.resend.app`
5. На **любой** адрес этого домена будут приниматься письма

---

## 2. Настройка Webhook

**Webhook** настраивается не внутри Emails, а в разделе **Webhooks** в левом меню.

1. Выберите **Webhooks** в левом меню
2. Нажмите **Add Webhook**
3. В поле **Endpoint URL** введите:
   ```
   https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/inbox/webhook/resend
   ```
4. **Event type:** выберите `email.received`
5. Нажмите **Add**
6. После создания вебхука скопируйте **Signing Secret** (whsec_...)

---

## 3. Секреты Supabase Edge Function

1. **Supabase Dashboard** → **Edge Functions** → **bright-api** → **Secrets**
2. **Add secret:**
   - Name: `RESEND_WEBHOOK_SECRET`
   - Value: Signing Secret, скопированный из Resend (whsec_...)

---

## 4. Маппинг тенант-email (Supabase SQL)

1. **Supabase Dashboard** → **SQL Editor** → **New query**
2. Выполните следующий SQL:

```sql
-- тенант t_001: doroufdalu.resend.app
insert into tenant_inbox_emails (tenant_id, email_address, source) values
  ('t_001', 'inbox@doroufdalu.resend.app', 'resend')
on conflict (email_address) do update set tenant_id = excluded.tenant_id;
```

---

## 5. Краткий порядок действий

| # | Шаг | Где |
|---|-----|-----|
| 1 | Войдите в Resend | [resend.com](https://resend.com) |
| 2 | **Emails** → вкладка **Receiving** | Левое меню |
| 3 | **⋯** → **Receiving address** | Посмотрите свой домен |
| 4 | **Webhooks** → **Add Webhook** | [resend.com/webhooks](https://resend.com/webhooks) |
| 5 | Введите URL эндпоинта | Endpoint |
| 6 | Event: `email.received` | Выберите |
| 7 | Скопируйте **Signing Secret** | После создания вебхука |
| 8 | Supabase → bright-api → Secrets → `RESEND_WEBHOOK_SECRET` | Добавьте секрет |
| 9 | Supabase SQL Editor → insert в `tenant_inbox_emails` | SQL выше |
| 10 | Отправьте письмо на `inbox@doroufdalu.resend.app` | Тест |

---

## 6. Обновление схемы

Если таблицы `tenant_inbox_emails` нет:

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

## 7. Тестирование

1. Отправьте письмо на `inbox@doroufdalu.resend.app`
2. Через несколько секунд новое сообщение должно появиться на странице Inbox

---

## 8. Устранение проблем

| # | Проверка | Где |
|---|----------|-----|
| 1 | Дошло ли письмо до Resend? | **Resend** → **Emails** → вкладка **Receiving** |
| 2 | Сработал ли вебхук? | **Resend** → **Webhooks** → Recent deliveries – статус 200 |
| 3 | Получила ли Edge Function запрос? | **Supabase** → **Edge Functions** → **Logs** |
| 4 | Есть ли маппинг `tenant_inbox_emails`? | Supabase SQL Editor |
| 5 | Верен ли `RESEND_WEBHOOK_SECRET`? | Должен совпадать с Signing Secret вебхука Resend |
