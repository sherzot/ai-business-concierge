# FIRST_PUSH.md — Phase 0 Completion Deploy Guide

> **Goal:** Deploy the Phase 0 files created on 2026-04-29 to GitHub → Supabase → Netlify.
> **Time:** ~30-45 minutes (if CLI is ready).
> **Audience:** Sher (PM/PL) — step-by-step guide to follow with copy-paste commands.

---

## 0. What Are We Pushing Today? (Sanity Check)

| # | File | Type | Destination |
|---|---|---|---|
| 1 | `supabase/migrations/20260429_phase0_rls_complete.sql` | DB migration | Supabase DB |
| 2 | `supabase/functions/server/services/usage-tracking.ts` | Edge Function | Supabase Functions |
| 3 | `supabase/functions/server/services/hr-candidate/*` (8 files) | Edge Function | Supabase Functions |
| 4 | `supabase/functions/server/routes/hr-candidate.ts` | Edge Function | Supabase Functions |
| 5 | `supabase/functions/server/index.ts` (updated) | Edge Function | Supabase Functions |
| 6 | `supabase/.env.example` | documentation | GitHub only |
| 7 | `frontend/.env.example` (updated) | documentation | GitHub only |
| 8 | `frontend/src/styles/theme-indigo-slate.css` | CSS | Netlify build |
| 9 | `frontend/src/shared/lib/aiFeedbackApi.ts` | TypeScript | Netlify build |
| 10 | `frontend/src/shared/components/AIFeedbackButtons.tsx` | React | Netlify build |
| 11 | `frontend/src/features/hr/candidates/*` (12 files) | React | Netlify build |
| 12 | `docs/CONNECTIONS.md`, `docs/HR_CANDIDATE_ANALYSIS.md`, `docs/FIRST_PUSH.md` | documentation | GitHub only |

**Security check:** No real API keys in any file — all are `*.env.example` placeholders.

---

## 1. Pre-flight Checks

### 1.1 In your local terminal — navigate to project folder

```bash
cd ~/Documents/GitHub/Projects/ai-business-concierge
```

### 1.2 Run the following to check status:

```bash
# Git status — which files are new/changed
git status

# Branch and remote
git branch
git remote -v

# Supabase CLI version (v2.75 is fine, v2.95+ recommended)
supabase --version

# Node + npm
node --version    # should be v20+
npm --version
```

**Expected results:**
- `git status` → "modified: supabase/functions/server/index.ts" + 30+ "Untracked files"
- `git remote -v` → shows `github.com/sherzot/ai-business-concierge.git`
- `supabase --version` → `2.75.0` (or higher)

### 1.3 (Optional) Update Supabase CLI

```bash
# macOS
brew upgrade supabase
# or
brew install supabase/tap/supabase
```

> Note: v2.75.0 handles everything. Update not required but recommended.

### 1.4 Local frontend build (test)

Before pushing, verify the frontend works:

```bash
cd frontend
npm install        # if new packages were added
npm run build
cd ..
```

**Expected result:** No errors. If TypeScript errors appear — fix them, do not push.

---

## 2. Push to GitHub

### 2.1 Stage new/changed files

```bash
# Review everything (audit)
git status

# Stage everything
git add .

# Review again — which files will go into the commit
git status
```

**Watch out for:**
- `frontend/.env` (with real keys) should NOT be committed — must be in `.gitignore`
- `node_modules/` should not be included either

If `.env` appears:

```bash
git rm --cached frontend/.env
echo "frontend/.env" >> .gitignore
git add .gitignore
```

### 2.2 Commit

Using the `type(scope): description` format from CLAUDE.md commit rules:

