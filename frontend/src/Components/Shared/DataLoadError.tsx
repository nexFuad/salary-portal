export default function DataLoadError({ retry }: { retry: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-rose-200 bg-white p-6 text-center">
      <p className="font-semibold text-slate-800">Could not load this data.</p>
      <p className="mt-1 text-sm text-slate-500">Please check your connection and try again.</p>
      <button type="button" onClick={retry} className="mt-4 rounded-lg bg-[#2f766d] px-4 py-2 text-sm font-semibold text-white">
        Try again
      </button>
    </div>
  );
}
