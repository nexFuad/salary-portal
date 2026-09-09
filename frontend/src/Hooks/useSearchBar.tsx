"use client";

import { useMemo, useState } from "react";

export type SearchField<T> = keyof T | ((item: T) => unknown);

type UseSearchBarOptions<T> = {
  data: T[];
  searchFields: SearchField<T>[];
  initialQuery?: string;
};

function normalizeSearchValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(normalizeSearchValue).join(" ");

  return String(value).toLocaleLowerCase();
}

export function useSearchBar<T>({
  data,
  searchFields,
  initialQuery = "",
}: UseSearchBarOptions<T>) {
  const [query, setQuery] = useState(initialQuery);
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const filteredData = useMemo(() => {
    if (!normalizedQuery) return data;

    return data.filter((item) =>
      searchFields.some((field) => {
        const value = typeof field === "function" ? field(item) : item[field];
        return normalizeSearchValue(value).includes(normalizedQuery);
      }),
    );
  }, [data, normalizedQuery, searchFields]);

  function clearSearch() {
    setQuery("");
  }

  return {
    query,
    setQuery,
    clearSearch,
    filteredData,
    hasQuery: normalizedQuery.length > 0,
    resultCount: filteredData.length,
  };
}
