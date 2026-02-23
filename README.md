# AI Business Concierge

AI Business Concierge – multi-tenant biznes operatsiyalari dashboardi. Inbox, vazifalar, HR, hujjatlar, hisobotlar va integratsiyalarni bitta interfeysda birlashtiradi. AI yordamchisi (Concierge) chat va tool orqali qo‘llab-quvvatlaydi.

---

## Loyiha tuzilishi (Folder & File Structure)

```
AI Business Concierge/
├── docs/                          # Hujjatlar
├── frontend/                      # React frontend
├── resources/                     # AI promptlar va resurslar
├── supabase/                      # Backend va DB
└── README.md
```

### `docs/` – Hujjatlar

| Fayl | Vazifa |
|------|--------|
| `REQUIREMENTS.md` | Talablar, kelajakdagi funksiyalar, prioritetlar |
| `ROADMAP.md` | Bosqichlar va reja |
| `DEMO_USERS.md` | Demo hisoblar va test ma'lumotlari |
| `R001_EMAIL_SETUP.md` | Resend email inbox sozlash |
| `R002_REALTIME_SETUP.md` | Supabase Realtime sozlash |
| `R015_TASK_NOTIFICATIONS.md` | Vazifa biriktirish bildirishnomalari |

---

### `frontend/` – React frontend (Vite + TypeScript)

```
frontend/
├── public/                 # Statik fayllar (favicon, index.html)
├── src/
│   ├── App.tsx             # Asosiy layout, navigatsiya, modullar
│   ├── main.tsx            # Kirish nuqtasi
│   ├── env.d.ts            # TypeScript env tipi
│   │
│   ├── app/                # Global sozlamalar va konfiguratsiya
│   │   ├── config.ts       # API URL, Supabase project ID
│   │   ├── i18n.ts         # Tarjimalar (uz, ru, en, ja)
│   │   ├── queryClient.ts  # React Query client
│   │   ├── router.tsx      # React Router sozlamalari
│   │   ├── store.ts        # Global state (Zustand)
│   │   └── providers/
│   │       ├── AppProviders.tsx      # Barcha providerlar
│   │       ├── I18nProvider.tsx      # Ko‘p tillilik
│   │       └── RealtimeAuthSync.tsx  # Auth va realtime sinxronizatsiya
│   │
│   ├── features/           # Feature-based modullar
│   │   ├── auth/           # Autentifikatsiya
│   │   ├── docs/           # Hujjatlar (Docs Hub)
│   │   ├── hr/             # HR Pulse
│   │   ├── inbox/          # Unified Inbox
│   │   ├── integrations/  # Integratsiyalar
│   │   ├── notifications/  # Bildirishnomalar
│   │   ├── reports/        # Manager Reports
│   │   ├── settings/       # Sozlamalar
│   │   ├── tasks/          # Vazifalar & Compliance
│   │   └── tenants/        # Tenant boshqaruvi
│   │
│   ├── shared/             # Umumiy komponentlar va utilitilar
│   │   ├── components/     # Qayta ishlatiladigan UI
│   │   ├── hooks/          # Umumiy hooklar
│   │   ├── lib/            # API client, Supabase, AI
│   │   ├── types/          # Umumiy tiplar
│   │   └── ui/             # Radix UI komponentlari
│   │
│   ├── styles/             # Global CSS
│   └── utils/              # Yordamchi funksiyalar
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── postcss.config.mjs
└── eslint.config.js
```

#### `frontend/src/features/` – Modullar tuzilishi

Har bir modul quyidagi strukturaga ega:

```
features/<module>/
├── api/           # API chaqiruvlari
├── components/    # Modul komponentlari
├── hooks/         # Modul hooklari
├── pages/         # Sahifalar
└── types.ts       # Modul tiplari
```

