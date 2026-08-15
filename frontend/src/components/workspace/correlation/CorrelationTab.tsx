import {
  BarChart3,
  LoaderCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCorrelation,
} from "../../../api/correlation.api";

import type {
  CorrelationResponse,
  StrongCorrelation,
} from "../../../types/correlation";

import CorrelationHeatmap from "./CorrelationHeatmap";
import CorrelationInsights from "./CorrelationInsights";
import CorrelationSummary from "./CorrelationSummary";
import StrongCorrelationTable from "./StrongCorrelationTable";


interface CorrelationTabProps {
  datasetId: number;
}


function CorrelationTab({
  datasetId,
}: CorrelationTabProps) {
  const [
    correlation,
    setCorrelation,
  ] =
    useState<
      CorrelationResponse | null
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

    async function loadCorrelation() {
      setLoading(true);
      setError("");

      try {
        const response =
          await getCorrelation(
            datasetId,
          );

        if (!cancelled) {
          setCorrelation(
            response,
          );
        }
      } catch {
        if (!cancelled) {
          setCorrelation(
            null,
          );

          setError(
            "Unable to load correlation analysis.",
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

    loadCorrelation();

    return () => {
      cancelled = true;
    };
  }, [datasetId]);


  const summary =
    useMemo(() => {
      const strong =
        correlation
          ?.strong_correlations ??
        [];

      return {
        totalVariables:
          Object.keys(
            correlation
              ?.correlation_matrix ??
              {},
          ).length,

        strongCorrelations:
          strong.length,

        positiveCorrelations:
          strong.filter(
            (
              item:
                StrongCorrelation,
            ) =>
              item.direction ===
              "positive",
          ).length,

        negativeCorrelations:
          strong.filter(
            (
              item:
                StrongCorrelation,
            ) =>
              item.direction ===
              "negative",
          ).length,
      };
    }, [correlation]);


  if (loading) {
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
            Loading correlation analysis...
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Calculating relationships between numeric variables.
          </p>
        </div>
      </section>
    );
  }


  if (
    error ||
    !correlation
  ) {
    return (
      <div className="rounded-2xl border border-red-900/60 bg-red-950/20 px-5 py-4 text-sm text-red-300">
        {error ||
          "Correlation results are unavailable."}
      </div>
    );
  }


  const hasMatrix =
    Object.keys(
      correlation
        .correlation_matrix,
    ).length > 0;


  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <BarChart3
            size={17}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Correlation Analysis
          </h2>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            Explore relationships between numeric variables
            and identify the strongest positive and negative associations.
          </p>
        </div>
      </div>


      {/* Summary */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <CorrelationSummary
          totalVariables={
            summary.totalVariables
          }
          strongCorrelations={
            summary.strongCorrelations
          }
          positiveCorrelations={
            summary.positiveCorrelations
          }
          negativeCorrelations={
            summary.negativeCorrelations
          }
        />
      </div>


      {/* Heatmap */}
      {hasMatrix ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              Correlation matrix
            </p>

            <h3 className="mt-1 text-base font-semibold text-white">
              Relationship Heatmap
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Compare the strength and direction of relationships
              between all numeric variables.
            </p>
          </div>

          <CorrelationHeatmap
            matrix={
              correlation
                .correlation_matrix
            }
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-14 text-center">
          <BarChart3
            size={24}
            className="mx-auto text-slate-600"
          />

          <h3 className="mt-4 text-sm font-semibold text-white">
            Correlation matrix unavailable
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            At least two numeric columns are required
            to calculate correlations.
          </p>
        </div>
      )}


      {/* Strong correlations */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <StrongCorrelationTable
          correlations={
            correlation
              .strong_correlations
          }
        />
      </div>


      {/* Insights */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <CorrelationInsights
          correlations={
            correlation
              .strong_correlations
          }
        />
      </div>
    </section>
  );
}


export default CorrelationTab;