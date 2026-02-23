import React from "react";
import { HrCaseDetail } from "../components/HrCaseDetail";
import { HrCaseList, HrCase } from "../components/HrCaseList";
import { HrSurveyForm } from "../components/HrSurveyForm";
import { getHrCases, submitHrSurvey } from "../api/hrApi";
import { useI18n } from "../../../app/providers/I18nProvider";
import { ErrorState } from "../../../shared/components/ErrorState";
import { normalizeError, getTraceIdFromError } from "../../../shared/lib/errorHandling";

export function HrCasesPage({ tenant }: { tenant: { id: string; name: string } }) {
  const { translate } = useI18n();
  const [cases, setCases] = React.useState<HrCase[]>([]);
  const [selected, setSelected] = React.useState<HrCase | undefined>(undefined);
  const [surveyLog, setSurveyLog] = React.useState<Array<{ score: number; comment: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);

  React.useEffect(() => {
    loadCases();
  }, [tenant.id]);

  async function loadCases() {
    setLoading(true);
    setError(null);
    try {
      const data = await getHrCases(tenant.id);
      const i18nCases: Record<
        string,
        { title: string; summary: string }
      > = {
        hr_001: {
          title: translate("hr.case.burnout.title"),
          summary: translate("hr.case.burnout.summary"),
        },
        hr_002: {
          title: translate("hr.case.onboarding.title"),
          summary: translate("hr.case.onboarding.summary"),
        },
        hr_003: {
          title: translate("hr.case.policy.title"),
          summary: translate("hr.case.policy.summary"),
        },
      };
      const mapped = data.map((item) => {
        const localized = i18nCases[item.id];
        return {
          id: item.id,
          title: localized?.title ?? item.title,
          employee: item.employee,
          status: item.status,
          priority: item.priority,
          createdAt: item.created_at,
          summary: localized?.summary ?? item.summary,
        };
      });
      setCases(mapped);
      setSelected(mapped[0]);
    } catch (err) {
      console.error("Failed to load HR cases", err);
      setError(err ?? translate("hr.loadError"));
      setCases([]);
      setSelected(undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm lg:col-span-1">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-800">{translate("hr.casesTitle")}</h3>
          <p className="text-xs text-slate-400 mt-1">
            {translate("common.tenant")}: {tenant.name}
          </p>
        </div>
        {loading && <div className="p-6 text-sm text-slate-400">{translate("common.loading")}</div>}
        {!loading && error && <ErrorState message={normalizeError(error)} traceId={getTraceIdFromError(error)} />}
        {!loading && !error && <HrCaseList cases={cases} selectedId={selected?.id} onSelect={setSelected} />}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm lg:col-span-2">
        <HrCaseDetail item={selected} />
      </div>

      <div className="lg:col-span-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HrSurveyForm
            onSubmit={async (payload) => {
              try {
                await submitHrSurvey(tenant.id, payload);
                setSurveyLog((prev) => [{ ...payload }, ...prev].slice(0, 5));
              } catch (err) {
                console.error("Failed to submit HR survey", err);
              }
            }}
          />
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">{translate("hr.surveyHistory")}</h3>
            {surveyLog.length === 0 ? (
              <p className="text-sm text-slate-400">{translate("hr.surveyEmpty")}</p>
            ) : (
              <ul className="space-y-2">
                {surveyLog.map((item, idx) => (
                  <li key={idx} className="border border-slate-100 rounded-lg p-3">
                    <div className="text-xs text-slate-500">
                      {translate("hr.surveyScoreLabel")}: {item.score}
                    </div>
                    <div className="text-sm text-slate-700 mt-1">
                      {item.comment || translate("hr.surveyNoComment")}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
