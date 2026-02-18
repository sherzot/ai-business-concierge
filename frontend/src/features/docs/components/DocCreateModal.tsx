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

type DocStatus = "draft" | "review" | "approved" | "expired";

type Props = {
  tenantId: string;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function DocCreateModal({ tenantId, open, onClose, onCreated }: Props) {
  const { translate } = useI18n();
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState<DocStatus>("draft");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setOwner("");
      setStatus("draft");
      setContent("");
      setError(null);
    }
  }, [open]);

  async function handleCreate() {
    if (!title.trim() || !content.trim()) {
      setError(translate("docs.validationRequired"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createDoc(tenantId, {
        title: title.trim(),
        content: content.trim(),
        metadata: {
          owner: owner.trim() || undefined,
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
              <Input
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder={translate("docs.ownerPlaceholder")}
              />
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
