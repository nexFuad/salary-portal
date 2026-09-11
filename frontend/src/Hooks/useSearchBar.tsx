"use client";

import { useEffect, useState } from "react";

type UseSearchBarOptions = {
  initialQuery?: string;
  delay?: number;
};

/** Debounces user input before it is sent as a server-side search parameter. */
export function useSearchBar({
  initialQuery = "",
  delay = 350,
}: UseSearchBarOptions = {}) {
  const [query, setQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery.trim());

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchQuery(query.trim()), delay);
    return () => window.clearTimeout(timer);
  }, [delay, query]);

  return {
    query,
    setQuery,
    searchQuery,
    clearSearch: () => setQuery(""),
    hasQuery: Boolean(searchQuery),
  };
}
