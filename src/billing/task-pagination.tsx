import { useEffect, useRef } from "react";
import { BillingError } from "./billing-error.tsx";

interface TaskPaginationProps {
  hasMore: boolean;
  loading: boolean;
  error: string;
  disabled: boolean;
  onLoadMore: () => Promise<void>;
}

export function TaskPagination({
  hasMore,
  loading,
  error,
  disabled,
  onLoadMore,
}: TaskPaginationProps) {
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasMore || loading || error || disabled || typeof IntersectionObserver === "undefined")
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void onLoadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel.current!);
    return () => observer.disconnect();
  }, [hasMore, loading, error, disabled, onLoadMore]);

  if (!hasMore) return null;
  return (
    <div ref={sentinel} className="task-pagination">
      <BillingError message={error} />
      {loading && <p role="status">Loading more tasks...</p>}
      <button disabled={loading || disabled} onClick={() => void onLoadMore()}>
        {error ? "Retry loading tasks" : "Load more tasks"}
      </button>
    </div>
  );
}
