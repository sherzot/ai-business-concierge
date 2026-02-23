# AI Business Concierge – Push va Deploy qo'llanmasi

Bu hujjat loyihani GitHub, Supabase va Netlify ga push va deploy qilish uchun bosqichma-bosqich ko'rsatma beradi.

---

## 1. Oldindan talablar

- **Node.js** 18+ (20 tavsiya etiladi)
- **Git** – versiya nazorati
- **Supabase CLI** – `npm i -g supabase` yoki `brew install supabase/tap/supabase`
- **GitHub** hisobi
- **Supabase** hisobi – [supabase.com](https://supabase.com)
- **Netlify** hisobi – [netlify.com](https://netlify.com)

---

## 2. Loyihani klonlash va dependencies

```bash
# Loyihani klonlash (agar allaqachon klon qilingan bo'lsa, o'tkazib yuboring)
git clone git@github.com:sherzot/ai-business-concierge.git
cd ai-business-concierge

# Frontend dependencies
cd frontend && npm install && cd ..
```

---

## 3. GitHub ga login va push

### 3.1 GitHub ga kirish

1. [github.com](https://github.com) ga kiring
2. O'zingizning hisobingizga login qiling
3. SSH yoki HTTPS orqali repo ga ulanish:
   - SSH: `git@github.com:sherzot/ai-business-concierge.git`
   - HTTPS: `https://github.com/sherzot/ai-business-concierge.git`

### 3.2 O'zgarishlarni push qilish

```bash
# O'zgarishlarni ko'rish
git status

# Barcha o'zgarishlarni qo'shish
git add .

# Commit
git commit -m "Deploy tayyorligi: .env.example, DEPLOY_SETUP.md"

# Push (main branch)
git push origin main
```

**Eslatma:** Agar `main` o'rniga `master` bo'lsa: `git push origin master`

---

## 4. Supabase sozlash

### 4.1 Supabase ga kirish

1. [supabase.com/dashboard](https://supabase.com/dashboard) ga kiring
2. Login qiling yoki yangi loyiha yarating

### 4.2 Loyiha yaratish yoki mavjud loyihaga ulanish

**Yangi loyiha:**
1. **New Project** bosing
2. Loyiha nomi, parol, region tanlang
3. Loyiha yaratilgach, **Project Settings** → **General** dan **Reference ID** va **API keys** ni oling

**Mavjud loyiha (ufhepwdkjqptjvxrmpjn):**
- Project ID: `ufhepwdkjqptjvxrmpjn`
- Dashboard: `https://supabase.com/dashboard/project/ufhepwdkjqptjvxrmpjn`

### 4.3 Supabase CLI orqali ulanish

```bash
# Supabase ga login
supabase login

# Loyihaga ulanish (agar yangi bo'lsa)
supabase link --project-ref ufhepwdkjqptjvxrmpjn
```

### 4.4 Ma'lumotlar bazasi (schema va migrations)

1. **Supabase Dashboard** → **SQL Editor** → **New query**
2. `supabase/schema.sql` faylini oching va barcha SQL ni nusxalab, SQL Editor ga yopishtiring → **Run**
3. Migratsiyalarni bajarish:
   - `supabase/migrations/20250213000000_task_notifications.sql`
   - `supabase/migrations/20260205_r002_realtime.sql`

Yoki CLI orqali:

```bash
supabase db push
# yoki
supabase migration up
```

### 4.5 Edge Function deploy

```bash
supabase functions deploy bright-api
```

### 4.6 Edge Function secrets

**Supabase Dashboard** → **Edge Functions** → **bright-api** → **Secrets** → **Add secret**

| Secret nomi | Qiymat | Majburiy |
|-------------|--------|----------|
| `SUPABASE_URL` | `https://ufhepwdkjqptjvxrmpjn.supabase.co` | Ha |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role | Ha |
| `OPENAI_API_KEY` | OpenAI API key | Ha (AI uchun) |
| `RESEND_WEBHOOK_SECRET` | Resend webhook signing secret (whsec_...) | Yo'q (R-001 email uchun) |

### 4.7 Demo foydalanuvchilar

[DEMO_USERS.md](DEMO_USERS.md) da ko'rsatilgan hisoblarni yarating va `user_tenants` ga qo'shing.

---

## 5. Netlify sozlash

### 5.1 Netlify ga kirish

1. [app.netlify.com](https://app.netlify.com) ga kiring
2. GitHub bilan login qiling (tavsiya etiladi)

### 5.2 Yangi site – GitHub dan import

1. **Add new site** → **Import an existing project**
2. **GitHub** ni tanlang
3. Repo: `sherzot/ai-business-concierge`
4. **Build settings** (avtomatik `netlify.toml` dan olinadi):
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`

### 5.3 Environment variables

**Site settings** → **Environment variables** → **Add a variable** → **Add single variable**

| Key | Value | Scopes |
|-----|-------|--------|
| `VITE_SUPABASE_PROJECT_ID` | `ufhepwdkjqptjvxrmpjn` | All |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (Project Settings → API) | All |

**Eslatma:** `VITE_` prefixi Vite build da o'zgaruvchini expose qiladi.

### 5.4 Deploy

- **Deploy** tugmasi yoki `main` branch ga push qilganda avtomatik deploy bo'ladi
- Deploy tugagach, Netlify sizga URL beradi (masalan: `https://random-name-123.netlify.app`)

---

## 6. Qisqacha tartib (checklist)

| # | Qadam | Holat |
|---|-------|-------|
| 1 | `cd frontend && npm install` | ✅ |
| 2 | GitHub ga login, `git push origin main` | Siz bajarasiz |
| 3 | Supabase Dashboard – schema.sql, migrations | Siz bajarasiz |
| 4 | `supabase login` va `supabase link` | Siz bajarasiz |
| 5 | `supabase functions deploy bright-api` | Siz bajarasiz |
| 6 | Supabase → bright-api → Secrets qo'shish | Siz bajarasiz |
| 7 | Netlify – GitHub repo import | Siz bajarasiz |
| 8 | Netlify → Environment variables | Siz bajarasiz |
| 9 | Deploy | Avtomatik yoki qo'lda |

---

## 7. Tezkor tekshirish

### Lokal build

```bash
cd frontend
npm run build
```

Agar xato bo'lmasa – Netlify build ham muvaffaqiyatli bo'ladi.

### Supabase Edge Function

```bash
curl "https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/health"
```

`{"data":{"ok":true},...}` kabi javob kelsa – Edge Function ishlayapti.

---

## 8. Qo'shimcha hujjatlar

- [R001_EMAIL_SETUP.md](R001_EMAIL_SETUP.md) – Resend email inbox
- [R002_REALTIME_SETUP.md](R002_REALTIME_SETUP.md) – Supabase Realtime
- [R015_TASK_NOTIFICATIONS.md](R015_TASK_NOTIFICATIONS.md) – Vazifa bildirishnomalari
- [DEMO_USERS.md](DEMO_USERS.md) – Demo hisoblar
