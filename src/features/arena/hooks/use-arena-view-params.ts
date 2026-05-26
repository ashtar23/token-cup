"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ARENA_VIEW_PARAM,
  type ArenaTab,
  parseArenaTab,
  parseNullableViewParam,
  parseSearchViewParam,
} from "../lib/arena-view-params";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

type NavigateMode = "push" | "replace";

interface ArenaViewParamUpdates {
  tab?: ArenaTab;
  group?: string | null;
  search?: string;
}

export function useArenaViewParams() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tab = parseArenaTab(searchParams.get(ARENA_VIEW_PARAM.tab));
  const group = parseNullableViewParam(
    searchParams.get(ARENA_VIEW_PARAM.group),
  );
  const search = parseSearchViewParam(
    searchParams.get(ARENA_VIEW_PARAM.search),
  );
  const [searchState, setSearchState] = useState({
    input: search,
    source: search,
  });
  let searchInput = searchState.input;

  if (searchState.source !== search) {
    searchInput = search;
    setSearchState({ input: search, source: search });
  }

  const createHref = useCallback(
    (updates: ArenaViewParamUpdates) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.tab !== undefined) {
        if (updates.tab === "open") {
          params.delete(ARENA_VIEW_PARAM.tab);
        } else {
          params.set(ARENA_VIEW_PARAM.tab, updates.tab);
        }
      }

      if (updates.group !== undefined) {
        const groupValue = updates.group?.trim();
        if (groupValue) {
          params.set(ARENA_VIEW_PARAM.group, groupValue);
        } else {
          params.delete(ARENA_VIEW_PARAM.group);
        }
      }

      if (updates.search !== undefined) {
        if (updates.search.trim()) {
          params.set(ARENA_VIEW_PARAM.search, updates.search);
        } else {
          params.delete(ARENA_VIEW_PARAM.search);
        }
      }

      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams],
  );

  const navigate = useCallback(
    (updates: ArenaViewParamUpdates, mode: NavigateMode) => {
      const href = createHref(updates);
      const options = { scroll: false };

      if (mode === "push") {
        router.push(href, options);
        return;
      }

      router.replace(href, options);
    },
    [createHref, router],
  );

  const debouncedSetSearch = useDebouncedCallback(
    (nextSearch: string) => navigate({ search: nextSearch }, "replace"),
    300,
  );

  return {
    group,
    search,
    setGroup: (nextGroup: string | null) =>
      navigate({ group: nextGroup }, "replace"),
    searchInput,
    setSearch: (nextSearch: string) => {
      setSearchState((current) => ({ ...current, input: nextSearch }));
      debouncedSetSearch(nextSearch);
    },
    setTab: (nextTab: ArenaTab) => navigate({ tab: nextTab }, "push"),
    tab,
  };
}
