export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type PageFilters = { search?: string; page: number; pageSize: number };
