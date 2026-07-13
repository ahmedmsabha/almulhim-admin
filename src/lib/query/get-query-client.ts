import {
  environmentManager,
  QueryClient,
  type QueryClientConfig,
} from "@tanstack/react-query";

const defaultOptions: QueryClientConfig["defaultOptions"] = {
  queries: {
    staleTime: 60_000,
  },
};

function makeQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (environmentManager.isServer()) {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

/** Drop cached admin queries when the Clerk session ends. */
export function clearBrowserQueryClient(): void {
  if (environmentManager.isServer()) return;
  browserQueryClient?.clear();
}
