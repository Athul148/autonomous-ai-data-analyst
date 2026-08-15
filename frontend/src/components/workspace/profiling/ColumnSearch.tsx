import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { ColumnMetadata } from "../../../types/profile";

interface ColumnSearchProps {
  columns: ColumnMetadata[];
}

function ColumnSearch({ columns }: ColumnSearchProps) {
  const [query, setQuery] = useState("");

  const filteredColumns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return columns;
    }

    return columns.filter((column) =>
      column.name.toLowerCase().includes(normalizedQuery),
    );
  }, [columns, query]);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-white">
          Column Search
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Search columns and review datatype, missing values, and uniqueness.
        </p>
      </div>

      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <Search size={18} className="text-slate-500" />

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search columns..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/60 text-slate-400">
            <tr>
              <th className="px-5 py-3 text-left font-medium">
                Column
              </th>
              <th className="px-5 py-3 text-left font-medium">
                Datatype
              </th>
              <th className="px-5 py-3 text-right font-medium">
                Missing
              </th>
              <th className="px-5 py-3 text-right font-medium">
                Unique
              </th>
              <th className="px-5 py-3 text-right font-medium">
                Missing %
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {filteredColumns.map((column) => {
              const missingPercentage =
                columns.length > 0
                  ? (column.missing / Math.max(1, column.unique + column.missing)) *
                    100
                  : 0;

              return (
                <tr
                  key={column.name}
                  className="transition hover:bg-slate-900/40"
                >
                  <td className="px-5 py-4 font-medium text-white">
                    {column.name}
                  </td>

                  <td className="px-5 py-4 text-slate-300">
                    {column.dtype}
                  </td>

                  <td className="px-5 py-4 text-right text-slate-300">
                    {column.missing.toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4 text-right text-slate-300">
                    {column.unique.toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4 text-right text-slate-300">
                    {missingPercentage.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredColumns.length === 0 && (
        <p className="text-sm text-slate-500">
          No matching columns found.
        </p>
      )}
    </section>
  );
}

export default ColumnSearch;