/**
 * React Query mutation for candidate analysis.
 *
 * Status: SKELETON.
 * Owner: frontend agent (next session).
 *
 * Usage:
 *   const { mutate, data, isPending, error } = useCandidateAnalysis();
 *   mutate({ githubInput, cvFile, jobDescription, locale, analysisDepth });
 */

import { useMutation } from "@tanstack/react-query";
import { analyzeCandidate } from "../api/candidatesApi";
import type { AnalyzeFormInput, CandidateAnalysisResult } from "../types";

export function useCandidateAnalysis() {
  // TODO: read auth token from features/auth/context/AuthContext
  const getAuthToken = (): string => {
    // placeholder — wire to AuthContext.session.access_token
    return "";
  };

  return useMutation<CandidateAnalysisResult, Error, AnalyzeFormInput>({
    mutationKey: ["hr", "candidates", "analyze"],
    mutationFn: async (input) => {
      const token = getAuthToken();
      return await analyzeCandidate(input, token);
    },
    // No retries — 30s is already long, retrying triples cost
    retry: 0,
  });
}