```bash
git commit -m "feat(phase0): completion — full RLS, Indigo theme, AI feedback, HR candidates skeleton

- db: 20260429_phase0_rls_complete.sql (12 tables × 4 RLS policies + 5 indexes)
- backend: services/usage-tracking.ts, services/hr-candidate/* skeleton
- backend: POST /v1/ai/feedback and /v1/hr/candidates/analyze (501 stub)
- frontend: theme-indigo-slate.css, AIFeedbackButtons, hr/candidates UI skeleton
- docs: HR_CANDIDATE_ANALYSIS.md (UZ+JP+EN), CONNECTIONS.md, FIRST_PUSH.md
- infra: .env.example complete (frontend + supabase)"
```

### 2.3 Push

```bash
# Check branch name
git branch --show-current

# Push (usually main or master)
git push origin main
```

**If authorization is requested:**
- HTTPS: GitHub username + Personal Access Token (NOT your password!)
- SSH: SSH key passphrase

**If push succeeds**, visit `https://github.com/sherzot/ai-business-concierge` and see the new commit.

---

## 3. Deploy to Supabase

### 3.1 Login (if you haven't already)

```bash
supabase login
```

Browser opens → log into Supabase → returns to terminal and saves token.

### 3.2 Link to project

```bash
supabase link --project-ref ufhepwdkjqptjvxrmpjn
```

If `Database password` is requested — get it from Dashboard → Project Settings → Database → "Reset database password".

### 3.3 Push migrations

```bash
supabase db push
```

**This does:** Runs all SQL files in `supabase/migrations/` sequentially. Our new `20260429_phase0_rls_complete.sql` gets pushed here.

**If conflict appears** ("migration already applied" error):

```bash
supabase migration list
# If local version is ahead of remote — push will succeed
```

### 3.4 Verify migration ran

```bash
supabase db remote sql --query "select * from phase0_rls_health;"
```

**Expected result:** 12-row table, each row with:
- `select_policies` ≥ 1
- `insert_policies` ≥ 1
- `update_policies` ≥ 1
- `delete_policies` ≥ 1
- `rls_enabled` = `true`

If any row shows 0 — RLS not fully covered, investigate.

### 3.5 Deploy Edge Function

```bash
supabase functions deploy server --project-ref ufhepwdkjqptjvxrmpjn
```

```bash
# To confirm the exact function name:
supabase functions list --project-ref ufhepwdkjqptjvxrmpjn
```

### 3.6 Set Secrets (most important step!)

Get the real values for each entry in `supabase/.env.example`, then:

```bash
# Anthropic Claude (REQUIRED for Phase 0)
supabase secrets set ANTHROPIC_API_KEY="sk-ant-api03-XXXXXX" --project-ref ufhepwdkjqptjvxrmpjn

# OpenAI embedding (REQUIRED for KB)
supabase secrets set OPENAI_API_KEY="sk-proj-XXXXXX" --project-ref ufhepwdkjqptjvxrmpjn

# JWT (if not already set)
supabase secrets set JWT_SECRET="your-jwt-secret-from-dashboard" --project-ref ufhepwdkjqptjvxrmpjn
```

**Telegram, Click, Payme, Resend** — set when needed (Phase 1+), can skip for now.

### 3.7 Verify secrets

```bash
supabase secrets list --project-ref ufhepwdkjqptjvxrmpjn
```

Real values are never shown (security), only the list. `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` should appear.

### 3.8 Edge Function smoke test

```bash
curl "https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/health"
```

**Expected:** `{"data":{"ok":true}}` or `{"status":"ok"}`.

---

## 4. Netlify Update

### 4.1 Automatic deploy

After pushing to GitHub, **Netlify builds automatically** (if connected to `main` branch).

Check:
1. https://app.netlify.com → open your project
2. **Deploys** page
3. Top shows "Deploy in progress" or "Published"

### 4.2 Update environment variables (if new ones were added)

