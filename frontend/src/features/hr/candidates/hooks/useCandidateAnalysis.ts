/**
 * useCandidateAnalysis — plain React hook (loyihada React Query yo'q).
 *
 * Auth: candidatesApi.analyzeCandidate() ichida supabase.auth.getSession() chaqiriladi.
 *       Tenant ID'ni hook ichida AuthContext orqali olamiz.
 *
 * Usage:
 *   const { mutate, data, isPending, error, reset } = useCandidateAnalysis();
 *   mutate({ githubInput, cvFile, jobDescription, locale, analysisDepth });
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { analyzeCandidate, CandidateRequestError } from "../api/candidatesApi";
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
  const controllerRef = useRef<AbortController | null>(null);
  const requestSequence = useRef(0);

  const mutate = useCallback(
    async (input: AnalyzeFormInput) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const sequence = ++requestSequence.current;
      setState({ data: null, error: null, isPending: true });

      try {
        const result = await analyzeCandidate(input, currentTenant?.id, {
          signal: controller.signal,
        });
        if (sequence === requestSequence.current) {
          setState({ data: result, error: null, isPending: false });
        }
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (
          sequence === requestSequence.current &&
          !(
            error instanceof CandidateRequestError && error.code === "CANCELLED"
          )
        ) {
          setState({ data: null, error, isPending: false });
        }
        return null;
      } finally {
        if (sequence === requestSequence.current) controllerRef.current = null;
      }
    },
    [currentTenant?.id],
  );

  const reset = useCallback(() => {
    requestSequence.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState(INITIAL);
  }, []);

  useEffect(
    () => () => {
      requestSequence.current += 1;
      controllerRef.current?.abort();
    },
    [],
  );

  useEffect(() => {
    reset();
  }, [currentTenant?.id, reset]);

  return {
    mutate,
    data: state.data,
    error: state.error,
    isPending: state.isPending,
    reset,
  };
}
