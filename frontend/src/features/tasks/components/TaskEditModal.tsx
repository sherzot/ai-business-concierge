import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/ui/select";
import { useI18n } from "../../../app/providers/I18nProvider";
import { updateTask, createTask } from "../api/tasksApi";

type TaskStatus = "todo" | "in_progress" | "review" | "done";
type TaskPriority = "high" | "medium" | "low";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: { id?: string; name: string };
  dueDate?: string;
  tags: string[];
};

type Member = { id: string; name: string };

const UNSET_ASSIGNEE = "__none__";

type Props = {
  /** null = create mode, Task = edit mode */
  task: Task | null;
  /** create mode'ni majburlab yoqish (task=null bo'lganda kerak) */
  mode?: "create" | "edit";
  tenantId: string;
  members: Member[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function TaskEditModal({
  task,
  mode,
  tenantId,
  members,
  open,
  onClose,
  onSaved,
}: Props) {
  const { translate } = useI18n();
  const isCreate = mode === "create" || (mode === undefined && task === null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState(UNSET_ASSIGNEE);
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset / hydrate form when modal opens
  useEffect(() => {
    if (!open) return;
    if (task) {
      setTitle(task.title ?? "");
      setDescription(task.description ?? "");
      setStatus(task.status);
      setPriority(task.priority);
      const aid =
        task.assignee?.id ??
        (task.assignee?.name ? members.find((m) => m.name === task.assignee?.name)?.id : null) ??
        UNSET_ASSIGNEE;
      setAssigneeId(aid);
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    } else {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setAssigneeId(UNSET_ASSIGNEE);
      setDueDate("");
    }
    setError(null);
  }, [open, task, members]);

  async function handleSave() {
    if (!title.trim()) {
      setError(translate("tasks.errorTitleRequired"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const assignee =
        assigneeId && assigneeId !== UNSET_ASSIGNEE
          ? { id: assigneeId, name: members.find((m) => m.id === assigneeId)?.name ?? "" }
          : null;

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        assignee,
        dueDate: dueDate || null,
      };

      if (isCreate) {
        await createTask(tenantId, payload);
      } else if (task) {
        await updateTask(tenantId, task.id, payload);
      }

      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? translate("tasks.createTitle") : translate("tasks.editTask")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{translate("tasks.title")}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={translate("tasks.titlePlaceholder")}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label>
              {translate("tasks.description")}{" "}
              <span className="text-xs text-slate-400">{translate("tasks.descriptionOptional")}</span>
            </Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder={translate("tasks.descriptionPlaceholder")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{translate("tasks.status")}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">{translate("tasks.status.todo")}</SelectItem>
                  <SelectItem value="in_progress">{translate("tasks.status.in_progress")}</SelectItem>
                  <SelectItem value="review">{translate("tasks.status.review")}</SelectItem>
                  <SelectItem value="done">{translate("tasks.status.done")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{translate("tasks.priority")}</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{translate("tasks.priority.high")}</SelectItem>
                  <SelectItem value="medium">{translate("tasks.priority.medium")}</SelectItem>
                  <SelectItem value="low">{translate("tasks.priority.low")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>{translate("tasks.assignee")}</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger>
                <SelectValue placeholder={translate("tasks.assign")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSET_ASSIGNEE}>—</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>{translate("tasks.dueDate")}</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {translate("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>
            {saving
              ? "..."
              : isCreate
                ? translate("tasks.create")
                : translate("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
