import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  generateDoc,
  type DocumentTemplate,
  type GenerateDocumentResult,
} from "../api/docsApi";
import { useI18n } from "../../../app/providers/I18nProvider";

type Props = {
  tenantId: string;
  template: DocumentTemplate | null;
  open: boolean;
  onClose: () => void;
  onGenerated: (result: GenerateDocumentResult) => void;
};

export function TemplateGenerateModal({
  tenantId,
  template,
  open,
  onClose,
  onGenerated,
}: Props) {
  const { translate } = useI18n();
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [format, setFormat] = React.useState<"pdf" | "docx">("docx");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setValues({});
    setFormat("docx");
    setError(null);
  }, [open, template?.id]);

  if (!template) return null;

  async function handleGenerate() {
    const missing = template.fields.filter(
      (field) => field.required && !values[field.name]?.trim(),
    );
    if (missing.length) {
      setError(
        translate("docs.templates.requiredFields", {
          fields: missing.map((field) => field.label).join(", "),
        }),
      );
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await generateDoc(tenantId, {
        templateId: template.id,
        locale: template.requested_locale,
        format,
        fieldsData: values,
      });
      onGenerated(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : translate("docs.templates.generateError"),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{template.title}</DialogTitle>
          <DialogDescription>
            {template.description || translate("docs.templates.defaultDescription")}
          </DialogDescription>
        </DialogHeader>

        {template.applied_locale !== template.requested_locale && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {translate("docs.templates.fallbackWarning", {
              locale: template.applied_locale.toUpperCase(),
            })}
          </div>
        )}

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          {template.fields.map((field) => {
            const commonProps = {
              id: `template-field-${field.name}`,
              value: values[field.name] ?? "",
              onChange: (
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
              ) =>
                setValues((current) => ({
                  ...current,
                  [field.name]: event.target.value,
                })),
              placeholder: field.label,
            };

            return (
              <div
                key={field.name}
                className={field.type === "textarea" ? "grid gap-2 sm:col-span-2" : "grid gap-2"}
              >
                <Label htmlFor={`template-field-${field.name}`}>
                  {field.label}
                  {field.required && <span className="text-rose-500"> *</span>}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea {...commonProps} rows={4} />
                ) : (
                  <Input
                    {...commonProps}
                    type={
                      field.type === "date"
                        ? "date"
                        : field.type === "number"
                          ? "number"
                          : "text"
                    }
                  />
                )}
              </div>
            );
          })}

          <div className="grid gap-2 sm:col-span-2">
            <Label>{translate("docs.templates.formatLabel")}</Label>
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as "pdf" | "docx")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="docx">DOCX</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {translate("docs.templates.formatHint")}
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {translate("docs.templates.cancel")}
          </Button>
          <Button onClick={handleGenerate} disabled={saving}>
            {saving
              ? translate("docs.templates.creating")
              : translate("docs.templates.createDraft")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
