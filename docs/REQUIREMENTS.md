# AI Business Concierge – Requirements

Bu hujjat loyiha talablarini va kelajakdagi yo‘nalishlarni belgilaydi. Yangi funksiyalar qo‘shishda shu hujjatga murojaat qiling.

---

## 1. Hozirgi holat (MVP)

### 1.1 Auth va rollar
- [x] Supabase Auth (email/password)
- [x] Multi-tenant: `tenants`, `user_tenants`
- [x] Rollar: leader, hr, accounting, department_head, employee
- [x] Rol bo‘yicha kirish: `canAccess(module)`
- [x] Tenant switcher

### 1.2 Modullar
- [x] Reports – KPI, health score, daily report
- [x] Inbox – unified inbox (email/telegram)
- [x] Tasks – board/list, CRUD
- [x] HR – cases, surveys
- [x] Docs – list, search, index
- [x] Integrations – Telegram, Email, AmoCRM
- [x] AI Concierge – chat, tools
- [x] Settings – profil, til

### 1.3 Texnik stack
- Frontend: React + Vite + TypeScript
- Backend: Supabase Edge Function (Hono)
- DB: Supabase Postgres
- Deploy: Netlify + Supabase

---

## 2. Kelajakdagi talablar (prioritet bo‘yicha)

### 2.1 Yuqori prioritet
| ID | Talab | Tavsif | Modul |
|----|-------|--------|-------|
| R-001 | Real inbox integratsiyasi | Email (Resend) webhook – qisman ✅ | Inbox |
| R-002 | Real-time yangilanishlar | WebSocket yoki Supabase Realtime | Hammasi |
| R-003 | Billing/To‘lovlar | Subscription, planlar, to‘lov tarixi | Yangi |
| R-004 | Audit log ko‘rinishi | Admin uchun audit loglar sahifasi | Settings |
| R-005 | Export/Import | Excel, CSV export; bulk import | Reports, Tasks |

### 2.2 O‘rta prioritet
| ID | Talab | Tavsif | Modul |
|----|-------|--------|-------|
| R-006 | Push/bildirishnomalar | Browser push, email bildirishnomalar | Hammasi |
| R-007 | Mobil qurilmalar | PWA yoki React Native | Hammasi |
| R-008 | Ko‘p tillilik kengaytirish | Qo‘shimcha tillar (ru, en) | Settings |
| R-009 | Custom branding | Logo, ranglar tenant bo‘yicha | Settings |
| R-010 | API rate limiting | Foydalanuvchi/tenant bo‘yicha limit | Backend |

### 2.3 Past prioritet
| ID | Talab | Tavsif | Modul |
|----|-------|--------|-------|
| R-011 | SSO / OAuth | Google, Microsoft login | Auth |
| R-012 | 2FA | Ikki bosqichli autentifikatsiya | Auth |
| R-013 | Advanced analytics | Custom reportlar, grafiklar | Reports |
| R-014 | Webhook chiqish | Tashqi tizimlarga event yuborish | Integrations |

---

## 3. Talab qo‘shish qoidalari

Yangi talab qo‘shishda:
1. **ID** – `R-XXX` formatida (keyingi raqam)
2. **Tavsif** – qisqa, aniq
3. **Modul** – qaysi modulga qo‘shiladi
4. **Prioritet** – yuqori / o‘rta / past
5. **Qaramliklar** – boshqa talablarga bog‘liq

---

## 4. Arxitektura tamoyillari

- **Feature-based** – har bir modul o‘z `features/` papkasida
- **API-first** – backend endpointlar avval, keyin frontend
- **Rol-based** – har bir modul `canAccess` tekshiradi
- **Tenant isolation** – barcha ma’lumotlar `tenant_id` orqali ajratiladi
