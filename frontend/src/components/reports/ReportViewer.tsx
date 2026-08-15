import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Database,
  FileSearch,
  Lightbulb,
  Rows3,
  ShieldCheck,
} from "lucide-react";
import { useMemo } from "react";
import type { ElementType } from "react";

import type {
  ReportFinding,
  ReportSection,
  StructuredAIReport,
} from "../../types/report";

interface ReportViewerProps {
  report: StructuredAIReport;
  datasetName: string;
  savedReportId?: number | null;
}

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  icon: ElementType;
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {helper}
          </p>
        </div>

        <div className="rounded-lg bg-blue-500/10 p-2.5">
          <Icon
            size={20}
            className="text-blue-300"
          />
        </div>
      </div>
    </div>
  );
}

function getFindingClasses(
  direction: ReportFinding["direction"],
): string {
  if (direction === "positive") {
    return "border-blue-800/60 bg-blue-950/20";
  }

  if (direction === "negative") {
    return "border-violet-800/60 bg-violet-950/20";
  }

  return "border-slate-800 bg-slate-900";
}

function FindingCard({
  finding,
}: {
  finding: ReportFinding;
}) {
  const isPositive =
    finding.direction === "positive";

  const isNegative =
    finding.direction === "negative";

  const Icon = isPositive
    ? ArrowUpRight
    : isNegative
      ? ArrowDownRight
      : BarChart3;

  return (
    <article
      className={[
        "rounded-xl border p-5",
        getFindingClasses(
          finding.direction,
        ),
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">
            {finding.title}
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {finding.value}
          </p>
        </div>

        <div className="rounded-lg bg-slate-950/40 p-2">
          <Icon
            size={20}
            className={
              isPositive
                ? "text-blue-300"
                : isNegative
                  ? "text-violet-300"
                  : "text-slate-300"
            }
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {finding.strength && (
          <span className="rounded-full bg-slate-950/40 px-2.5 py-1 text-xs font-medium text-slate-300">
            {finding.strength}
          </span>
        )}

        {finding.direction && (
          <span className="rounded-full bg-slate-950/40 px-2.5 py-1 text-xs font-medium capitalize text-slate-300">
            {finding.direction}
          </span>
        )}
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">
        {finding.description}
      </p>
    </article>
  );
}

function ReportDetailSection({
  section,
  icon: Icon,
}: {
  section: ReportSection;
  icon: ElementType;
}) {
  const items = Array.isArray(
    section.items,
  )
    ? section.items
    : [];

  return (
    <details className="group overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-800 p-2">
            <Icon
              size={18}
              className="text-slate-300"
            />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              {section.title}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {items.length} insights
            </p>
          </div>
        </div>

        <span className="text-sm text-slate-500 transition group-open:rotate-180">
          ▼
        </span>
      </summary>

      <div className="border-t border-slate-800 px-6 py-5">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">
            No detailed insights were generated for this
            section.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map(
              (item, index) => (
                <li
                  key={`${section.title}-${index}`}
                  className="flex gap-3 text-sm leading-6 text-slate-300"
                >
                  <CheckCircle2
                    size={16}
                    className="mt-1 shrink-0 text-emerald-400"
                  />

                  <span>{item}</span>
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    </details>
  );
}

function ReportViewer({
  report,
  datasetName,
  savedReportId = null,
}: ReportViewerProps) {
  const sortedRecommendations =
    useMemo(
      () =>
        [
          ...(report.recommendations ?? []),
        ].sort(
          (first, second) =>
            first.priority -
            second.priority,
        ),
      [report],
    );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-blue-900/60 bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-900">
        <div className="px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
                Executive summary
              </p>

              <h3 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">
                {report.summary.headline}
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                {report.summary.description}
              </p>
            </div>

            <div className="shrink-0 rounded-lg border border-slate-700 bg-slate-950/40 px-4 py-3">
              <p className="text-xs text-slate-500">
                Dataset
              </p>

              <p className="mt-1 max-w-xs truncate text-sm font-semibold text-white">
                {datasetName}
              </p>

              {savedReportId !== null && (
                <p className="mt-2 text-xs text-emerald-400">
                  Saved report #{savedReportId}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Records"
          value={report.metrics.rows.toLocaleString(
            "en-IN",
          )}
          helper={`${report.metrics.columns} columns`}
          icon={Rows3}
        />

        <MetricCard
          label="Quality Score"
          value={`${report.metrics.quality_score}%`}
          helper="Overall dataset health"
          icon={ShieldCheck}
        />

        <MetricCard
          label="Missing Values"
          value={report.metrics.missing_values.toLocaleString(
            "en-IN",
          )}
          helper="Across the full dataset"
          icon={FileSearch}
        />

        <MetricCard
          label="Duplicate Rows"
          value={report.metrics.duplicate_rows.toLocaleString(
            "en-IN",
          )}
          helper="Detected duplicates"
          icon={Database}
        />
      </div>

      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-white">
            Key Findings
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            The most important observations from the
            current analysis.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {report.key_findings.map(
            (finding, index) => (
              <FindingCard
                key={`${finding.title}-${index}`}
                finding={finding}
              />
            ),
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Lightbulb
                size={18}
                className="text-amber-300"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                Recommended Priorities
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Ranked next steps based on the
                detected evidence.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {sortedRecommendations.map(
            (recommendation) => (
              <div
                key={`${recommendation.priority}-${recommendation.title}`}
                className="flex gap-4 px-6 py-5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-sm font-bold text-blue-300">
                  {recommendation.priority}
                </div>

                <div>
                  <h4 className="font-semibold text-white">
                    {recommendation.title}
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {recommendation.description}
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-xl font-semibold text-white">
            Detailed Analysis
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Expand any section for supporting
            evidence and preparation guidance.
          </p>
        </div>

        <ReportDetailSection
          section={report.data_quality}
          icon={ShieldCheck}
        />

        <ReportDetailSection
          section={
            report.statistical_insights
          }
          icon={BarChart3}
        />

        <ReportDetailSection
          section={report.relationships}
          icon={ClipboardList}
        />

        <ReportDetailSection
          section={
            report.distribution_insights
          }
          icon={FileSearch}
        />

        <ReportDetailSection
          section={report.data_preparation}
          icon={Database}
        />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-lg font-semibold text-white">
          Conclusion
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          {report.conclusion}
        </p>
      </section>
    </div>
  );
}

export default ReportViewer;