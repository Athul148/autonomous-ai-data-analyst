import {
  ArrowLeft,
  BarChart3,
  Database,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import apiClient from "../../api/client";

import type {
  Dataset,
} from "../../types/dataset";

import type {
  DashboardDesign,
} from "../../types/dashboardDesign";

import DashboardDesignGallery from "../../components/dashboard-design/DashboardDesignGallery";
import FullDashboardCanvas from "../../components/dashboard-design/FullDashboardCanvas";


function AnalyticsDashboard() {
  const [
    datasets,
    setDatasets,
  ] =
    useState<Dataset[]>([]);

  const [
    selectedDatasetId,
    setSelectedDatasetId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    selectedDesign,
    setSelectedDesign,
  ] =
    useState<
      DashboardDesign | null
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

    async function loadDatasets() {
      setLoading(true);
      setError("");

      try {
        const response =
          await apiClient.get<
            Dataset[]
          >(
            "/datasets",
          );

        if (cancelled) {
          return;
        }

        setDatasets(
          response.data,
        );

        if (
          response.data.length >
          0
        ) {
          setSelectedDatasetId(
            response.data[0].id,
          );
        }
      } catch {
        if (!cancelled) {
          setError(
            "Unable to load datasets.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDatasets();

    return () => {
      cancelled = true;
    };
  }, []);


  function handleDatasetChange(
    datasetId: number,
  ) {
    setSelectedDatasetId(
      datasetId,
    );

    setSelectedDesign(
      null,
    );
  }


  function handleOpenDesign(
    design: DashboardDesign,
  ) {
    setSelectedDesign(
      design,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  function handleBackToDesigns() {
    setSelectedDesign(
      null,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  if (loading) {
    return (
      <section className="flex min-h-[520px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
            <LoaderCircle
              size={25}
              className="animate-spin text-blue-400"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-300">
            Loading dashboard workspace...
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Preparing your datasets.
          </p>
        </div>
      </section>
    );
  }


  return (
    <section className="min-h-full text-white">
      <div className="mx-auto max-w-[1500px]">
        {/* =========================================
            FULL SELECTED DASHBOARD
        ========================================= */}

        {selectedDesign &&
          selectedDatasetId !==
            null && (
            <div className="space-y-6">
              <div className="flex flex-col gap-5 border-b border-slate-800/80 pb-7 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <button
                    type="button"
                    onClick={
                      handleBackToDesigns
                    }
                    className="inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-medium text-slate-500 transition hover:text-white"
                  >
                    <ArrowLeft
                      size={16}
                    />

                    Back to Designs
                  </button>


                  <div className="mt-5 flex items-center gap-2">
                    <Sparkles
                      size={15}
                      className="text-blue-400"
                    />

                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                      Selected dashboard
                    </span>
                  </div>

                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                    Design{" "}
                    {
                      selectedDesign.design_number
                    }
                    {" — "}
                    {
                      selectedDesign.name
                    }
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Explore the generated dashboard,
                    apply filters and export the current
                    view when ready.
                  </p>
                </div>


                {datasets.length >
                  0 && (
                  <div className="w-full lg:w-80">
                    <label
                      htmlFor="selected-dashboard-dataset"
                      className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600"
                    >
                      Dataset
                    </label>

                    <div className="relative mt-2">
                      <Database
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <select
                        id="selected-dashboard-dataset"
                        value={
                          selectedDatasetId
                        }
                        onChange={(
                          event,
                        ) =>
                          handleDatasetChange(
                            Number(
                              event.target
                                .value,
                            ),
                          )
                        }
                        className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
                      >
                        {datasets.map(
                          (
                            dataset,
                          ) => (
                            <option
                              key={
                                dataset.id
                              }
                              value={
                                dataset.id
                              }
                            >
                              {
                                dataset.name
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>
                )}
              </div>


              <div className="overflow-hidden rounded-2xl">
                <FullDashboardCanvas
                  datasetId={
                    selectedDatasetId
                  }
                  design={
                    selectedDesign
                  }
                />
              </div>
            </div>
          )}


        {/* =========================================
            DASHBOARD GALLERY
            Keep mounted to preserve batches.
        ========================================= */}

        <div
          className={
            selectedDesign
              ? "hidden"
              : "block"
          }
        >
          <div className="flex flex-col gap-5 border-b border-slate-800/80 pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <BarChart3
                    size={16}
                  />
                </div>

                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                  AI visual intelligence
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-white">
                Analytics Dashboard Generator
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Transform your dataset into six
                professional BI dashboard alternatives,
                compare them and choose the design that
                best communicates your data.
              </p>
            </div>


            {datasets.length >
              0 && (
              <div className="w-full lg:w-80">
                <label
                  htmlFor="dashboard-dataset"
                  className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600"
                >
                  Dataset
                </label>

                <div className="relative mt-2">
                  <Database
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <select
                    id="dashboard-dataset"
                    value={
                      selectedDatasetId ??
                      ""
                    }
                    onChange={(
                      event,
                    ) =>
                      handleDatasetChange(
                        Number(
                          event.target
                            .value,
                        ),
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
                  >
                    {datasets.map(
                      (
                        dataset,
                      ) => (
                        <option
                          key={
                            dataset.id
                          }
                          value={
                            dataset.id
                          }
                        >
                          {
                            dataset.name
                          }
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
            )}
          </div>


          {error && (
            <div className="mt-6 rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}


          {!error &&
            datasets.length ===
              0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                  <Database
                    size={21}
                  />
                </div>

                <h2 className="mt-4 text-sm font-semibold text-white">
                  No datasets available
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Upload a dataset before generating
                  AI dashboard alternatives.
                </p>
              </div>
            )}


          {!error &&
            selectedDatasetId !==
              null && (
              <div className="mt-7">
                <DashboardDesignGallery
                  key={
                    selectedDatasetId
                  }
                  datasetId={
                    selectedDatasetId
                  }
                  onOpenDesign={
                    handleOpenDesign
                  }
                />
              </div>
            )}
        </div>
      </div>
    </section>
  );
}


export default AnalyticsDashboard;