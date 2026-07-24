import React from "react";
import { useI18n } from "../../app/providers/I18nProvider";

export function LoadingSpinner() {
  const { translate } = useI18n();
  return (
    <div className="flex items-center justify-center p-6 text-muted-foreground">
      {translate("common.loading")}
    </div>
  );
}
