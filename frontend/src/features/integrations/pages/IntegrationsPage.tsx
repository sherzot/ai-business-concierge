import React from "react";
import { IntegrationConfigForm } from "../components/IntegrationConfigForm";
import { IntegrationList, IntegrationItem } from "../components/IntegrationList";
import { getIntegrations, updateIntegration } from "../api/integrationsApi";

export function IntegrationsPage({ tenant }: { tenant: { id: string; name: string } }) {
  const [integrations, setIntegrations] = React.useState<IntegrationItem[]>([]);
  const [selected, setSelected] = React.useState<IntegrationItem | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadIntegrations();
  }, [tenant.id]);

  async function loadIntegrations() {
    setLoading(true);
    setError(null);
    try {
      const data = await getIntegrations(tenant.id);
      const mapped = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        status: item.status,
        lastSync: item.last_sync,
      }));
      setIntegrations(mapped);
      setSelected(mapped[0]);
    } catch (err) {
      console.error("Failed to load integrations", err);
      setError("Integratsiyalarni yuklab bo'lmadi.");
      setIntegrations([]);
      setSelected(undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h3 className="text-sm font-semibold text-slate-800">Integrations</h3>
          <p className="text-xs text-slate-400 mt-1">Tenant: {tenant.name}</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && <div className="p-6 text-sm text-slate-400">Yuklanmoqda...</div>}
          {!loading && error && <div className="p-6 text-sm text-rose-600">{error}</div>}
          {!loading && !error && (
            <IntegrationList integrations={integrations} selectedId={selected?.id} onSelect={setSelected} />
          )}
        </div>
      </div>
      <div className="hidden md:flex flex-1 flex-col bg-white">
        <IntegrationConfigForm
          integration={selected}
          onSave={async (payload) => {
            if (!selected) return;
            try {
              await updateIntegration(tenant.id, selected.id, payload);
            } catch (err) {
              console.error("Failed to update integration", err);
            }
          }}
        />
      </div>
    </div>
  );
}
