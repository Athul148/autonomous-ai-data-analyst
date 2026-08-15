import {
  ArrowDownRight,
  ArrowUpRight,
  Lightbulb,
} from "lucide-react";

import type { StrongCorrelation } from "../../../types/correlation";

interface CorrelationInsightsProps {
  correlations: StrongCorrelation[];
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

function CorrelationInsights({
  correlations,
}: CorrelationInsightsProps) {
  if (correlations.length === 0) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-800 p-2">
            <Lightbulb
              size={18}
              className="text-slate-400"
            />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Correlation Insights
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              No strong relationships were detected at the current threshold.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2">
            <Lightbulb
              size={18}
              className="text-blue-300"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">
              Correlation Insights
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Plain-language interpretation of the strongest relationships.
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-800">
        {correlations.map((item, index) => {
          const isPositive =
            item.direction === "positive";

          const Icon = isPositive
            ? ArrowUpRight
            : ArrowDownRight;

          return (
            <div
              key={`${item.feature_1}-${item.feature_2}-${index}`}
              className="px-6 py-5"
            >
              <div className="flex items-start gap-4">
                <div
                  className={[
                    "rounded-lg p-2",
                    isPositive
                      ? "bg-emerald-500/10"
                      : "bg-rose-500/10",
                  ].join(" ")}
                >
                  <Icon
                    size={18}
                    className={
                      isPositive
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm leading-6 text-slate-300">
                    <span className="font-semibold text-white">
                      {item.feature_1}
                    </span>{" "}
                    has a{" "}
                    <span className="font-semibold text-white">
                      {item.strength}
                    </span>{" "}
                    {item.direction} correlation of{" "}
                    <span className="font-semibold text-white">
                      {formatNumber(item.correlation)}
                    </span>{" "}
                    with{" "}
                    <span className="font-semibold text-white">
                      {item.feature_2}
                    </span>
                    .
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {isPositive
                      ? `As ${item.feature_1} increases, ${item.feature_2} tends to increase as well.`
                      : `As ${item.feature_1} increases, ${item.feature_2} tends to decrease.`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CorrelationInsights;