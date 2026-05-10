# R-015: Task Assignment Notifications

When a leader creates/updates a task and assigns a responsible person, a notification is sent to the assignee. The assignee confirms receipt via the "Acknowledge" button. All employees can see all tasks and their statuses – the system is open and transparent.

## Changes

### 1. Database
- `notifications` table – notifications
- `tasks.acknowledged_at` – timestamp when assignee acknowledged

**Migration:** `supabase/migrations/20250213000000_task_notifications.sql`

```bash
supabase db push
# or
supabase migration up
```

### 2. Backend (Edge Function)
- When a task is created/updated with `assignee.id` → a notification is created
- `GET /notifications` – current user's notifications
- `PATCH /notifications/:id/read` – mark as read
- `POST /tasks/:id/acknowledge` – assignee acknowledgement

### 3. Frontend
- **TaskEditModal:** When an assignee is selected, `{ id, name }` is sent (not just `name`)
- **NotificationsDropdown:** Bell button in the header – list of notifications
- **TaskCard:** "Acknowledge" button for the assignee (only on tasks assigned to them and not yet acknowledged)

### 4. Status Transparency
- All tenant members can see all tasks (GET /tasks by tenant)
- Each task shows: assignee, status, acknowledged or not

## Usage

1. Leader creates a task or edits an existing one
2. Selects an assignee (from dropdown)
3. After saving – the assignee receives a notification (in the header bell)
4. The assignee clicks "Acknowledge" on the task card
5. All employees can see the task status
