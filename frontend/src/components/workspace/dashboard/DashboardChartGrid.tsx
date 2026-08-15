import type {
  DashboardChart as DashboardChartType,
} from "../../../types/dashboard";

import DashboardChart from "./DashboardChart";


interface DashboardChartGridProps {
  charts: DashboardChartType[];
}


function DashboardChartGrid({
  charts,
}: DashboardChartGridProps) {
  if (charts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
        No suitable dashboard visualizations were generated.
      </div>
    );
  }

  const primaryChart =
    charts[0] ?? null;

  const secondaryChart =
    charts[1] ?? null;

  const supportingCharts =
    charts.slice(2, 6);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
            Visual Analysis
          </p>

          <h3 className="mt-1 text-xl font-semibold text-white">
            Executive Visual Summary
          </h3>

          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Key distributions and relationships selected automatically
            from the current dataset.
          </p>
        </div>

        <div className="rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-400">
          {charts.length} visuals
        </div>
      </div>

      {(primaryChart || secondaryChart) && (
        <div className="grid gap-4 xl:grid-cols-12">
          {primaryChart && (
            <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 xl:col-span-7">
              <div className="flex items-start justify-between gap-4 px-5 pb-1 pt-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-300">
                    Primary Analysis
                  </p>

                  <h4 className="mt-1 text-base font-semibold text-white">
                    {primaryChart.title}
                  </h4>

                  {primaryChart.reason && (
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {primaryChart.reason}
                    </p>
                  )}
                </div>

                <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-300">
                  Featured
                </div>
              </div>

              <div className="min-w-0 px-3 pb-3">
                <DashboardChart
                  chart={primaryChart}
                />
              </div>
            </article>
          )}

          {secondaryChart && (
            <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 xl:col-span-5">
              <div className="px-5 pb-1 pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300">
                  Breakdown
                </p>

                <h4 className="mt-1 text-base font-semibold text-white">
                  {secondaryChart.title}
                </h4>

                {secondaryChart.reason && (
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {secondaryChart.reason}
                  </p>
                )}
              </div>

              <div className="min-w-0 px-3 pb-3">
                <DashboardChart
                  chart={secondaryChart}
                  compact
                />
              </div>
            </article>
          )}
        </div>
      )}

      {supportingCharts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
          {supportingCharts.map(
            (chart, index) => {
              const spanClass =
                index === 0 ||
                index === 3
                  ? "xl:col-span-7"
                  : "xl:col-span-5";

              return (
                <article
                  key={chart.id}
                  className={[
                    "min-w-0 overflow-hidden rounded-2xl",
                    "border border-slate-800 bg-slate-900/90",
                    spanClass,
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-4 px-5 pb-1 pt-5">
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {chart.title}
                      </h4>

                      {chart.reason && (
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {chart.reason}
                        </p>
                      )}
                    </div>

                    <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Visual
                    </span>
                  </div>

                  <div className="min-w-0 px-3 pb-3">
                    <DashboardChart
                      chart={chart}
                      compact
                    />
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}


export default DashboardChartGrid;