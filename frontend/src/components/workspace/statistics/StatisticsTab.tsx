// StatisticsTab.tsx

import {
  Activity,
  LoaderCircle,
  Sigma,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getColumnDistribution,
} from "../../../api/distribution.api";

import {
  getStatistics,
} from "../../../api/statistics.api";

import BoxPlotChart from "../../charts/BoxPlotChart";
import HistogramChart from "../../charts/HistogramChart";

import type {
  DistributionResponse,
} from "../../../types/distribution";

import type {
  ColumnStatistics,
  StatisticsResponse,
} from "../../../types/statistics";

import StatisticsSidebar from "./StatisticsSidebar";
import StatisticsSummary from "./StatisticsSummary";


interface StatisticsTabProps {
  datasetId: number;
}


function formatNumber(
  value: number,
): string {
  return value.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    },
  );
}


function StatisticsTab({
  datasetId,
}: StatisticsTabProps) {
  const [
    statistics,
    setStatistics,
  ] =
    useState<
      StatisticsResponse | null
    >(null);

  const [
    distribution,
    setDistribution,
  ] =
    useState<
      DistributionResponse | null
    >(null);

  const [
    selectedColumn,
    setSelectedColumn,
  ] =
    useState("");

  const [
    statisticsLoading,
    setStatisticsLoading,
  ] =
    useState(true);

  const [
    distributionLoading,
    setDistributionLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {
    let cancelled = false;

    async function loadStatistics() {
      setStatisticsLoading(true);
      setError("");

      try {
        const response =
          await getStatistics(
            datasetId,
          );

        if (cancelled) {
          return;
        }

        setStatistics(
          response,
        );

        const firstColumn =
          Object.keys(
            response,
          )[0] ?? "";

        setSelectedColumn(
          firstColumn,
        );
      } catch {
        if (!cancelled) {
          setError(
            "Unable to load statistics.",
          );
        }
      } finally {
        if (!cancelled) {
          setStatisticsLoading(
            false,
          );
        }
      }
    }

    loadStatistics();

    return () => {
      cancelled = true;
    };
  }, [datasetId]);


  useEffect(() => {
    if (!selectedColumn) {
      setDistribution(
        null,
      );

      return;
    }

    let cancelled = false;

    async function loadDistribution() {
      setDistributionLoading(
        true,
      );

      setDistribution(
        null,
      );

      setError("");

      try {
        const response =
          await getColumnDistribution(
            datasetId,
            selectedColumn,
            20,
          );

        if (!cancelled) {
          setDistribution(
            response,
          );
        }
      } catch {
        if (!cancelled) {
          setError(
            `Unable to load distribution for ${selectedColumn}.`,
          );
        }
      } finally {
        if (!cancelled) {
          setDistributionLoading(
            false,
          );
        }
      }
    }

    loadDistribution();

    return () => {
      cancelled = true;
    };
  }, [
    datasetId,
    selectedColumn,
  ]);


  const columns =
    useMemo(
      () =>
        Object.keys(
          statistics ?? {},
        ),
      [statistics],
    );


  const selectedStatistics:
    | ColumnStatistics
    | null =
    statistics &&
    selectedColumn
      ? statistics[
          selectedColumn
        ]
      : null;


const summary = useMemo<
  Record<string, string | number>
>(() => {
  if (!selectedStatistics) {
    return {} as Record<
      string,
      string | number
    >;
  }

      return {
        Count:
          formatNumber(
            selectedStatistics.count,
          ),

        Mean:
          formatNumber(
            selectedStatistics.mean,
          ),

        Median:
          formatNumber(
            selectedStatistics.median,
          ),

        Mode:
          formatNumber(
            selectedStatistics.mode,
          ),

        "Std Dev":
          formatNumber(
            selectedStatistics.std,
          ),

        Variance:
          formatNumber(
            selectedStatistics.variance,
          ),

        Min:
          formatNumber(
            selectedStatistics.min,
          ),

        Q1:
          formatNumber(
            selectedStatistics.q1,
          ),

        Q3:
          formatNumber(
            selectedStatistics.q3,
          ),

        Max:
          formatNumber(
            selectedStatistics.max,
          ),

        IQR:
          formatNumber(
            selectedStatistics.iqr,
          ),

        Skewness:
          formatNumber(
            selectedStatistics.skewness,
          ),

        Kurtosis:
          formatNumber(
            selectedStatistics.kurtosis,
          ),

        Missing:
          distribution
            ? formatNumber(
                distribution.missing,
              )
            : "—",

        Outliers:
          distribution
            ? `${formatNumber(
                distribution.outlier_count,
              )} (${formatNumber(
                distribution.outlier_percentage,
              )}%)`
            : "—",
      };
    }, [
      selectedStatistics,
      distribution,
    ]);


  if (statisticsLoading) {
    return (
      <section className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
            <LoaderCircle
              size={22}
              className="animate-spin text-blue-400"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-300">
            Loading descriptive statistics...
          </p>
        </div>
      </section>
    );
  }


  if (
    error &&
    !statistics
  ) {
    return (
      <div className="rounded-2xl border border-red-900/60 bg-red-950/20 px-5 py-4 text-sm text-red-300">
        {error}
      </div>
    );
  }


  if (
    !statistics ||
    columns.length === 0
  ) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-14 text-center">
        <Sigma
          size={24}
          className="mx-auto text-slate-600"
        />

        <h3 className="mt-4 text-sm font-semibold text-white">
          No numeric columns available
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Descriptive statistics require numeric data.
        </p>
      </div>
    );
  }


  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sigma
              size={15}
              className="text-blue-400"
            />

            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              Statistical analysis
            </p>
          </div>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
            Descriptive Statistics
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Inspect distribution shape, quartiles,
            variability and outlier behaviour.
          </p>
        </div>


        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
            Selected column
          </p>

          <p className="mt-1 max-w-[240px] truncate text-sm font-semibold text-white">
            {selectedColumn}
          </p>
        </div>
      </div>


      {error && (
        <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 px-4 py-3 text-sm text-amber-300">
          {error}
        </div>
      )}


      {/* Main analysis */}
      <div className="grid items-start gap-5 xl:grid-cols-[230px_minmax(0,1fr)_300px]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
          <StatisticsSidebar
            columns={
              columns
            }
            selectedColumn={
              selectedColumn
            }
            onSelect={
              setSelectedColumn
            }
          />
        </div>


        <div className="min-w-0 space-y-5">
          {distributionLoading && (
            <div className="flex h-96 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="text-center">
                <LoaderCircle
                  size={22}
                  className="mx-auto animate-spin text-blue-400"
                />

                <p className="mt-3 text-sm text-slate-400">
                  Loading {selectedColumn} distribution...
                </p>
              </div>
            </div>
          )}


          {!distributionLoading &&
            distribution && (
              <>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Activity
                      size={15}
                      className="text-blue-400"
                    />

                    <p className="text-xs font-semibold text-slate-300">
                      Distribution
                    </p>
                  </div>

                  <HistogramChart
                    title={`${selectedColumn} Distribution`}
                    counts={
                      distribution.histogram.counts
                    }
                    binEdges={
                      distribution.histogram.bin_edges
                    }
                  />
                </div>


                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                  <BoxPlotChart
                    title={`${selectedColumn} Box Plot`}
                    boxPlot={
                      distribution.box_plot
                    }
                  />
                </div>
              </>
            )}
        </div>


        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <StatisticsSummary
            stats={
              summary
            }
          />
        </div>
      </div>
    </section>
  );
}


export default StatisticsTab;