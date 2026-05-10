# R-002: Supabase Realtime – セットアップ

InboxとTasksのページがリアルタイムで更新されるようになりました（新しいメッセージ/タスクが自動的に表示されます）。

---

## 1. SQLの実行

**Supabase Dashboard** → **SQL Editor** → 以下を実行してください:

```sql
-- RLSポリシー（認証済みユーザーが自分のテナントのデータを読み取れる）
create policy "inbox_items_select_own_tenant"
  on inbox_items for select to authenticated
  using (tenant_id in (select tenant_id from user_tenants where user_id = auth.uid()));

create policy "tasks_select_own_tenant"
  on tasks for select to authenticated
  using (tenant_id in (select tenant_id from user_tenants where user_id = auth.uid()));

-- Realtimeパブリケーション
alter publication supabase_realtime add table inbox_items;
alter publication supabase_realtime add table tasks;
```

**注意:** `already member of publication`エラーが発生した場合は、2番目と3番目のステートメントをスキップしてください。

---

## 2. Supabase Dashboard（代替方法）

**Database** → **Publications**（左メニュー、Replicationではない）→ `supabase_realtime` → **inbox_items**と**tasks**テーブルをトグルしてください。

**注意:** Replicationは外部ウェアハウス（BigQuery、Iceberg）用です。Realtimeは**Publications**セクションにあります。

---

## 3. テスト

1. Inboxページを開く
2. 別のブラウザ/シークレットモードまたは電話から`inbox@doroufdalu.resend.app`にメールを送信
3. 数秒後、Inboxページに新しいメッセージが自動的に表示されるはずです（ページを更新せずに）

または、Tasksページで新しいタスクを作成してください – 別のタブで開いているTasksページが更新されます。