| Key | Value | Status |
|---|---|---|
| `VITE_SUPABASE_PROJECT_ID` | `ufhepwdkjqptjvxrmpjn` | ✅ already set |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Dashboard → Settings → API Keys → Publishable key | ✅ modern public key |
| `VITE_FEATURE_HR_CANDIDATES` | `true` | new (to show skeleton) |
| `VITE_SENTRY_DSN` | (Phase 1) | leave empty |
| `VITE_TELEGRAM_BOT_USERNAME` | (Phase 1) | leave empty |

### 4.3 Manual re-deploy (if env vars updated)

```bash
git commit --allow-empty -m "chore: trigger netlify rebuild"
git push
```

### 4.4 Monitor deploy log

**Deploys** → latest build → open **Deploy log**:
- "Build script completed" → ✅
- "Site is live" → ✅

Typical errors:
- `Module not found` → run `npm install` locally, push package-lock.json
- `TypeScript error` → fix locally with `npm run build`

---

## 5. Final Smoke Test (5 minutes)

### 5.1 Backend health

```bash
curl https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/health
# expected: {"status":"ok"}
```

### 5.2 RLS health

```bash
supabase db remote sql --query "select count(*) from phase0_rls_health where insert_policies > 0;"
# expected: 12
```

### 5.3 AI chat (with Claude)

Get JWT from Supabase Auth, then:

```bash
curl -X POST https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/ai/chat \
  -H "Authorization: Bearer <USER_JWT>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello! Who are you?","locale":"en"}'
```

**Expected:** `llm_provider: "claude"`, `llm_model: "claude-3-5-haiku-..."`, response text.

### 5.4 AI feedback

```bash
curl -X POST https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/ai/feedback \
  -H "Authorization: Bearer <USER_JWT>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H "Content-Type: application/json" \
  -d '{"message_id":"<from-previous-call>","rating":1}'
```

**Expected:** `{"data":{"saved":true}}`.

### 5.5 HR candidate stub

```bash
curl -X POST https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/hr/candidates/analyze
```

**Expected:** `501 NOT_IMPLEMENTED` error — this is the **correct** result (skeleton connected, implementation coming later).

### 5.6 Frontend live

Open Netlify URL → login → dashboard. Theme should be indigo.

---

## 6. Troubleshooting

### 6.1 `git push` rejected — "non-fast-forward"

Remote has new commits (pushed from elsewhere).

```bash
git pull --rebase origin main
git push origin main
```

### 6.2 `supabase db push` — "migration already applied"

```bash
supabase migration repair --status applied <migration_version>
```

### 6.3 Edge Function 500 error

```bash
supabase functions logs server --project-ref ufhepwdkjqptjvxrmpjn --tail
```

Most common cause — `ANTHROPIC_API_KEY` or `JWT_SECRET` not set. Go back to §3.6.

### 6.4 Netlify build "Module not found"

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
git add package-lock.json
git commit -m "chore: refresh package-lock.json"
git push
```

### 6.5 RLS health shows 0 policies

Migration didn't run. Re-run:

```bash
supabase db push
```

---

## 7. Checklist — Complete Today

- [ ] **GitHub:** `git status` clean, `git push origin main` successful
- [ ] **Supabase DB:** `phase0_rls_health` view shows 12 tables (each with 4 policies)
- [ ] **Supabase Functions:** `server` deployed, `/health` responds
- [ ] **Supabase Secrets:** `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` set
- [ ] **AI chat smoke test:** Claude responds
- [ ] **AI feedback smoke test:** `{"saved":true}` returned
- [ ] **Netlify:** Deploy "Published", URL opens
- [ ] **Frontend theme:** Indigo accent visible

All green — **Phase 0 is LIVE!** 🎉

---

## 8. Next Step — Phase 1

`docs/PLAN.md §1` (Telegram MVP) — start in a new session:
- grammY framework + bot webhook
- `/start` language selection
- AI Advisor via Telegram
- 50 beta users

Celebrate Phase 0 success ☕️

---

*FIRST_PUSH.md — deploy journey for today's changes*
*DEPLOY_SETUP.md (main document) also useful for R001/R002 nuances*
