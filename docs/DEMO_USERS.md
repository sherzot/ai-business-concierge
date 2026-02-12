# Demo foydalanuvchilar

Quyidagi hisoblarni **Supabase Dashboard → Authentication → Users → Add user** orqali yarating, keyin SQL Editor’da `user_tenants` ga qo‘shing.

---

## 1. Rahbar (Leader) – to‘liq kirish

| Maydon | Qiymat |
|--------|--------|
| **Email** | `rahbar@demo.acme.uz` |
| **Parol** | `Rahbar123!` |
| **Rol** | leader |
| **Ism** | Jasurbek Abdullayev |

---

## 2. HR

| Maydon | Qiymat |
|--------|--------|
| **Email** | `hr@demo.acme.uz` |
| **Parol** | `Hr123!` |
| **Rol** | hr |
| **Ism** | Aziz Rakhimov |

---

## 3. Bug‘altiriya (Accounting)

| Maydon | Qiymat |
|--------|--------|
| **Email** | `buxgalter@demo.acme.uz` |
| **Parol** | `Bux123!` |
| **Rol** | accounting |
| **Ism** | Nilufar Usmonova |

---

## 4. Bo‘lim boshliqi (Department Head)

| Maydon | Qiymat |
|--------|--------|
| **Email** | `bochim@demo.acme.uz` |
| **Parol** | `Bochim123!` |
| **Rol** | department_head |
| **Ism** | Madina Karimova |

---

## 5. Oddiy xodim (Employee)

| Maydon | Qiymat |
|--------|--------|
| **Email** | `xodim@demo.acme.uz` |
| **Parol** | `Xodim123!` |
| **Rol** | employee |
| **Ism** | Anvar Toshmatov |

---

## Qisqacha qo‘llash

1. **Supabase Dashboard** → Authentication → Users → **Add user**.
2. Har bir qatorda: Email + Password (yuqoridagi ro‘yxatdan).
3. User yaratilgandan keyin UUID ni nusxalang.
4. **SQL Editor**’da quyidagicha insert qiling:

```sql
-- Rahbar (UUID ni olingizdan keyin almashtiring)
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<rahbar-uuid>', 't_001', 'leader', 'Jasurbek Abdullayev');

-- HR
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<hr-uuid>', 't_001', 'hr', 'Aziz Rakhimov');

-- Bug'altiriya
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<buxgalter-uuid>', 't_001', 'accounting', 'Nilufar Usmonova');

-- Bo'lim boshliqi
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<bochim-uuid>', 't_001', 'department_head', 'Madina Karimova');

-- Oddiy xodim
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<xodim-uuid>', 't_001', 'employee', 'Anvar Toshmatov');
```

---

## Rol bo‘yicha kirish huquqlari

| Bo‘lim | Rahbar | HR | Bug'altiriya | Bo‘lim boshliqi | Xodim |
|--------|--------|-----|--------------|-----------------|-------|
| Reports | ✓ | ✓ | ✓ | ✓ | ✗ |
| Inbox | ✓ | ✓ | ✗ | ✓ | ✓ |
| Tasks | ✓ | ✓ | ✗ | ✓ | ✓ |
| HR | ✓ | ✓ | ✗ | ✗ | ✗ |
| Docs | ✓ | ✓ | ✓ | ✓ | ✗ |
| Integrations | ✓ | ✓ | ✓ | ✗ | ✗ |
| Settings | ✓ | ✓ | ✓ | ✓ | ✓ |
