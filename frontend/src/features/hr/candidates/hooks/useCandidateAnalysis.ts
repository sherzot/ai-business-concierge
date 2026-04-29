/**
 * useCandidateAnalysis — plain React hook (loyihada React Query ishlatilmaydi).
 *
 * Status: SKELETON.
 * Owner: frontend agent (next session).
 *
 * Usage:
 *   const { mutate, data, isPending, error, reset } = useCandidateAnalysis();
 *   mutate({ githubInput, cvFile, jobDescription, locale, analysisDepth });
 */

import { useCallback, useState } from "react";
import { analyzeCandidate } from "../api/candidatesApi";
import type { AnalyzeFormInput, CandidateAnalysisResult } from "../types";

type State = {
  data: CandidateAnalysisResult | null;
  error: Error | null;
  isPending: boolean;
};

const INITIAL: State = { data: null, error: null, isPending: false };

export function useCandidateAnalysis() {
  const [state, setState] = useState<State>(INITIAL);

  const mutate = useCallback(async (input: AnalyzeFormInput) => {
    setState({ data: null, error: null, isPending: true });

    // TODO: read auth token from features/auth/context/AuthContext
    //       Wiring example:
    //         const { session } = useAuthContext();
    //         const token = session?.access_token ?? "";
    const token = "";

    try {
      const result = await analyzeCandidate(input, token);
      setState({ data: result, error: null, isPending: false });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ data: null, error, isPending: false });
      throw error;
    }
  }, []);

  const reset = useCallback(() => setState(INITIAL), []);

  return {
    mutate,
    data: state.data,
    error: state.error,
    isPending: state.isPending,
    reset,
  };
}
