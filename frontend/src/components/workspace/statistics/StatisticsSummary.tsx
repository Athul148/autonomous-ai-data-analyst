interface StatisticsSummaryProps {
  stats: Record<string, string | number>;
}

function StatisticsSummary({
  stats,
}: StatisticsSummaryProps) {
  return (
    <section className="h-fit overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-4 py-3">
        <h3 className="font-semibold text-white">
          Statistical Summary
        </h3>
      </div>

      <dl className="divide-y divide-slate-800">
        {Object.entries(stats).map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <dt className="text-sm text-slate-400">
              {label}
            </dt>

            <dd className="text-right text-sm font-semibold text-white">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default StatisticsSummary;