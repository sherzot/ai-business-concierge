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
import { updateDoc } from "../api/docsApi";
import { DocItem } from "./DocList";

type DocStatus = "draft" | "review" | "approved" | "expired";

type Props = {
  tenantId: string;
  doc?: DocItem;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function DocEditModal({ tenantId, doc, open, onClose, onSaved }: Props) {
  const { translate } = useI18n();
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState<DocStatus>("draft");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && doc) {
      setTitle(doc.title);
      setOwner(doc.owner ?? "");
      setStatus(doc.status ?? "draft");
      setContent(doc.content ?? "");
      setError(null);
    }
  }, [open, doc]);

  async function handleSave() {
    if (!doc) return;
    if (!title.trim() || !content.trim()) {
      setError(translate("docs.validationRequired"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateDoc(tenantId, doc.id, {
        title: title.trim(),
        content: content.trim(),
        metadata: {
          owner: owner.trim() || undefined,
          status,
        },
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : translate("docs.updateError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{translate("docs.editTitle")}</DialogTitle>
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
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "..." : translate("docs.editAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
