import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { polishDoc, updateDoc } from "../api/docsApi";
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
  const { translate, locale } = useI18n();
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState<DocStatus>("draft");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polishInstruction, setPolishInstruction] = useState("");
  const [polishing, setPolishing] = useState(false);
  const [polishError, setPolishError] = useState<string | null>(null);
  const [polishApplied, setPolishApplied] = useState(false);
  const polishRequestSequence = React.useRef(0);
  const contentRevision = React.useRef(0);

  useEffect(() => {
    polishRequestSequence.current += 1;
    contentRevision.current += 1;
    if (open && doc) {
      setTitle(doc.title);
      setOwner(doc.owner ?? "");
      setStatus(doc.status ?? "draft");
      setContent(doc.content ?? "");
      setError(null);
      setPolishInstruction("");
      setPolishError(null);
      setPolishApplied(false);
      setPolishing(false);
    }
  }, [open, doc]);

  async function handlePolish() {
    if (!doc) return;
    if (!polishInstruction.trim()) {
      setPolishError(translate("docs.polish.required"));
      return;
    }
    if (!content.trim()) {
      setPolishError(translate("docs.validationRequired"));
      return;
    }

    setPolishing(true);
    setPolishError(null);
    setPolishApplied(false);
    const requestId = ++polishRequestSequence.current;
    const requestedContentRevision = contentRevision.current;
    try {
      const result = await polishDoc(tenantId, doc.id, {
        instruction: polishInstruction.trim(),
        content: content.trim(),
        locale,
      });
      if (requestId !== polishRequestSequence.current) return;
      if (requestedContentRevision !== contentRevision.current) {
        setPolishError(translate("docs.polish.contentChanged"));
        return;
      }
      contentRevision.current += 1;
      setContent(result.content);
      setPolishInstruction("");
      setPolishApplied(true);
    } catch (e) {
      if (requestId !== polishRequestSequence.current) return;
      setPolishError(
        e instanceof Error ? e.message : translate("docs.polish.error"),
      );
    } finally {
      if (requestId === polishRequestSequence.current) {
        setPolishing(false);
      }
    }
  }

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
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{translate("docs.editTitle")}</DialogTitle>
          <DialogDescription>
            {translate("docs.editDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="doc-edit-title">{translate("docs.titleLabel")}</Label>
            <Input
              id="doc-edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={translate("docs.titlePlaceholder")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="doc-edit-owner">{translate("docs.ownerLabel")}</Label>
              <Input
                id="doc-edit-owner"
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
            <Label htmlFor="doc-edit-content">{translate("docs.contentLabel")}</Label>
            <Textarea
              id="doc-edit-content"
              value={content}
              onChange={(event) => {
                contentRevision.current += 1;
                setContent(event.target.value);
              }}
              placeholder={translate("docs.contentPlaceholder")}
            />
          </div>

          <section className="grid gap-3 rounded-xl border border-primary/25 bg-accent/50 p-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {translate("docs.polish.title")}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {translate("docs.polish.description")}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="doc-polish-instruction">
                {translate("docs.polish.instructionLabel")}
              </Label>
              <Textarea
                id="doc-polish-instruction"
                value={polishInstruction}
                onChange={(event) => setPolishInstruction(event.target.value)}
                placeholder={translate("docs.polish.placeholder")}
                maxLength={2000}
                rows={3}
                disabled={polishing || saving}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handlePolish}
                disabled={polishing || saving || !content.trim()}
              >
                {polishing
                  ? translate("docs.polish.working")
                  : translate("docs.polish.action")}
              </Button>
              <p className="text-xs text-muted-foreground">
                {translate("docs.polish.reviewHint")}
              </p>
            </div>
            <div aria-live="polite">
              {polishError && (
                <p className="text-sm text-rose-600">{polishError}</p>
              )}
              {polishApplied && (
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {translate("docs.polish.success")}
                </p>
              )}
            </div>
          </section>

          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving || polishing}>
            {translate("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving || polishing}>
            {saving ? "..." : translate("docs.editAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
