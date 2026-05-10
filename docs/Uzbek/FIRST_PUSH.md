# FIRST_PUSH.md — Phase 0 yakunlash deploy qo'llanmasi

> **Maqsad:** 2026-04-29 da yaratilgan Phase 0 fayllarini GitHub → Supabase → Netlify ga deploy qilish.
> **Vaqt:** ~30-45 daqiqa (CLI tayyor bo'lsa).
> **Auditoriya:** Sher (PM/PL) — copy-paste qilib bajaradigan bosqichma-bosqich qo'llanma.

---

## 0. Bugun nima push qilamiz? (Sanity check)

| # | Fayl | Tur | Qayerga ketadi |
|---|---|---|---|
| 1 | `supabase/migrations/20260429_phase0_rls_complete.sql` | DB migration | Supabase DB |
| 2 | `supabase/functions/server/services/usage-tracking.ts` | Edge Function | Supabase Functions |
| 3 | `supabase/functions/server/services/hr-candidate/*` (8 ta fayl) | Edge Function | Supabase Functions |
| 4 | `supabase/functions/server/routes/hr-candidate.ts` | Edge Function | Supabase Functions |
| 5 | `supabase/functions/server/index.ts` (yangilangan) | Edge Function | Supabase Functions |
| 6 | `supabase/.env.example` | hujjat | GitHub only |
| 7 | `frontend/.env.example` (yangilangan) | hujjat | GitHub only |
| 8 | `frontend/src/styles/theme-indigo-slate.css` | CSS | Netlify build |
| 9 | `frontend/src/shared/lib/aiFeedbackApi.ts` | TypeScript | Netlify build |
| 10 | `frontend/src/shared/components/AIFeedbackButtons.tsx` | React | Netlify build |
| 11 | `frontend/src/features/hr/candidates/*` (12 ta fayl) | React | Netlify build |
| 12 | `docs/CONNECTIONS.md`, `docs/HR_CANDIDATE_ANALYSIS.md`, `docs/FIRST_PUSH.md` | hujjat | GitHub only |

**Xavfsizlik tekshiruvi:** hech qaysi faylga real API key kiritilgan emas — barchasi `*.env.example` placeholder'lar.

---

## 1. Pre-flight (oldin tekshirish)

### 1.1 Lokal terminalda — loyiha papkasiga o'tib oling

```bash
cd ~/Documents/GitHub/Projects/ai-business-concierge
```

### 1.2 Quyidagilarni ishga tushirib, holatni tekshiring:

```bash
# Git holati — qaysi fayllar yangi/o'zgargan
git status

# Branch va remote
git branch
git remote -v

# Supabase CLI versiyasi (v2.75 ham yetarli, v2.95+ tavsiya etiladi)
supabase --version

# Node + npm
node --version    # v20+ bo'lishi kerak
npm --version
```

**Kutilgan natija:**
- `git status` → "modified: supabase/functions/server/index.ts" + 30+ "Untracked files"
- `git remote -v` → `github.com/sherzot/ai-business-concierge.git` ko'rinadi
- `supabase --version` → `2.75.0` (yoki yuqori)

### 1.3 (Ixtiyoriy) Supabase CLI yangilash

```bash
# macOS
brew upgrade supabase
# yoki
brew install supabase/tap/supabase
```

> Eslatma: v2.75.0 ham hammasini bajaradi. Yangilash shart emas, lekin tavsiya etiladi.

### 1.4 Lokal frontend build (test)

Push qilishdan oldin frontend ishlashini tekshiring:

```bash
cd frontend
npm install        # agar yangi paket qo'shilgan bo'lsa
npm run build
cd ..
```

**Kutilgan natija:** xato yo'q. Agar TypeScript xato chiqsa — tuzating, push qilmang.

---

## 2. GitHub'ga push

### 2.1 Yangi/o'zgargan fayllarni stage qilish

```bash
# Hammasini ko'rish (auditi)
git status

# Hammasini stage qilish
git add .

# Yana bir bor ko'ring — qaysi fayllar commit ga ketadi
git status
```

**Diqqat qiling:**
- `frontend/.env` (real keys bilan) commit ga ketmasligi kerak — `.gitignore` da bo'lishi shart
- `node_modules/` ham bo'lmasligi kerak

Agar `.env` ko'rinsa:

```bash
git rm --cached frontend/.env
echo "frontend/.env" >> .gitignore
git add .gitignore
```

### 2.2 Commit

CLAUDE.md `commit qoidalari` bo'yicha tip(scope): description format ishlatamiz:

```bash
git commit -m "feat(phase0): yakunlash — RLS to'liq, Indigo tema, AI feedback, HR candidates skeleton

- db: 20260429_phase0_rls_complete.sql (12 jadval × 4 RLS policy + 5 index)
- backend: services/usage-tracking.ts, services/hr-candidate/* skeleton
- backend: POST /v1/ai/feedback va /v1/hr/candidates/analyze (501 stub)
- frontend: theme-indigo-slate.css, AIFeedbackButtons, hr/candidates UI skeleton
- docs: HR_CANDIDATE_ANALYSIS.md (UZ+JP+EN), CONNECTIONS.md, FIRST_PUSH.md
- infra: .env.example to'liq (frontend + supabase)"
```

### 2.3 Push

```bash
# Branch nomini aniqlash
git branch --show-current

# Push (asosan main yoki master)
git push origin main
```

**Agar avtorizatsiya so'rasa:**
- HTTPS bo'lsa: GitHub username + Personal Access Token (parol emas!)
- SSH bo'lsa: SSH key passphrase

**Push muvaffaqiyatli bo'lsa**, GitHub'da `https://github.com/sherzot/ai-business-concierge` ga kiring va yangi commit'ni ko'rasiz.

---

## 3. Supabase'ga deploy

### 3.1 Login (agar avval qilmagan bo'lsangiz)

```bash
supabase login
```

Browser ochiladi → Supabase'ga login → terminal'ga qaytib token saqlaydi.

### 3.2 Loyihaga ulanish

```bash
# DEPLOY_SETUP.md dagi project ref ni ishlatamiz
supabase link --project-ref ufhepwdkjqptjvxrmpjn
```

`Database password` so'rasa — Dashboard → Project Settings → Database → "Reset database password" dan oling (yoki avval yaratilgan parolni kiriting).

### 3.3 Migrationlarni push qilish

```bash
# Mavjud migrationlarni Supabase bilan sinxronlash
supabase db push
```

**Bu qiladi:** `supabase/migrations/` ichidagi barcha SQL fayllarni sirtimoiy bajaradi. Bizning yangi `20260429_phase0_rls_complete.sql` shu yerda push bo'ladi.

**Agar konflikt chiqsa** ("migration already applied" xato):

```bash
# Mahalliy migration ro'yxatini Supabase bilan sinxronlash
supabase migration list
# Agar lokal versiya remote'dan oldinda bo'lsa — push muvaffaqiyatli bo'ladi
```

### 3.4 Migration ishlaganligini tekshirish

```bash
# Health view'ni o'qish
supabase db remote sql --query "select * from phase0_rls_health;"
```

**Kutilgan natija:** 12 qatorli jadval, har qatorda:
- `select_policies` ≥ 1
- `insert_policies` ≥ 1
- `update_policies` ≥ 1
- `delete_policies` ≥ 1
- `rls_enabled` = `true`

Agar biror qatorda 0 ko'rinsa — RLS to'liq qoplanmagan, qayta tekshiring.

### 3.5 Edge Function deploy

```bash
# server function (asosiy Hono API)
supabase functions deploy server --project-ref ufhepwdkjqptjvxrmpjn
```

```bash
# Aniq nom uchun
supabase functions list --project-ref ufhepwdkjqptjvxrmpjn
# → ro'yxatdan to'g'ri nomni nusxalang va deploy qiling
```

### 3.6 Secrets sozlash (eng muhim qadam!)

`supabase/.env.example` dagi har qiymat uchun real qiymat oling, keyin:

```bash
# Anthropic Claude (Phase 0 da SHART)
supabase secrets set ANTHROPIC_API_KEY="sk-ant-api03-XXXXXX" --project-ref ufhepwdkjqptjvxrmpjn

# OpenAI embedding (KB uchun SHART)
supabase secrets set OPENAI_API_KEY="sk-proj-XXXXXX" --project-ref ufhepwdkjqptjvxrmpjn

# JWT (agar avval sozlanmagan bo'lsa)
supabase secrets set JWT_SECRET="your-jwt-secret-from-dashboard" --project-ref ufhepwdkjqptjvxrmpjn
```

**Telegram, Click, Payme, Resend** — kerak bo'lganda (Phase 1+) sozlaysiz, hozir o'tkazib yuborish mumkin.

### 3.7 Secrets'ni tekshirish

```bash
supabase secrets list --project-ref ufhepwdkjqptjvxrmpjn
```

Hech qachon real qiymatlar ko'rsatilmaydi (xavfsizlik), faqat ro'yxat. `ANTHROPIC_API_KEY` va `OPENAI_API_KEY` ro'yxatda bo'lishi kerak.

### 3.8 Edge Function smoke test

```bash
# Health endpoint
curl "https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/server/health"
```

**Kutilgan:** `{"data":{"ok":true}}` yoki `{"status":"ok"}`.

---

## 4. Netlify'da yangilash

### 4.1 Avtomatik deploy

GitHub'ga push qilganingizdan keyin **Netlify avtomatik build qiladi** (agar `main` branch'ga ulangan bo'lsa).

Tekshirish:
1. https://app.netlify.com → loyihangizni oching
2. **Deploys** sahifasi
3. Eng yuqorida "Deploy in progress" yoki "Published" ko'rinadi

### 4.2 Environment variables yangilash

| Key | Value | Tavsiya |
|---|---|---|
| `VITE_SUPABASE_PROJECT_ID` | `ufhepwdkjqptjvxrmpjn` | ✅ allaqachon bor |
| `VITE_SUPABASE_ANON_KEY` | Dashboard → Settings → API → anon | ✅ allaqachon bor |
| `VITE_FEATURE_HR_CANDIDATES` | `true` | yangi (skeleton ko'rsatish uchun) |
| `VITE_SENTRY_DSN` | (Phase 1 da) | bo'sh qoldiring |
| `VITE_TELEGRAM_BOT_USERNAME` | (Phase 1 da) | bo'sh qoldiring |

### 4.3 Qo'lda re-deploy (agar env yangilangan bo'lsa)

```bash
git commit --allow-empty -m "chore: trigger netlify rebuild"
git push
```

### 4.4 Deploy log'ni kuzating

**Deploys** → eng so'nggi build → **Deploy log** ni oching:
- "Build script completed" → ✅
- "Site is live" → ✅

---

## 5. Yakuniy smoke test (5 daqiqa)

### 5.1 Backend health

```bash
curl https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/server/health
# kutilgan: {"status":"ok"}
```

### 5.2 RLS health

```bash
supabase db remote sql --query "select count(*) from phase0_rls_health where insert_policies > 0;"
# kutilgan: 12
```

### 5.3 AI chat (Claude bilan)

```bash
curl -X POST https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/server/v1/ai/chat \
  -H "Authorization: Bearer <USER_JWT>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Salom! Sen kimsan?","locale":"uz"}'
```

**Kutilgan:** `llm_provider: "claude"`, `llm_model: "claude-3-5-haiku-..."`, javob matni.

### 5.4 AI feedback

```bash
curl -X POST https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/server/v1/ai/feedback \
  -H "Authorization: Bearer <USER_JWT>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H "Content-Type: application/json" \
  -d '{"message_id":"<from-previous-call>","rating":1}'
```

**Kutilgan:** `{"data":{"saved":true}}`.

### 5.5 HR candidate stub

```bash
curl -X POST https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/server/v1/hr/candidates/analyze
```

**Kutilgan:** `501 NOT_IMPLEMENTED` xatosi — bu **to'g'ri** natija (skeleton ulangan, implementatsiya kelajakda).

---

## 6. Troubleshooting

### 6.1 `git push` rejected — "non-fast-forward"

```bash
git pull --rebase origin main
git push origin main
```

### 6.2 `supabase db push` — "migration already applied"

```bash
supabase migration repair --status applied <migration_version>
```

### 6.3 Edge Function 500 xatosi

```bash
supabase functions logs server --project-ref ufhepwdkjqptjvxrmpjn --tail
```

Eng tipik sabab — `ANTHROPIC_API_KEY` yoki `JWT_SECRET` sozlanmagan.

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

### 6.5 RLS health'da 0 policy ko'rinadi

```bash
supabase db push
```

---

## 7. Checklist — bugun tugatish kerak

- [ ] **GitHub:** `git status` toza, `git push origin main` muvaffaqiyatli
- [ ] **Supabase DB:** `phase0_rls_health` view 12 jadval ko'rsatadi (har biri 4 policy)
- [ ] **Supabase Functions:** `server` deploy qilindi, `/health` ishlaydi
- [ ] **Supabase Secrets:** `ANTHROPIC_API_KEY` va `OPENAI_API_KEY` qo'yildi
- [ ] **AI chat smoke test:** Claude javob beradi
- [ ] **AI feedback smoke test:** `{"saved":true}` qaytadi
- [ ] **Netlify:** Deploy "Published", URL ochiladi
- [ ] **Frontend tema:** Indigo accent ko'rinadi

Hammasi yashil bo'lsa — **Phase 0 LIVE!** 🎉

---

## 8. Keyingi qadam — Phase 1

`docs/PLAN.md §1` (Telegram MVP) — yangi sessiyada boshlaymiz:
- grammY framework + bot webhook
- `/start` til tanlash
- AI Maslahatchi Telegram'dan
- 50 beta user

---

*FIRST_PUSH.md — bugungi changelar uchun deploy sayohati*
*DEPLOY_SETUP.md (asosiy hujjat) ham foydali bo'lishi mumkin*
