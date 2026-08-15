import {
  Filter,
  RotateCcw,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import type {
  DashboardFilter,
  DashboardFilterValue,
} from "../../../types/dashboard";


interface DashboardFiltersProps {
  filters: DashboardFilter[];
}


interface ActiveFilterState {
  [key: string]:
    | DashboardFilterValue
    | {
        minimum: number;
        maximum: number;
      };
}


function DashboardFilters({
  filters,
}: DashboardFiltersProps) {
  const [
    activeFilters,
    setActiveFilters,
  ] =
    useState<ActiveFilterState>({});

  const activeCount = useMemo(
    () =>
      Object.keys(
        activeFilters,
      ).length,
    [activeFilters],
  );

  if (filters.length === 0) {
    return null;
  }

  function handleCategoricalChange(
    filterId: string,
    value: DashboardFilterValue,
  ) {
    setActiveFilters(
      (current) => {
        const next = {
          ...current,
        };

        if (
          value === ""
        ) {
          delete next[
            filterId
          ];
        } else {
          next[
            filterId
          ] = value;
        }

        return next;
      },
    );

    // We will connect this state to the backend
    // filtering endpoint later.
    console.log(
      "Dashboard categorical filter:",
      filterId,
      value,
    );
  }

  function handleRangeChange(
    filter: DashboardFilter,
    minimum: number,
    maximum: number,
  ) {
    if (
      filter.minimum === null ||
      filter.maximum === null
    ) {
      return;
    }

    const boundedMinimum =
      Math.max(
        filter.minimum,
        Math.min(
          minimum,
          maximum,
        ),
      );

    const boundedMaximum =
      Math.min(
        filter.maximum,
        Math.max(
          maximum,
          minimum,
        ),
      );

    const isDefault =
      boundedMinimum ===
        filter.minimum &&
      boundedMaximum ===
        filter.maximum;

    setActiveFilters(
      (current) => {
        const next = {
          ...current,
        };

        if (isDefault) {
          delete next[
            filter.id
          ];
        } else {
          next[
            filter.id
          ] = {
            minimum:
              boundedMinimum,
            maximum:
              boundedMaximum,
          };
        }

        return next;
      },
    );

    console.log(
      "Dashboard range filter:",
      filter.id,
      boundedMinimum,
      boundedMaximum,
    );
  }

  function resetFilters() {
    setActiveFilters({});
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg shadow-black/10">
      <div className="flex flex-col gap-4 border-b border-slate-800 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
            <Filter
              size={16}
              className="text-blue-300"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Dashboard Filters
              </h3>

              {activeCount > 0 && (
                <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                  {activeCount} active
                </span>
              )}
            </div>

            <p className="mt-0.5 text-xs text-slate-500">
              Slice the report by key dimensions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            resetFilters
          }
          disabled={
            activeCount === 0
          }
          className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 xl:self-auto"
        >
          <RotateCcw
            size={13}
          />

          Reset Filters
        </button>
      </div>

      <div className="grid gap-px bg-slate-800 md:grid-cols-2 xl:grid-cols-4">
        {filters.map(
          (filter) => {
            if (
              filter.filter_type ===
              "categorical"
            ) {
              const selectedValue =
                activeFilters[
                  filter.id
                ];

              return (
                <div
                  key={
                    filter.id
                  }
                  className="bg-slate-900 px-5 py-4"
                >
                  <label
                    htmlFor={
                      filter.id
                    }
                    className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500"
                  >
                    {
                      filter.title
                    }
                  </label>

                  <select
                    id={
                      filter.id
                    }
                    value={
                      typeof selectedValue ===
                        "string" ||
                      typeof selectedValue ===
                        "number" ||
                      typeof selectedValue ===
                        "boolean"
                        ? String(
                            selectedValue,
                          )
                        : ""
                    }
                    onChange={(
                      event,
                    ) =>
                      handleCategoricalChange(
                        filter.id,
                        event.target
                          .value,
                      )
                    }
                    className="mt-2 w-full cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-white outline-none"
                  >
                    <option
                      value=""
                      className="bg-slate-900"
                    >
                      All
                    </option>

                    {filter.options.map(
                      (
                        option,
                      ) => (
                        <option
                          key={String(
                            option.value,
                          )}
                          value={String(
                            option.value,
                          )}
                          className="bg-slate-900"
                        >
                          {
                            option.label
                          }
                        </option>
                      ),
                    )}
                  </select>
                </div>
              );
            }

            if (
              filter.filter_type ===
                "numeric_range" &&
              filter.minimum !==
                null &&
              filter.maximum !==
                null
            ) {
              const selected =
                activeFilters[
                  filter.id
                ];

              const range =
                typeof selected ===
                  "object" &&
                selected !== null &&
                "minimum" in
                  selected &&
                "maximum" in
                  selected
                  ? selected
                  : {
                      minimum:
                        filter.minimum,
                      maximum:
                        filter.maximum,
                    };

              return (
                <div
                  key={
                    filter.id
                  }
                  className="bg-slate-900 px-5 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {
                        filter.title
                      }
                    </p>

                    <span className="text-[10px] text-slate-600">
                      {
                        filter.minimum
                      }
                      {" — "}
                      {
                        filter.maximum
                      }
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      value={
                        range.minimum
                      }
                      min={
                        filter.minimum
                      }
                      max={
                        range.maximum
                      }
                      onChange={(
                        event,
                      ) =>
                        handleRangeChange(
                          filter,
                          Number(
                            event
                              .target
                              .value,
                          ),
                          range.maximum,
                        )
                      }
                      className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm font-medium text-white outline-none focus:border-blue-500"
                    />

                    <span className="text-xs text-slate-600">
                      to
                    </span>

                    <input
                      type="number"
                      value={
                        range.maximum
                      }
                      min={
                        range.minimum
                      }
                      max={
                        filter.maximum
                      }
                      onChange={(
                        event,
                      ) =>
                        handleRangeChange(
                          filter,
                          range.minimum,
                          Number(
                            event
                              .target
                              .value,
                          ),
                        )
                      }
                      className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm font-medium text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              );
            }

            return null;
          },
        )}
      </div>
    </section>
  );
}


export default DashboardFilters;