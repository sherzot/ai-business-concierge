# R-015: Vazifa biriktirish bildirishnomalari

Rahbar vazifa yaratib/yangilab mas'ul biriktirganda, mas'ulga bildirishnoma boradi. Mas'ul "Tasdiqlash" tugmasi orqali vazifani qabul qilganini tasdiqlaydi. Barcha xodimlar barcha vazifalar va ularning statuslarini ko'radi – tizim ochiq va shaffof.

## O'zgarishlar

### 1. Ma'lumotlar bazasi
- `notifications` jadvali – bildirishnomalar
- `tasks.acknowledged_at` – mas'ul tasdiqlagan vaqti

**Migration:** `supabase/migrations/20250213000000_task_notifications.sql`

```bash
supabase db push
# yoki
supabase migration up
```

### 2. Backend (Edge Function)
- Vazifa yaratilganda/ yangilanganda `assignee.id` bo'lsa → bildirishnoma yaratiladi
- `GET /notifications` – joriy foydalanuvchining bildirishnomalari
- `PATCH /notifications/:id/read` – o'qilgan deb belgilash
- `POST /tasks/:id/acknowledge` – mas'ul tasdiqlashi

### 3. Frontend
- **TaskEditModal:** Mas'ul tanlanganda `{ id, name }` yuboriladi (faqat `name` emas)
- **NotificationsDropdown:** Header'dagi qo'ng'iroq tugmasi – bildirishnomalar ro'yxati
- **TaskCard:** Mas'ul uchun "Tasdiqlash" tugmasi (faqat o'ziga biriktirilgan va tasdiqlanmagan vazifalarda)

### 4. Status shaffofligi
- Barcha tenant a'zolari barcha vazifalarni ko'radi (GET /tasks tenant bo'yicha)
- Har bir vazifada: mas'ul, status, tasdiqlangan yoki yo'q

## Ishlatish

1. Rahbar vazifa yaratadi yoki mavjud vazifani tahrirlaydi
2. Mas'ulni tanlaydi (dropdown'dan)
3. Saqlagach – mas'ulga bildirishnoma keladi (header'dagi qo'ng'iroqda)
4. Mas'ul vazifa kartasida "Tasdiqlash" tugmasini bosadi
5. Barcha xodimlar vazifa statusini ko'radi
