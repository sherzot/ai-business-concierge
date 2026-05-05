import { useState, useCallback } from "react";
import { submitHrSurvey } from "../api/hrApi";
import type { HrSurvey, SubmitSurveyInput } from "../types";

export type UseHrSurveysResult = {
  surveys: HrSurvey[];
  submitting: boolean;
  error: unknown;
  submit: (input: SubmitSurveyInput) => Promise<void>;
};

export function useHrSurveys(tenantId: string): UseHrSurveysResult {
  const [surveys, setSurveys] = useState<HrSurvey[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const submit = useCallback(async (input: SubmitSurveyInput) => {
    setSubmitting(true);
    setError(null);
    try {
      await submitHrSurvey(tenantId, input);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }, [tenantId]);

  return { surveys, submitting, error, submit };
}