| Modul | Vazifa |
|-------|--------|
| **auth** | Login, rol, tenant konteksti, `AuthContext`, `ProtectedLayout` |
| **docs** | Hujjatlar ro‘yxati, qidiruv, batafsil ko‘rinish, index |
| **hr** | HR cases, survey form, case detail |
| **inbox** | Unified inbox, filtrlar, realtime yangilanishlar |
| **integrations** | Telegram, Email, AmoCRM integratsiyalari |
| **notifications** | Vazifa biriktirish bildirishnomalari, dropdown |
| **reports** | Dashboard KPIs, hisobot yuklash, AI Audit |
| **settings** | Profil, til almashtirish |
| **tasks** | Board/list view, CRUD, assignee, tasdiqlash |
| **tenants** | Tenant switcher, tenant sozlamalari |

#### `frontend/src/shared/` – Umumiy resurslar

| Papka/Fayl | Vazifa |
|------------|--------|
| **components/** | `AIChat`, `Topbar`, `Sidebar`, `Layout`, `ErrorState`, `EmptyState`, `ConfirmDialog`, `LoadingSpinner` |
| **hooks/** | `useToast`, `useAuth`, `useDebounce` |
| **lib/** | `apiClient`, `aiApi`, `supabase`, `formatters`, `errorHandling`, `i18nHelpers` |
| **types/** | `common.ts` – umumiy tiplar |
| **ui/** | Radix UI asosidagi komponentlar (button, dialog, select, input, table, tabs, va boshqalar) |

---

### `resources/` – AI promptlar

| Fayl | Vazifa |
|------|--------|
| `ai_coo.uz.v1.md` | AI COO roli |
| `doc_searcher.ru.v1.md` | Hujjat qidiruv prompti |
| `hr_summarizer.uz.v1.md` | HR xulosa prompti |
| `inbox_classifier.*.v1.md` | Inbox tasniflash (uz, ru) |
| `report_generator.uz.v1.md` | Hisobot generatsiya |
| `shadow_cfo.uz.v1.md` | Shadow CFO roli |
| `task_planner.ru.v1.md` | Vazifa rejalash prompti |

---

### `supabase/` – Backend va ma'lumotlar bazasi

```
supabase/
├── schema.sql              # Asosiy DB sxemasi (tenants, tasks, inbox, docs, notifications)
├── migrations/             # Migratsiya fayllari
│   ├── 20250213000000_task_notifications.sql
│   └── 20260205_r002_realtime.sql
└── functions/
    ├── bright-api/         # Supabase Edge Function gateway
    │   └── index.ts        # Gateway kirish nuqtasi
    └── server/             # Asosiy API (Hono)
        └── index.tsx       # Barcha endpointlar
```

#### `supabase/schema.sql` – Asosiy jadvallar

| Jadval | Vazifa |
|--------|--------|
| `tenants` | Tenantlar (id, name, plan) |
| `user_tenants` | Foydalanuvchi–tenant bog‘lanishi, rol, full_name |
| `tasks` | Vazifalar (title, status, priority, assignee, due_date) |
| `notifications` | Bildirishnomalar (task_assigned va boshqalar) |
| `inbox_items` | Inbox xabarlar |
| `docs` | Hujjatlar |
| `doc_chunks` | Hujjat bo‘laklari (search uchun) |
| `integrations` | Integratsiya sozlamalari |

---

## Funksionallik

- **Manager Reports** – KPI, health score, trend grafik, AI insights, hisobot yuklash (CSV), AI Audit
- **Unified Inbox** – Email/Telegram/CRM uslubidagi inbox, kategoriyalar
- **Tasks & Compliance** – Board va list view, CRUD, assignee, tasdiqlash, bildirishnomalar
- **HR Pulse** – Cases, survey yuborish
- **Docs Hub** – Hujjatlar ro‘yxati, qidiruv, index
- **Integrations** – Telegram, Email, AmoCRM sozlamalari
- **AI Concierge** – Chat, tool orqali vazifa yaratish, hujjat qidiruv, inbox tasniflash
- **Settings** – Profil, til (uz, ru, en, ja)

---

## Texnik stack

| Qatlam | Texnologiya |
|--------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Radix UI, Recharts, Framer Motion |
| Backend | Supabase Edge Function (Deno), Hono |
| DB | Supabase Postgres |
| Auth | Supabase Auth |
| Deploy | Netlify (frontend), Supabase (backend) |

---

## Lokal ishga tushirish

### Frontend

```bash
cd frontend
npm i
npm run dev
```

### Backend

1. Supabase SQL Editor orqali `supabase/schema.sql` va `migrations/` fayllarini bajarish
2. Edge Function deploy: `supabase functions deploy bright-api`

### Environment o‘zgaruvchilari

**Frontend** (`frontend/.env` yoki Netlify):

- `VITE_SUPABASE_PROJECT_ID` – Supabase loyiha ID
- `VITE_SUPABASE_ANON_KEY` – Supabase anon key
- `VITE_API_BASE_URL` – API base URL (ixtiyoriy)
- `VITE_SENTRY_DSN` – Sentry (ixtiyoriy)

**Backend** (Supabase Edge Function secrets):

- `SB_URL` / `SUPABASE_URL`
- `SB_SERVICE_ROLE_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `SB_ANON_KEY` / `SUPABASE_ANON_KEY` (ixtiyoriy)
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (ixtiyoriy, default: `gpt-4o-mini`)
- `RESEND_WEBHOOK_SECRET` (R-001 email uchun)

---

## Deploy

**Supabase (Edge Function):**

- `supabase/functions/server/index.tsx` dan deploy
- Base URL: `https://<project-id>.supabase.co/functions/v1/bright-api/...`

**Netlify (Frontend):**

- Base directory: `frontend`
- Build: `npm run build`
- Publish: `dist`

---

## API endpointlar

Barcha endpointlar `/v1/*` ostida, tenant konteksti talab qilinadi:

- `X-Tenant-Id` header
- yoki `Authorization: Bearer <jwt>` va `tenant_id` claim

| Method | Endpoint | Vazifa |
|--------|----------|--------|
| GET | `/health` | Health check |
| GET | `/auth/me` | Joriy foydalanuvchi |
| GET | `/dashboard` | Dashboard statistikalar |
| GET | `/inbox` | Inbox ro‘yxati |
| POST | `/inbox/ingest` | Inbox import |
| POST | `/inbox/webhook/resend` | Resend webhook |
| GET | `/tenants/:id/members` | Tenant a'zolari |
| GET | `/tasks` | Vazifalar ro‘yxati |
| POST | `/tasks` | Vazifa yaratish |
| PATCH | `/tasks/:id` | Vazifa yangilash |
| DELETE | `/tasks/:id` | Vazifa o‘chirish |
| POST | `/tasks/:id/acknowledge` | Vazifani tasdiqlash |
| GET | `/notifications` | Bildirishnomalar |
| PATCH | `/notifications/:id/read` | Bildirishnomani o‘qilgan qilish |
| POST | `/ai/chat` | AI chat |
| GET | `/ai/tools` | AI tool registry |
| GET | `/docs` | Hujjatlar ro‘yxati |
| GET | `/docs/:id` | Hujjat batafsil |
| POST | `/docs/index` | Hujjat indexlash |
| POST | `/docs/search` | Hujjat qidiruv |
| GET | `/hr/cases` | HR cases |
| POST | `/hr/surveys` | HR survey yuborish |
| GET | `/integrations` | Integratsiyalar |
| POST | `/integrations/:id` | Integratsiya yangilash |

Standart javob:

```json
{
  "data": { ... },
  "meta": { "success": true, "trace_id": "..." }
}
```

---

## Hujjatlar

- [DEPLOY_SETUP.md](docs/DEPLOY_SETUP.md) – Push va deploy qo'llanmasi (GitHub, Supabase, Netlify)
- [REQUIREMENTS.md](docs/REQUIREMENTS.md) – Talablar va kelajakdagi funksiyalar
- [ROADMAP.md](docs/ROADMAP.md) – Bosqichlar va reja
- [DEMO_USERS.md](docs/DEMO_USERS.md) – Demo hisoblar
- [R001_EMAIL_SETUP.md](docs/R001_EMAIL_SETUP.md) – Resend email inbox sozlash
- [R002_REALTIME_SETUP.md](docs/R002_REALTIME_SETUP.md) – Supabase Realtime sozlash
- [R015_TASK_NOTIFICATIONS.md](docs/R015_TASK_NOTIFICATIONS.md) – Vazifa bildirishnomalari
