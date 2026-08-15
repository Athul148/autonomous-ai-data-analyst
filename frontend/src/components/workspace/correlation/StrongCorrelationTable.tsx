import type { StrongCorrelation } from "../../../types/correlation";

interface StrongCorrelationTableProps {
  correlations: StrongCorrelation[];
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

function formatLabel(value: string): string {
  return value
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function getDirectionClasses(
  direction: StrongCorrelation["direction"],
): string {
  return direction === "positive"
    ? "bg-emerald-500/10 text-emerald-300"
    : "bg-rose-500/10 text-rose-300";
}

function StrongCorrelationTable({
  correlations,
}: StrongCorrelationTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Strong Relationships
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Variable pairs that passed the configured correlation threshold.
            </p>
          </div>

          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
            {correlations.length}
          </span>
        </div>
      </div>

      {correlations.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-slate-400">
            No strong correlations were detected.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/40">
              <tr className="border-b border-slate-800">
                <th className="px-6 py-3 text-left font-medium text-slate-400">
                  Feature 1
                </th>

                <th className="px-6 py-3 text-left font-medium text-slate-400">
                  Feature 2
                </th>

                <th className="px-6 py-3 text-right font-medium text-slate-400">
                  Correlation
                </th>

                <th className="px-6 py-3 text-left font-medium text-slate-400">
                  Strength
                </th>

                <th className="px-6 py-3 text-left font-medium text-slate-400">
                  Direction
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {correlations.map((item, index) => (
                <tr
                  key={`${item.feature_1}-${item.feature_2}-${index}`}
                  className="transition hover:bg-slate-800/40"
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {item.feature_1}
                  </td>

                  <td className="px-6 py-4 font-medium text-white">
                    {item.feature_2}
                  </td>

                  <td className="px-6 py-4 text-right font-semibold text-slate-200">
                    {formatNumber(item.correlation)}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                      {formatLabel(item.strength)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getDirectionClasses(
                        item.direction,
                      )}`}
                    >
                      {formatLabel(item.direction)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default StrongCorrelationTable;