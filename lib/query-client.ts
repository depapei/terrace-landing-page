import { QueryClient } from "@tanstack/react-query";
import { ApiClientError } from "./axios";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Client errors (401/403/404/422) will not succeed on retry.
        retry: (failureCount, error) =>
          !(error instanceof ApiClientError && error.status >= 400 && error.status < 500) &&
          failureCount < 2,
      },
      mutations: { retry: false },
    },
  });
}
