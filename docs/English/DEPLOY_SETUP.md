# AI Business Concierge – Push and Deploy Guide

This document provides step-by-step instructions for pushing and deploying the project to GitHub, Supabase, and Netlify.

---

## 1. Prerequisites

- **Node.js** 18+ (20 recommended)
- **Git** – version control
- **Supabase CLI** – `npm i -g supabase` or `brew install supabase/tap/supabase`
- **GitHub** account
- **Supabase** account – [supabase.com](https://supabase.com)
- **Netlify** account – [netlify.com](https://netlify.com)

---

## 2. Clone Project and Install Dependencies

```bash
# Clone the project
git clone git@github.com:sherzot/ai-business-concierge.git
cd ai-business-concierge

# Frontend dependencies
cd frontend && npm install && cd ..
```

---

## 3. GitHub Login and Push

### 3.1 Log in to GitHub

1. Go to [github.com](https://github.com)
2. Log in to your account
3. Connect to the repo via SSH or HTTPS:
   - SSH: `git@github.com:sherzot/ai-business-concierge.git`
   - HTTPS: `https://github.com/sherzot/ai-business-concierge.git`

### 3.2 Push Changes

```bash
git status
git add .
git commit -m "Deploy preparation: .env.example, DEPLOY_SETUP.md"
git push origin main
```

---

## 4. Supabase Setup

### 4.1 Log in to Supabase

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in or create a new project

### 4.2 Create or Link to Existing Project

**Existing project:**
- Project ID: `ufhepwdkjqptjvxrmpjn`
- Dashboard: `https://supabase.com/dashboard/project/ufhepwdkjqptjvxrmpjn`

### 4.3 Link via Supabase CLI

```bash
supabase login
supabase link --project-ref ufhepwdkjqptjvxrmpjn
```

### 4.4 Database (Schema and Migrations)

```bash
supabase db push
# or
supabase migration up
```

### 4.5 Deploy Edge Function

```bash
supabase functions deploy bright-api
```

### 4.6 Edge Function Secrets

| Secret Name | Value | Required |
|-------------|-------|----------|
| `SUPABASE_URL` | `https://ufhepwdkjqptjvxrmpjn.supabase.co` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes (for AI) |
| `RESEND_WEBHOOK_SECRET` | Resend webhook signing secret | No |

### 4.7 Demo Users

Create the accounts shown in [DEMO_USERS.md](DEMO_USERS.md) and add them to `user_tenants`.

---

## 5. Netlify Setup

### 5.1 Log in to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Log in with GitHub

### 5.2 New Site – Import from GitHub

1. **Add new site** → **Import an existing project**
2. Select **GitHub**
3. Repo: `sherzot/ai-business-concierge`
4. **Build settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`

### 5.3 Environment Variables

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_PROJECT_ID` | `ufhepwdkjqptjvxrmpjn` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

### 5.4 Deploy

- Clicking **Deploy** or pushing to the `main` branch triggers an automatic deploy

---

## 6. Quick Checklist

| # | Step | Status |
|---|------|--------|
| 1 | `cd frontend && npm install` | ✅ |
| 2 | Login to GitHub, `git push origin main` | You do this |
| 3 | Supabase Dashboard – schema.sql, migrations | You do this |
| 4 | `supabase login` and `supabase link` | You do this |
| 5 | `supabase functions deploy bright-api` | You do this |
| 6 | Supabase → bright-api → Add Secrets | You do this |
| 7 | Netlify – Import GitHub repo | You do this |
| 8 | Netlify → Environment variables | You do this |
| 9 | Deploy | Automatic or manual |

---

## 7. Quick Checks

### Local Build

```bash
cd frontend
npm run build
```

### Supabase Edge Function

```bash
curl "https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/health"
```

If you get a response like `{"data":{"ok":true},...}` – the Edge Function is working.

---

## 8. Additional Documentation

- [R001_EMAIL_SETUP.md](R001_EMAIL_SETUP.md) – Resend email inbox
- [R002_REALTIME_SETUP.md](R002_REALTIME_SETUP.md) – Supabase Realtime
- [R015_TASK_NOTIFICATIONS.md](R015_TASK_NOTIFICATIONS.md) – Task notifications
- [DEMO_USERS.md](DEMO_USERS.md) – Demo accounts
