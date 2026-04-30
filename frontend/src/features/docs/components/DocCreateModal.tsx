import React, { useEffect, useState } from "react";
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
import { Textarea } from "../../../shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/ui/select";
import { useI18n } from "../../../app/providers/I18nProvider";
import { createDoc } from "../api/docsApi";
import { listEmployees, type Employee } from "../../hr/api/employeesApi";

type DocStatus = "draft" | "review" | "approved" | "expired";
const UNSET = "__none__";

type Props = {
  tenantId: string;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function DocCreateModal({ tenantId, open, onClose, onCreated }: Props) {
  const { translate } = useI18n();
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>(UNSET);
  const [status, setStatus] = useState<DocStatus>("draft");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmps, setLoadingEmps] = useState(false);

  // Reset form on open + load employees
  useEffect(() => {
    if (!open) return;
    setTitle("");
    setAssigneeId(UNSET);
    setStatus("draft");
    setContent("");
    setError(null);

    setLoadingEmps(true);
    listEmployees(tenantId, "active")
      .then(setEmployees)
      .catch(() => setEmployees([]))
      .finally(() => setLoadingEmps(false));
  }, [open, tenantId]);

  async function handleCreate() {
    if (!title.trim() || !content.trim()) {
      setError(translate("docs.validationRequired"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const assignee = employees.find((e) => e.id === assigneeId);
      await createDoc(tenantId, {
        title: title.trim(),
        content: content.trim(),
        metadata: {
          owner: assignee?.name,
          assignee_id: assignee?.id,
          status,
        },
      });
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : translate("docs.createError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{translate("docs.createTitle")}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{translate("docs.titleLabel")}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={translate("docs.titlePlaceholder")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>{translate("docs.ownerLabel")}</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    loadingEmps
                      ? translate("common.loading")
                      : translate("docs.ownerSelectPlaceholder")
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>—</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}{" "}
                      <span className="text-xs text-slate-500">
                        ({translate(`auth.role.${emp.role}`)})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {assigneeId !== UNSET && (
                <p className="text-xs text-indigo-600">
                  ✓ {translate("docs.ownerNotificationHint")}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>{translate("docs.statusLabel")}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as DocStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{translate("docs.status.draft")}</SelectItem>
                  <SelectItem value="review">{translate("docs.status.review")}</SelectItem>
                  <SelectItem value="approved">{translate("docs.status.approved")}</SelectItem>
                  <SelectItem value="expired">{translate("docs.status.expired")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>{translate("docs.contentLabel")}</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={translate("docs.contentPlaceholder")}
              rows={8}
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {translate("common.cancel")}
          </Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? "..." : translate("docs.createAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
