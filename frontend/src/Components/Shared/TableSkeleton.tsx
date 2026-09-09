export default function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 h-4 w-40 animate-pulse rounded bg-slate-200" />
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex gap-4 border-t border-slate-100 py-4">
          <div className="h-4 w-1/4 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-1/5 animate-pulse rounded bg-slate-100" />
          <div className="h-4 flex-1 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
