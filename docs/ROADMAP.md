# AI Business Concierge – Roadmap

Requirements va roadmap bir-biriga bog‘liq. `docs/REQUIREMENTS.md` da talablar, shu yerda bosqichlar va rejalar.

---

## Bosqich 1: Tayanch (tugallangan) ✅

- Auth, rollar, tenant
- Barcha asosiy modullar (Reports, Inbox, Tasks, HR, Docs, Integrations)
- AI Concierge
- Settings

---

## Bosqich 2: Qisqa muddat (1–2 oy)

| Vaqt | Vazifa | Requirement ID |
|------|--------|----------------|
| Hafta 1–2 | Real inbox: Email API (Resend/SendGrid) yoki Telegram Bot | R-001 |
| Hafta 2–3 | Supabase Realtime – inbox, tasks yangilanish | R-002 |
| Hafta 3–4 | Audit log sahifasi (admin) | R-004 |

---

## Bosqich 3: O‘rta muddat (2–4 oy)

| Vaqt | Vazifa | Requirement ID |
|------|--------|----------------|
| Oy 1 | Billing / subscription (Stripe yoki Supabase Billing) | R-003 |
| Oy 2 | Export (Excel, CSV) – Reports, Tasks | R-005 |
| Oy 2–3 | Push bildirishnomalar | R-006 |
| Oy 3–4 | PWA / mobil optimizatsiya | R-007 |

---

## Bosqich 4: Uzoq muddat (4+ oy)

| Vaqt | Vazifa | Requirement ID |
|------|--------|----------------|
| Oy 4+ | SSO / OAuth | R-011 |
| Oy 4+ | 2FA | R-012 |
| Oy 5+ | Custom branding | R-009 |
| Oy 5+ | Advanced analytics | R-013 |

---

## Qanday qilish kerak

### 1. Yangi talab qo‘shishda
1. `docs/REQUIREMENTS.md` ga yangi qator qo‘shing (ID, tavsif, modul, prioritet)
2. `docs/ROADMAP.md` da tegishli bosqichga qo‘shing
3. Agar prioritet o‘zgarsa – roadmap ni yangilang

### 2. Sprint/rejalashda
1. Roadmap dan bir bosqichni tanlang
2. Requirements dan tegishli ID larni oling
3. Backend → Frontend tartibida ishlang

### 3. O‘zgartirishlar
- Requirements va Roadmap hujjatlar – faqat qo‘llab-quvvatlash
- Asosiy kod `frontend/` va `supabase/` da
- Yangi talab kelsa – avval Requirements ga yozing, keyin kodga o‘ting

---

## Changelog (qisqacha)

| Sana | O‘zgarish |
|------|-----------|
| 2026-02-05 | Initial roadmap, Bosqich 1 tugallangan |
