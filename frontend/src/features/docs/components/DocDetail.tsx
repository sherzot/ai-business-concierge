import React from "react";
import { FileText, Download } from "lucide-react";
import { DocItem } from "./DocList";
import { DocStatusBadge } from "./DocStatusBadge";
import { useI18n } from "../../../app/providers/I18nProvider";
import { Button } from "../../../shared/ui/button";
import { exportDoc } from "../api/docsApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../shared/ui/alert-dialog";

export function DocDetail({
  doc,
  tenantId,
  onEdit,
  onDelete,
  onExported,
}: {
  doc?: DocItem;
  tenantId: string;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
  onExported?: () => Promise<void>;
}) {
  const { translate, locale } = useI18n();
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState<"pdf" | "docx" | null>(null);
  const [exportError, setExportError] = React.useState<string | null>(null);

  async function handleExport(format: "pdf" | "docx") {
    if (!doc) return;
    setExporting(format);
    setExportError(null);
    try {
      const result = await exportDoc(tenantId, doc.id, format, locale);
      const link = window.document.createElement("a");
      link.href = result.download_url;
      link.download = result.file_name;
      link.rel = "noopener noreferrer";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      await onExported?.();
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : translate("docs.exportError"),
      );
    } finally {
      setExporting(null);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await onDelete();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : translate("docs.deleteError"));
    } finally {
      setDeleting(false);
    }
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <FileText size={32} className="mb-2 opacity-40" />
        <p className="text-sm">{translate("docs.select")}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{doc.title}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {translate("docs.owner")}: {doc.owner ?? "—"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DocStatusBadge status={doc.status} />

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("pdf")}
            disabled={Boolean(exporting)}
          >
            <Download size={14} className="mr-1.5" />
            {exporting === "pdf" ? "..." : translate("docs.downloadPdf")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("docx")}
            disabled={Boolean(exporting)}
          >
            <Download size={14} className="mr-1.5" />
            {exporting === "docx" ? "..." : translate("docs.downloadDocx")}
          </Button>

          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              {translate("docs.editAction")}
            </Button>
          )}
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  {translate("docs.deleteAction")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{translate("docs.deleteTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {translate("docs.deleteDescription")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {deleteError && <p className="text-sm text-rose-600">{deleteError}</p>}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>
                    {translate("common.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                    {deleting ? "..." : translate("docs.deleteConfirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {exportError && (
        <p className="mb-3 text-sm text-rose-600">{exportError}</p>
      )}

      <div className="text-sm text-slate-600 leading-relaxed">
        <p className="mb-3 whitespace-pre-line">
          {doc.content ||
            "Ushbu hujjat kompaniya ichki siyosatlari va jarayonlariga tegishli. Mazmuni tekshirilmoqda va tasdiqlangandan so'ng tegishli bo'limlarga tarqatiladi."}
        </p>
        <p className="text-xs text-slate-400">
          {translate("docs.updatedAt")}: {doc.updatedAt}
        </p>
      </div>
    </div>
  );
}
