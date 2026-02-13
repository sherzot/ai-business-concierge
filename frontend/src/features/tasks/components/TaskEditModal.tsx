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
import { updateTask } from "../api/tasksApi";

type TaskStatus = "todo" | "in_progress" | "review" | "done";
type TaskPriority = "high" | "medium" | "low";

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: { name: string };
  dueDate?: string;
  tags: string[];
};

type Member = { id: string; name: string };

type Props = {
  task: Task | null;
  tenantId: string;
  members: Member[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function TaskEditModal({ task, tenantId, members, open, onClose, onSaved }: Props) {
  const { translate } = useI18n();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeName, setAssigneeName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeName(task.assignee?.name ?? "");
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    }
  }, [task]);

  async function handleSave() {
    if (!task) return;
    setSaving(true);
    setError(null);
    try {
      await updateTask(tenantId, task.id, {
        title,
        status,
        priority,
        assignee: assigneeName ? { name: assigneeName } : null,
        dueDate: dueDate || null,
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setSaving(false);
    }
  }

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{translate("tasks.editTask")}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{translate("tasks.title")}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={translate("tasks.title")} />
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
            <Select value={assigneeName} onValueChange={setAssigneeName}>
              <SelectTrigger>
                <SelectValue placeholder={translate("tasks.assign")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">—</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.name}>
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

          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {translate("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "..." : translate("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
