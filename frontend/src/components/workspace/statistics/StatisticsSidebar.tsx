import { Search } from "lucide-react";
import { useMemo, useState } from "react";

interface StatisticsSidebarProps {
  columns: string[];
  selectedColumn: string;
  onSelect: (column: string) => void;
}

function StatisticsSidebar({
  columns,
  selectedColumn,
  onSelect,
}: StatisticsSidebarProps) {
  const [search, setSearch] = useState("");

  const filteredColumns = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return columns;
    }

    return columns.filter((column) =>
      column.toLowerCase().includes(query),
    );
  }, [columns, search]);

  return (
    <aside className="h-fit overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-4">
        <h3 className="font-semibold text-white">
          Numeric Columns
        </h3>

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
          <Search size={15} className="text-slate-500" />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search columns..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto p-2">
        {filteredColumns.map((column) => (
          <button
            key={column}
            type="button"
            onClick={() => onSelect(column)}
            className={[
              "w-full rounded-lg px-3 py-2.5 text-left text-sm transition",
              selectedColumn === column
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white",
            ].join(" ")}
          >
            {column}
          </button>
        ))}

        {filteredColumns.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-slate-500">
            No matching columns.
          </p>
        )}
      </div>
    </aside>
  );
}

export default StatisticsSidebar;