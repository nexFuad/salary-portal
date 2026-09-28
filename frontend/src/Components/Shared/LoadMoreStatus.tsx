import { LoaderCircle } from "lucide-react";

export default function LoadMoreStatus({
  loading,
  error,
  onRetry,
}: {
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <div role="status" className="flex items-center justify-center gap-2 py-5 text-xs text-slate-500">
        <LoaderCircle className="size-4 animate-spin" />
        Loading more…
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-5 text-center">
        <button type="button" onClick={onRetry} className="text-xs font-semibold text-[#17665c]">
          Could not load more. Try again
        </button>
      </div>
    );
  }

  return null;
}
