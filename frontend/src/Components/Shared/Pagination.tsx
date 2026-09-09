"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const firstVisiblePage =
    totalPages <= 5 || currentPage <= 3
      ? 1
      : currentPage >= totalPages - 3
        ? totalPages - 3
        : currentPage - 1;
  const visiblePages = Array.from(
    {
      length: Math.min(
        totalPages <= 5 ? totalPages : 4,
        totalPages - firstVisiblePage + 1,
      ),
    },
    (_, index) => firstVisiblePage + index,
  );
  const hasLeadingPages = firstVisiblePage > 1;
  const hasTrailingPages = visiblePages.at(-1)! < totalPages;

  return (
    <div
      className={`flex flex-col gap-2 border-t border-[#e5ebea] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <p className="text-xs text-[#77838d]">
        Showing{" "}
        <strong className="font-semibold text-[#49555e]">
          {startItem}–{endItem}
        </strong>{" "}
        of{" "}
        <strong className="font-semibold text-[#49555e]">{totalItems}</strong>
      </p>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="grid size-8 place-items-center rounded-md border border-[#e0e6e5] text-[#64717c] transition hover:border-[#1d625b] hover:text-[#1d625b] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        {hasLeadingPages ? (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              aria-label="Page 1"
              className="grid size-8 place-items-center rounded-md border border-[#e0e6e5] text-xs font-semibold text-[#64717c] transition hover:border-[#1d625b] hover:text-[#1d625b]"
            >
              1
            </button>
            <span className="px-0.5 text-xs font-semibold text-[#77838d]">
              …
            </span>
          </>
        ) : null}
        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={`grid size-8 place-items-center rounded-md border text-xs font-semibold transition ${
              page === currentPage
                ? "border-[#1d625b] bg-[#1d625b] text-white"
                : "border-[#e0e6e5] text-[#64717c] hover:border-[#1d625b] hover:text-[#1d625b]"
            }`}
          >
            {page}
          </button>
        ))}
        {hasTrailingPages ? (
          <>
            <span className="px-0.5 text-xs font-semibold text-[#77838d]">
              …
            </span>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              aria-label={`Page ${totalPages}`}
              className="grid size-8 place-items-center rounded-md border border-[#e0e6e5] text-xs font-semibold text-[#64717c] transition hover:border-[#1d625b] hover:text-[#1d625b]"
            >
              {totalPages}
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="grid size-8 place-items-center rounded-md border border-[#e0e6e5] text-[#64717c] transition hover:border-[#1d625b] hover:text-[#1d625b] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
