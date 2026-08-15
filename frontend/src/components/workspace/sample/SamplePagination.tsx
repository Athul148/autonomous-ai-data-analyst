import { ChevronLeft, ChevronRight } from "lucide-react";

interface SamplePaginationProps {
  page: number;
  totalPages: number;
  totalRows: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function SamplePagination({
  page,
  totalPages,
  totalRows,
  pageSize,
  onPageChange,
}: SamplePaginationProps) {
  const startRow =
    totalRows === 0 ? 0 : (page - 1) * pageSize + 1;

  const endRow = Math.min(page * pageSize, totalRows);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-400">
        Showing {startRow.toLocaleString("en-IN")}–
        {endRow.toLocaleString("en-IN")} of{" "}
        {totalRows.toLocaleString("en-IN")} rows
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <span className="text-sm text-slate-300">
          Page {page.toLocaleString("en-IN")} of{" "}
          {Math.max(totalPages, 1).toLocaleString("en-IN")}
        </span>

        <button
          type="button"
          disabled={page >= totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default SamplePagination;