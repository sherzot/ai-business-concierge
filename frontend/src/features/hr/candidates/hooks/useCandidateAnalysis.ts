/**
 * useCandidateAnalysis — plain React hook (loyihada React Query yo'q).
 *
 * Status: SKELETON.
 * Owner: frontend agent.
 *
 * Auth: candidatesApi.analyzeCandidate() ichida supabase.auth.getSession() chaqiriladi.
 *       Tenant ID'ni hook ichida AuthContext orqali olamiz.
 *
 * Usage:
 *   const { mutate, data, isPending, error, reset } = useCandidateAnalysis();
 *   mutate({ githubInput, cvFile, jobDescription, locale, analysisDepth });
 */

import { useCallback, useState } from "react";
import { analyzeCandidate } from "../api/candidatesApi";
import { useAuthContext } from "../../../auth/context/AuthContext";
import type { AnalyzeFormInput, CandidateAnalysisResult } from "../types";

type State = {
  data: CandidateAnalysisResult | null;
  error: Error | null;
  isPending: boolean;
};

const INITIAL: State = { data: null, error: null, isPending: false };

export function useCandidateAnalysis() {
  const [state, setState] = useState<State>(INITIAL);
  const { currentTenant } = useAuthContext();

  const mutate = useCallback(async (input: AnalyzeFormInput) => {
    setState({ data: null, error: null, isPending: true });

    try {
      const result = await analyzeCandidate(input, currentTenant?.id);
      setState({ data: result, error: null, isPending: false });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ data: null, error, isPending: false });
      throw error;
    }
  }, [currentTenant?.id]);

  const reset = useCallback(() => setState(INITIAL), []);

  return {
    mutate,
    data: state.data,
    error: state.error,
    isPending: state.isPending,
    reset,
  };
}
