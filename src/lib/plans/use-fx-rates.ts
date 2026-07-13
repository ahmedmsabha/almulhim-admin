"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchIlsFxRates } from "@/lib/plans/fetch-fx-rates";
import { adminKeys } from "@/lib/query/keys";

/** Cache FX for one hour — display-only, not Nest truth. */
const FX_STALE_MS = 60 * 60 * 1000;

export function useIlsFxRates() {
  return useQuery({
    queryKey: adminKeys.plans.fxRates(),
    queryFn: fetchIlsFxRates,
    staleTime: FX_STALE_MS,
    gcTime: FX_STALE_MS * 6,
    retry: 1,
  });
}
