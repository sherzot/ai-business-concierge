import { useDebounce } from "../../../shared/hooks/useDebounce";
import { useDocs } from "./useDocs";

export function useDocSearch(tenantId: string) {
  const hook = useDocs(tenantId);
  const debouncedQuery = useDebounce(hook.query, 300);
  return { ...hook, debouncedQuery };
}
