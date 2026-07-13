"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import {
  CONTENT_SEARCH_PATH,
  searchContentItems,
} from "@/lib/content/fetch-content";
import {
  flattenContentTree,
  substringMatchIds,
} from "@/lib/content/filter-tree";
import type { AdminContentTreeResponse } from "@/lib/content/types";
import { adminKeys } from "@/lib/query/keys";

const SEARCH_DEBOUNCE_MS = 450;

type UseContentSearchOptions = {
  tree: AdminContentTreeResponse | undefined;
  q: string;
};

export function useContentSearch({ tree, q }: UseContentSearchOptions) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const trimmed = q.trim();
  const [debouncedQ, setDebouncedQ] = useState(trimmed);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQ(trimmed);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [trimmed]);

  const items = useMemo(
    () => (tree ? flattenContentTree(tree) : []),
    [tree],
  );

  const fallbackIds = useMemo(() => {
    if (!trimmed || !tree) return null;
    return substringMatchIds(items, trimmed);
  }, [trimmed, tree, items]);

  const isDebouncing = Boolean(trimmed) && trimmed !== debouncedQ;
  const searchEnabled =
    Boolean(debouncedQ) &&
    items.length > 0 &&
    isLoaded &&
    Boolean(isSignedIn) &&
    Boolean(userId);

  const searchQuery = useQuery({
    queryKey: adminKeys.content.search(debouncedQ),
    enabled: searchEnabled,
    staleTime: 60_000,
    retry: false,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new ApiError({
          kind: "unauthorized",
          message: `[content] Clerk session has no token for ${CONTENT_SEARCH_PATH}`,
          path: CONTENT_SEARCH_PATH,
        });
      }
      return searchContentItems(token, {
        query: debouncedQ,
        items,
      });
    },
  });

  const llmReady =
    Boolean(trimmed) &&
    trimmed === debouncedQ &&
    searchQuery.isFetched &&
    !searchQuery.isFetching;

  const matchingIds = useMemo(() => {
    if (!trimmed) return null;

    if (llmReady && searchQuery.isSuccess) {
      const llmIds = searchQuery.data.matchingIds;
      if (llmIds.length > 0) return llmIds;
      if (fallbackIds && fallbackIds.length > 0) return fallbackIds;
      return llmIds;
    }

    if (fallbackIds && fallbackIds.length > 0) return fallbackIds;

    // Empty fallback while debounce/LLM still running: keep loading (null),
    // not "no results" and not the unfiltered tree.
    if (isDebouncing || (searchEnabled && !llmReady && !searchQuery.isError)) {
      return null;
    }

    // LLM failed → keep substring fallback (may be empty).
    if (searchQuery.isError) {
      return fallbackIds ?? [];
    }

    return fallbackIds ?? [];
  }, [
    trimmed,
    llmReady,
    searchQuery.isSuccess,
    searchQuery.isError,
    searchQuery.data,
    fallbackIds,
    isDebouncing,
    searchEnabled,
  ]);

  const isSearching =
    Boolean(trimmed) &&
    (isDebouncing ||
      (trimmed === debouncedQ &&
        searchEnabled &&
        (searchQuery.isPending || searchQuery.isFetching)));

  return {
    matchingIds,
    isSearching,
    usedFallback:
      Boolean(trimmed) &&
      llmReady &&
      (searchQuery.isError ||
        (searchQuery.isSuccess &&
          searchQuery.data.matchingIds.length === 0 &&
          Boolean(fallbackIds?.length))),
  };
}
