import React from "react";
import { IntegrationItem } from "./IntegrationList";

export function IntegrationConfigForm({
  integration,
  onSave,
}: {
  integration?: IntegrationItem;
  onSave: (payload: { apiKey: string; webhook: string }) => void;
}) {
  const [apiKey, setApiKey] = React.useState("");
  const [webhook, setWebhook] = React.useState("");

  React.useEffect(() => {
    setApiKey("");
    setWebhook("");
  }, [integration?.id]);

  if (!integration) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <p className="text-sm">Integratsiyani tanlang</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-slate-900">{integration.name} Settings</h2>
      <p className="text-xs text-slate-500 mt-1">{integration.description}</p>

      <div className="mt-4 space-y-3">
        <label className="text-xs text-slate-500">API Token</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
          placeholder="sk_live_..."
        />
        <label className="text-xs text-slate-500">Webhook URL</label>
        <input
          type="text"
          value={webhook}
          onChange={(e) => setWebhook(e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
          placeholder="https://example.com/webhook"
        />
        <button
          onClick={() => onSave({ apiKey, webhook })}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          Saqlash
        </button>
      </div>
    </div>
  );
}
