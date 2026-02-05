import React from "react";
import { useI18n } from "../../../app/providers/I18nProvider";

export function ProfileForm({ onSave }: { onSave?: (payload: { name: string; email: string; company: string }) => void }) {
  const { translate } = useI18n();
  const [name, setName] = React.useState("Jasurbek Abdullayev");
  const [email, setEmail] = React.useState("jasurbek@example.com");
  const [company, setCompany] = React.useState("Acme Logistics LLC");

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">{translate("common.profile")}</h3>
      <div className="space-y-3">
        <label className="text-xs text-slate-500">{translate("common.fullName")}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
        <label className="text-xs text-slate-500">{translate("common.email")}</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
        <label className="text-xs text-slate-500">{translate("common.company")}</label>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => onSave?.({ name, email, company })}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          {translate("common.save")}
        </button>
      </div>
    </div>
  );
}
