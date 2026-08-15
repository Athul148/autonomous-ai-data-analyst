interface SampleToolbarProps {
  search: string;
  pageSize: number;
  totalRows: number;
  onSearchChange: (value: string) => void;
  onPageSizeChange: (value: number) => void;
}

function SampleToolbar({
  search,
  pageSize,
  totalRows,
  onSearchChange,
  onPageSizeChange,
}: SampleToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex-1">
        <input
          type="search"
          value={search}
          onChange={(e) =>
            onSearchChange(e.target.value)
          }
          placeholder="Search records..."
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">
            Rows
          </label>

          <select
            value={pageSize}
            onChange={(e) =>
              onPageSizeChange(
                Number(e.target.value),
              )
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="text-sm text-slate-400 whitespace-nowrap">
          {totalRows.toLocaleString()} rows
        </div>
      </div>
    </div>
  );
}

export default SampleToolbar;