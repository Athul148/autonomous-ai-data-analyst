import {
  CheckCircle2,
  CircleAlert,
  CopyX,
  Gauge,
  HardDrive,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getQuality,
} from "../../../api/quality.api";

import type {
  QualityResponse,
} from "../../../types/quality";


interface QualityTabProps {
  datasetId: number;
}


function formatMemory(
  bytes: number,
) {
  const mb =
    bytes /
    (1024 * 1024);

  if (mb < 1024) {
    return `${mb.toFixed(
      2,
    )} MB`;
  }

  return `${(
    mb / 1024
  ).toFixed(2)} GB`;
}


function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: typeof Gauge;
}) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/30 p-5 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
            {title}
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <Icon
            size={17}
          />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-600">
        {subtitle}
      </p>
    </article>
  );
}


function QualityTab({
  datasetId,
}: QualityTabProps) {
  const [
    quality,
    setQuality,
  ] =
    useState<
      QualityResponse | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response =
          await getQuality(
            datasetId,
          );

        if (!cancelled) {
          setQuality(
            response,
          );
        }
      } catch {
        if (!cancelled) {
          setQuality(
            null,
          );

          setError(
            "Unable to load quality analysis.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(
            false,
          );
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [datasetId]);


  if (loading) {
    return (
      <section className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={24}
            className="mx-auto animate-spin text-blue-400"
          />

          <p className="mt-4 text-sm text-slate-400">
            Loading quality analysis...
          </p>
        </div>
      </section>
    );
  }


  if (
    error ||
    !quality
  ) {
    return (
      <div className="rounded-2xl border border-red-900/60 bg-red-950/20 px-5 py-4 text-sm text-red-300">
        {error ||
          "Unable to load quality analysis."}
      </div>
    );
  }


  return (
    <section className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <ShieldCheck
            size={17}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Dataset Quality
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Evaluate dataset health and identify issues
            that may affect downstream analysis.
          </p>
        </div>
      </div>


      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Quality Score"
          value={`${quality.quality_score}%`}
          subtitle="Overall dataset health"
          icon={Gauge}
        />

        <MetricCard
          title="Missing Values"
          value={quality.missing_values.toLocaleString(
            "en-IN",
          )}
          subtitle="Cells containing missing data"
          icon={CircleAlert}
        />

        <MetricCard
          title="Duplicate Rows"
          value={quality.duplicate_rows.toLocaleString(
            "en-IN",
          )}
          subtitle="Repeated records detected"
          icon={CopyX}
        />

        <MetricCard
          title="Memory Usage"
          value={formatMemory(
            quality.memory_usage,
          )}
          subtitle="Approximate dataset memory footprint"
          icon={HardDrive}
        />
      </div>


      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              Dataset Warnings
            </h3>

            <p className="mt-1 text-xs text-slate-600">
              Important quality observations detected automatically.
            </p>
          </div>

          <span className="rounded-lg bg-slate-950/60 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {
              quality.warnings
                .length
            }{" "}
            alerts
          </span>
        </div>


        {quality.warnings.length ===
        0 ? (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <CheckCircle2
              size={17}
              className="text-emerald-400"
            />

            <p className="text-sm font-medium text-emerald-300">
              No quality issues detected.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {quality.warnings.map(
              (
                warning,
              ) => (
                <div
                  key={
                    warning
                  }
                  className="flex items-start gap-3 rounded-xl border border-amber-900/60 bg-amber-950/20 px-4 py-3"
                >
                  <CircleAlert
                    size={16}
                    className="mt-0.5 shrink-0 text-amber-400"
                  />

                  <p className="text-sm leading-6 text-amber-200">
                    {
                      warning
                    }
                  </p>
                </div>
              ),
            )}
          </div>
        )}
      </div>


      <div className="grid gap-4 lg:grid-cols-3">
        {[
          {
            label:
              "Constant Columns",
            items:
              quality.constant_columns,
          },
          {
            label:
              "Empty Columns",
            items:
              quality.empty_columns,
          },
          {
            label:
              "High Cardinality",
            items:
              quality.high_cardinality_columns,
          },
        ].map(
          ({
            label,
            items,
          }) => (
            <article
              key={
                label
              }
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  {label}
                </h3>

                <span className="rounded-lg bg-slate-950/60 px-2 py-1 text-[10px] font-semibold text-slate-500">
                  {
                    items.length
                  }
                </span>
              </div>

              {items.length ===
              0 ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2
                    size={14}
                  />

                  None detected
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {items.map(
                    (
                      column,
                    ) => (
                      <span
                        key={
                          column
                        }
                        className="rounded-lg border border-slate-700 bg-slate-950/40 px-2.5 py-1.5 text-xs text-slate-300"
                      >
                        {
                          column
                        }
                      </span>
                    ),
                  )}
                </div>
              )}
            </article>
          ),
        )}
      </div>
    </section>
  );
}


export default QualityTab;