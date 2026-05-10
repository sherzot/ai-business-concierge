# デモユーザー

以下のアカウントを**Supabase Dashboard → Authentication → Users → Add user**から作成し、SQL Editorで`user_tenants`に追加してください。

---

## 1. リーダー（Leader）– フルアクセス

| フィールド | 値 |
|-----------|-----|
| **メール** | `rahbar@demo.acme.uz` |
| **パスワード** | `Rahbar123!` |
| **ロール** | leader |
| **名前** | Jasurbek Abdullayev |

---

## 2. HR

| フィールド | 値 |
|-----------|-----|
| **メール** | `hr@demo.acme.uz` |
| **パスワード** | `Hr123!` |
| **ロール** | hr |
| **名前** | Aziz Rakhimov |

---

## 3. 経理（Accounting）

| フィールド | 値 |
|-----------|-----|
| **メール** | `buxgalter@demo.acme.uz` |
| **パスワード** | `Bux123!` |
| **ロール** | accounting |
| **名前** | Nilufar Usmonova |

---

## 4. 部署長（Department Head）

| フィールド | 値 |
|-----------|-----|
| **メール** | `bochim@demo.acme.uz` |
| **パスワード** | `Bochim123!` |
| **ロール** | department_head |
| **名前** | Madina Karimova |

---

## 5. 一般社員（Employee）

| フィールド | 値 |
|-----------|-----|
| **メール** | `xodim@demo.acme.uz` |
| **パスワード** | `Xodim123!` |
| **ロール** | employee |
| **名前** | Anvar Toshmatov |

---

## クイックセットアップ

1. **Supabase Dashboard** → Authentication → Users → **Add user**
2. 各行: Email + Password（上記リストから）
3. ユーザー作成後、UUIDをコピー
4. **SQL Editor**で以下を実行:

```sql
-- リーダー（実際のUUIDに置き換えてください）
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<rahbar-uuid>', 't_001', 'leader', 'Jasurbek Abdullayev');

-- HR
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<hr-uuid>', 't_001', 'hr', 'Aziz Rakhimov');

-- 経理
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<buxgalter-uuid>', 't_001', 'accounting', 'Nilufar Usmonova');

-- 部署長
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<bochim-uuid>', 't_001', 'department_head', 'Madina Karimova');

-- 一般社員
insert into user_tenants (user_id, tenant_id, role, full_name) values
  ('<xodim-uuid>', 't_001', 'employee', 'Anvar Toshmatov');
```

---

## ロール別アクセス権限

| モジュール | リーダー | HR | 経理 | 部署長 | 社員 |
|-----------|---------|----|----|------|------|
| Reports | ✓ | ✓ | ✓ | ✓ | ✗ |
| Inbox | ✓ | ✓ | ✗ | ✓ | ✓ |
| Tasks | ✓ | ✓ | ✗ | ✓ | ✓ |
| HR | ✓ | ✓ | ✗ | ✗ | ✗ |
| Docs | ✓ | ✓ | ✓ | ✓ | ✗ |
| Integrations | ✓ | ✓ | ✓ | ✗ | ✗ |
| Settings | ✓ | ✓ | ✓ | ✓ | ✓ |
