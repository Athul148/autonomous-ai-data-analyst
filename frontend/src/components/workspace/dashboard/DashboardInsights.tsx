import {
  Activity,
  BarChart3,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Sigma,
} from "lucide-react";

import type {
  DashboardInsight,
} from "../../../types/dashboard";


interface DashboardInsightsProps {
  insights: DashboardInsight[];
}


function getInsightIcon(
  category: DashboardInsight["category"],
) {
  if (category === "quality") {
    return CheckCircle2;
  }

  if (category === "relationship") {
    return Activity;
  }

  if (category === "statistics") {
    return Sigma;
  }

  if (category === "distribution") {
    return BarChart3;
  }

  return Lightbulb;
}


function isRedundantEncodedInsight(
  insight: DashboardInsight,
): boolean {
  const text = [
    insight.title,
    insight.description,
  ]
    .join(" ")
    .toLowerCase();

  const encodedPatterns = [
    "gender__female",
    "gender__male",
    "gender_female",
    "gender_male",

    "contract length__annual",
    "contract length__monthly",
    "contract length__quarterly",

    "contract_length__annual",
    "contract_length__monthly",
    "contract_length__quarterly",

    "subscription type__basic",
    "subscription type__premium",
    "subscription type__standard",

    "subscription_type__basic",
    "subscription_type__premium",
    "subscription_type__standard",
  ];

  const matches =
    encodedPatterns.filter(
      (pattern) =>
        text.includes(pattern),
    );

  return matches.length >= 2;
}


function DashboardInsights({
  insights,
}: DashboardInsightsProps) {
  const usefulInsights =
    insights
      .filter(
        (insight) =>
          !isRedundantEncodedInsight(
            insight,
          ),
      )
      .slice(0, 4);

  if (
    usefulInsights.length === 0
  ) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950">
      <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
            <Sparkles
              size={17}
              className="text-violet-300"
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300">
              AI Intelligence
            </p>

            <h3 className="mt-0.5 text-sm font-semibold text-white">
              Executive Insights
            </h3>
          </div>
        </div>

        <span className="text-xs text-slate-500">
          Automatically derived from analysis
        </span>
      </div>

      <div
        className={[
          "grid gap-px bg-slate-800",
          usefulInsights.length === 1
            ? "grid-cols-1"
            : usefulInsights.length === 2
              ? "md:grid-cols-2"
              : "md:grid-cols-2 xl:grid-cols-4",
        ].join(" ")}
      >
        {usefulInsights.map(
          (insight, index) => {
            const Icon =
              getInsightIcon(
                insight.category,
              );

            return (
              <article
                key={insight.id}
                className="group relative bg-slate-900 px-5 py-5 transition hover:bg-slate-900/70"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                    <Icon
                      size={15}
                      className="text-blue-300"
                    />
                  </div>

                  <span className="text-[10px] font-semibold text-slate-600">
                    0{index + 1}
                  </span>
                </div>

                {insight.value && (
                  <p className="mt-5 text-2xl font-bold tracking-tight text-white">
                    {insight.value}
                  </p>
                )}

                <h4
                  className={[
                    "font-semibold text-slate-100",
                    insight.value
                      ? "mt-2 text-sm"
                      : "mt-5 text-base",
                  ].join(" ")}
                >
                  {insight.title}
                </h4>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {insight.description}
                </p>

                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-500 transition-all duration-300 group-hover:w-full" />
              </article>
            );
          },
        )}
      </div>
    </section>
  );
}


export default DashboardInsights;