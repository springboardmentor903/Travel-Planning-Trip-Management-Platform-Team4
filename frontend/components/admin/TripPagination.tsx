"use client";

interface TripPaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export default function TripPagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
}: TripPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs font-semibold text-slate-400">
      <div>
        Showing page <span className="text-white">{page + 1}</span> of{" "}
        <span className="text-white">{totalPages}</span> ({totalElements} total trips)
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
