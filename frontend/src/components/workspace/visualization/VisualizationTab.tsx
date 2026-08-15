import {
  ChartNoAxesCombined,
  LoaderCircle,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getVisualizations,
} from "../../../api/visualization.api";

import type {
  VisualizationChart,
  VisualizationResponse,
} from "../../../types/visualization";

import VisualizationRenderer from "./VisualizationRenderer";


interface VisualizationTabProps {
  datasetId: number;
}


function VisualizationTab({
  datasetId,
}: VisualizationTabProps) {
  const [
    visualization,
    setVisualization,
  ] =
    useState<
      VisualizationResponse | null
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

    async function loadVisualizations() {
      setLoading(true);
      setError("");

      try {
        const response =
          await getVisualizations(
            datasetId,
          );

        if (!cancelled) {
          setVisualization(
            response,
          );
        }
      } catch {
        if (!cancelled) {
          setVisualization(
            null,
          );

          setError(
            "Unable to load visualizations.",
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

    loadVisualizations();

    return () => {
      cancelled = true;
    };
  }, [datasetId]);


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
            Loading visualizations...
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Preparing automatically selected charts.
          </p>
        </div>
      </section>
    );
  }


  if (
    error ||
    !visualization
  ) {
    return (
      <div className="rounded-2xl border border-red-900/60 bg-red-950/20 px-5 py-4 text-sm text-red-300">
        {error ||
          "Visualization data is unavailable."}
      </div>
    );
  }


  if (
    visualization.charts.length ===
    0
  ) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-14 text-center">
        <ChartNoAxesCombined
          size={24}
          className="mx-auto text-slate-600"
        />

        <h3 className="mt-4 text-sm font-semibold text-white">
          No visualizations available
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          No suitable chart combinations were detected
          for this dataset.
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
            <ChartNoAxesCombined
              size={15}
              className="text-blue-400"
            />

            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              Automated visuals
            </p>
          </div>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
            Visualizations
          </h2>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            Automatically generated charts based on
            column types, distributions and detected relationships.
          </p>
        </div>


        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
            Generated
          </p>

          <p className="mt-1 text-sm font-semibold text-white">
            {visualization.total_charts}{" "}
            {visualization.total_charts ===
            1
              ? "chart"
              : "charts"}
          </p>
        </div>
      </div>


      {/* Charts */}
      <div className="grid gap-5 xl:grid-cols-2">
        {visualization.charts.map(
          (
            chart:
              VisualizationChart,
          ) => (
            <article
              key={
                chart.id
              }
              className="group min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 transition duration-200 hover:border-slate-700 hover:bg-slate-900/60"
            >
              <div className="border-b border-slate-800/80 px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <ChartNoAxesCombined
                      size={15}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white">
                      {
                        chart.title
                      }
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {
                        chart.reason
                      }
                    </p>
                  </div>
                </div>
              </div>


              <div className="min-w-0 p-4">
                <VisualizationRenderer
                  chart={
                    chart
                  }
                />
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  );
}


export default VisualizationTab;