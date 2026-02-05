import React from "react";
import { IntegrationStatusBadge, IntegrationStatus } from "./IntegrationStatusBadge";
import { useI18n } from "../../../app/providers/I18nProvider";

export type IntegrationItem = {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  lastSync: string;
};

export function IntegrationList({
  integrations,
  selectedId,
  onSelect,
}: {
  integrations: IntegrationItem[];
  selectedId?: string;
  onSelect: (item: IntegrationItem) => void;
}) {
  const { translate } = useI18n();
  return (
    <div className="divide-y divide-slate-100">
      {integrations.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className={`w-full text-left p-4 hover:bg-white transition-colors ${
            selectedId === item.id ? "bg-white border-l-4 border-indigo-600" : "bg-transparent border-l-4 border-transparent"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">{item.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{item.description}</p>
            </div>
            <IntegrationStatusBadge status={item.status} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {translate("integrations.lastSync")}: {item.lastSync}
          </p>
        </button>
      ))}
    </div>
  );
}
