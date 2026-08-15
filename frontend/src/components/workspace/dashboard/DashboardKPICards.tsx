import {
  Activity,
  Database,
  Gauge,
  Sigma,
  TrendingUp,
} from "lucide-react";

import type {
  DashboardKPI,
} from "../../../types/dashboard";


interface DashboardKPICardsProps {
  kpis: DashboardKPI[];
}


function getKPIIcon(
  metric: string | null,
) {
  if (metric === "rows") {
    return Database;
  }

  if (metric === "columns") {
    return Sigma;
  }

  if (metric === "mean") {
    return Gauge;
  }

  return Activity;
}


function formatDisplayValue(
  value: string,
): string {
  const numericValue = Number(
    value.replace(/,/g, "").replace("%", ""),
  );

  if (
    Number.isNaN(numericValue) ||
    value.includes("%")
  ) {
    return value;
  }

  if (numericValue >= 1_000_000) {
    return `${(
      numericValue / 1_000_000
    ).toFixed(1)}M`;
  }

  if (numericValue >= 100_000) {
    return `${(
      numericValue / 1_000
    ).toFixed(1)}K`;
  }

  return value;
}


function DashboardKPICards({
  kpis,
}: DashboardKPICardsProps) {
  if (kpis.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-2 shadow-lg shadow-black/10">
      <div
        className={[
          "grid gap-2",
          kpis.length >= 4
            ? "md:grid-cols-2 xl:grid-cols-4"
            : "md:grid-cols-2 xl:grid-cols-3",
        ].join(" ")}
      >
        {kpis.map(
          (kpi, index) => {
            const Icon = getKPIIcon(
              kpi.metric,
            );

            const displayValue =
              formatDisplayValue(
                kpi.value,
              );

            const isPrimary =
              index === 0;

            return (
              <article
                key={kpi.id}
                className={[
                  "group relative overflow-hidden rounded-xl",
                  "border border-slate-800/80",
                  "bg-slate-950/60 px-5 py-4",
                  "transition duration-200",
                  "hover:border-slate-700 hover:bg-slate-900/80",
                  isPrimary
                    ? "ring-1 ring-blue-500/20"
                    : "",
                ].join(" ")}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {kpi.title}
                      </p>

                      {isPrimary && (
                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-blue-300">
                          Primary
                        </span>
                      )}
                    </div>

                    <p className="mt-3 break-words text-[30px] font-bold leading-none tracking-tight text-white">
                      {displayValue}
                    </p>

                    {kpi.subtitle && (
                      <p className="mt-2 truncate text-xs text-slate-500">
                        {kpi.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/10 bg-blue-500/10">
                    <Icon
                      size={18}
                      className="text-blue-300"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                    Dashboard Metric
                  </span>

                  <TrendingUp
                    size={13}
                    className="text-slate-600"
                  />
                </div>
              </article>
            );
          },
        )}
      </div>
    </section>
  );
}


export default DashboardKPICards;