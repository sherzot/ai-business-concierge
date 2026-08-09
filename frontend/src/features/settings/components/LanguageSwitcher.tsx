import React from "react";
import { useI18n } from "../../../app/providers/I18nProvider";
import { LocaleSelect } from "../../../shared/components/LocaleSelect";

export function LanguageSwitcher() {
  const { translate } = useI18n();

  return (
    <section className="border-y border-border py-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">{translate("common.language")}</h3>
      <LocaleSelect variant="light" />
    </section>
  );
}
