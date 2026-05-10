# Demo Users

Create the following accounts via **Supabase Dashboard → Authentication → Users → Add user**, then add them to `user_tenants` in the SQL Editor.

---

## 1. Leader – Full Access

| Field | Value |
|-------|-------|
| **Email** | `rahbar@demo.acme.uz` |
| **Password** | `Rahbar123!` |
| **Role** | leader |
| **Name** | Jasurbek Abdullayev |

---

## 2. HR

| Field | Value |
|-------|-------|
| **Email** | `hr@demo.acme.uz` |
| **Password** | `Hr123!` |
| **Role** | hr |
| **Name** | Aziz Rakhimov |

---

## 3. Accounting

| Field | Value |
|-------|-------|
| **Email** | `buxgalter@demo.acme.uz` |
| **Password** | `Bux123!` |
| **Role** | accounting |
| **Name** | Nilufar Usmonova |

---

## 4. Department Head

| Field | Value |
|-------|-------|
| **Email** | `bochim@demo.acme.uz` |
| **Password** | `Bochim123!` |
| **Role** | department_head |
| **Name** | Madina Karimova |

---

## 5. Employee

| Field | Value |
|-------|-------|
| **Email** | `xodim@demo.acme.uz` |
| **Password** | `Xodim123!` |
| **Role** | employee |
| **Name** | Anvar Toshmatov |

---

## Quick Setup

1. **Supabase Dashboard** → Authentication → Users → **Add user**.
2. For each row: Email + Password (from the list above).
3. After creating the user, copy the UUID.
4. Run the following in the **SQL Editor**:

```sql
-- Leader (replace with the actual UUID)
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<rahbar-uuid>', 't_001', 'leader', 'Jasurbek Abdullayev');

-- HR
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<hr-uuid>', 't_001', 'hr', 'Aziz Rakhimov');

-- Accounting
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<buxgalter-uuid>', 't_001', 'accounting', 'Nilufar Usmonova');

-- Department Head
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<bochim-uuid>', 't_001', 'department_head', 'Madina Karimova');

-- Employee
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<xodim-uuid>', 't_001', 'employee', 'Anvar Toshmatov');
```

---

## Access by Role

| Module | Leader | HR | Accounting | Dept Head | Employee |
|--------|--------|----|------------|-----------|---------|
| Reports | ✓ | ✓ | ✓ | ✓ | ✗ |
| Inbox | ✓ | ✓ | ✗ | ✓ | ✓ |
| Tasks | ✓ | ✓ | ✗ | ✓ | ✓ |
| HR | ✓ | ✓ | ✗ | ✗ | ✗ |
| Docs | ✓ | ✓ | ✓ | ✓ | ✗ |
| Integrations | ✓ | ✓ | ✓ | ✗ | ✗ |
| Settings | ✓ | ✓ | ✓ | ✓ | ✓ |
