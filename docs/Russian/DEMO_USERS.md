# Демо-пользователи

Создайте следующие аккаунты через **Supabase Dashboard → Authentication → Users → Add user**, затем добавьте их в `user_tenants` через SQL Editor.

---

## 1. Руководитель (Leader) – полный доступ

| Поле | Значение |
|------|----------|
| **Email** | `rahbar@demo.acme.uz` |
| **Пароль** | `Rahbar123!` |
| **Роль** | leader |
| **Имя** | Jasurbek Abdullayev |

---

## 2. HR

| Поле | Значение |
|------|----------|
| **Email** | `hr@demo.acme.uz` |
| **Пароль** | `Hr123!` |
| **Роль** | hr |
| **Имя** | Aziz Rakhimov |

---

## 3. Бухгалтерия (Accounting)

| Поле | Значение |
|------|----------|
| **Email** | `buxgalter@demo.acme.uz` |
| **Пароль** | `Bux123!` |
| **Роль** | accounting |
| **Имя** | Nilufar Usmonova |

---

## 4. Начальник отдела (Department Head)

| Поле | Значение |
|------|----------|
| **Email** | `bochim@demo.acme.uz` |
| **Пароль** | `Bochim123!` |
| **Роль** | department_head |
| **Имя** | Madina Karimova |

---

## 5. Рядовой сотрудник (Employee)

| Поле | Значение |
|------|----------|
| **Email** | `xodim@demo.acme.uz` |
| **Пароль** | `Xodim123!` |
| **Роль** | employee |
| **Имя** | Anvar Toshmatov |

---

## Быстрая настройка

1. **Supabase Dashboard** → Authentication → Users → **Add user**.
2. Для каждой строки: Email + Password (из списка выше).
3. После создания пользователя скопируйте UUID.
4. Выполните в **SQL Editor**:

```sql
-- Руководитель (замените на реальный UUID)
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<rahbar-uuid>', 't_001', 'leader', 'Jasurbek Abdullayev');

-- HR
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<hr-uuid>', 't_001', 'hr', 'Aziz Rakhimov');

-- Бухгалтерия
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<buxgalter-uuid>', 't_001', 'accounting', 'Nilufar Usmonova');

-- Начальник отдела
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<bochim-uuid>', 't_001', 'department_head', 'Madina Karimova');

-- Рядовой сотрудник
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<xodim-uuid>', 't_001', 'employee', 'Anvar Toshmatov');
```

---

## Права доступа по ролям

| Раздел | Руководитель | HR | Бухгалтерия | Нач. отдела | Сотрудник |
|--------|-------------|----|-----------|-----------|---------| 
| Reports | ✓ | ✓ | ✓ | ✓ | ✗ |
| Inbox | ✓ | ✓ | ✗ | ✓ | ✓ |
| Tasks | ✓ | ✓ | ✗ | ✓ | ✓ |
| HR | ✓ | ✓ | ✗ | ✗ | ✗ |
| Docs | ✓ | ✓ | ✓ | ✓ | ✗ |
| Integrations | ✓ | ✓ | ✓ | ✗ | ✗ |
| Settings | ✓ | ✓ | ✓ | ✓ | ✓ |
