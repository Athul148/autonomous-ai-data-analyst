import {
  Columns3,
  Search,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import type {
  ColumnMetadata,
} from "../../../types/profile";


interface ColumnExplorerProps {
  columns: ColumnMetadata[];
}


function ColumnExplorer({
  columns,
}: ColumnExplorerProps) {
  const [
    search,
    setSearch,
  ] =
    useState("");


  const filteredColumns =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return columns;
      }

      return columns.filter(
        (column) =>
          column.name
            .toLowerCase()
            .includes(
              query,
            ),
      );
    }, [
      columns,
      search,
    ]);


  function badgeClass(
    dtype: string,
  ) {
    const type =
      dtype.toLowerCase();

    if (
      type.includes("int") ||
      type.includes("float")
    ) {
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    }

    if (
      type.includes("str") ||
      type.includes("object")
    ) {
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    }

    if (
      type.includes("date")
    ) {
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    }

    if (
      type.includes("bool")
    ) {
      return "border-violet-500/20 bg-violet-500/10 text-violet-300";
    }

    return "border-slate-700 bg-slate-800 text-slate-300";
  }


  return (
    <section>
      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Columns3
              size={15}
              className="text-blue-400"
            />

            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              Schema explorer
            </p>
          </div>

          <h2 className="mt-2 text-lg font-semibold text-white">
            Column Explorer
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Inspect column types,
            missing values and
            cardinality.
          </p>
        </div>


        <div className="relative w-full lg:max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <input
            value={search}
            onChange={(
              event,
            ) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search columns..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-600 transition hover:bg-slate-800 hover:text-white"
              aria-label="Clear column search"
            >
              <X
                size={14}
              />
            </button>
          )}
        </div>
      </div>


      <div className="mt-4">
        <div className="hidden grid-cols-[minmax(220px,1fr)_140px_130px_130px] gap-4 border-b border-slate-800 px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 md:grid">
          <span>
            Column
          </span>

          <span>
            Type
          </span>

          <span className="text-right">
            Missing
          </span>

          <span className="text-right">
            Unique
          </span>
        </div>


        <div className="divide-y divide-slate-800/70">
          {filteredColumns.map(
            (
              column,
            ) => (
              <div
                key={
                  column.name
                }
                className="grid gap-3 px-3 py-4 transition hover:bg-slate-800/20 md:grid-cols-[minmax(220px,1fr)_140px_130px_130px] md:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {
                      column.name
                    }
                  </p>
                </div>


                <div>
                  <span
                    className={[
                      "inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-semibold",
                      badgeClass(
                        column.dtype,
                      ),
                    ].join(
                      " ",
                    )}
                  >
                    {
                      column.dtype
                    }
                  </span>
                </div>


                <div className="flex items-center justify-between md:block md:text-right">
                  <span className="text-xs text-slate-600 md:hidden">
                    Missing
                  </span>

                  <span className="text-sm font-medium text-slate-300">
                    {column.missing.toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>


                <div className="flex items-center justify-between md:block md:text-right">
                  <span className="text-xs text-slate-600 md:hidden">
                    Unique
                  </span>

                  <span className="text-sm font-medium text-slate-300">
                    {column.unique.toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
              </div>
            ),
          )}
        </div>


        {filteredColumns.length ===
          0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500">
              No columns match
              your search.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}


export default ColumnExplorer;