import {
  ArrowRight,
  CheckCircle2,
  Layers3,
  LoaderCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getDashboardDesigns,
} from "../../api/dashboardDesign.api";

import type {
  DashboardDesign,
  DashboardDesignResponse,
} from "../../types/dashboardDesign";

import DashboardDesignPreview from "./DashboardDesignPreview";


interface DashboardDesignGalleryProps {
  datasetId: number;

  onOpenDesign?: (
    design: DashboardDesign,
  ) => void;
}


function DashboardDesignGallery({
  datasetId,
  onOpenDesign,
}: DashboardDesignGalleryProps) {
  const [
    response,
    setResponse,
  ] =
    useState<
      DashboardDesignResponse | null
    >(null);

  const [
    batchNumber,
    setBatchNumber,
  ] =
    useState(1);

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
    generatingMore,
    setGeneratingMore,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {
    let cancelled = false;

    async function loadInitialBatch() {
      setLoading(true);
      setError("");
      setSelectedDesign(null);

      try {
        const result =
          await getDashboardDesigns(
            datasetId,
            1,
          );

        if (cancelled) {
          return;
        }

        setResponse(
          result,
        );

        setBatchNumber(
          1,
        );
      } catch {
        if (!cancelled) {
          setError(
            "Unable to generate dashboard designs.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialBatch();

    return () => {
      cancelled = true;
    };
  }, [datasetId]);


  async function handleGenerateNext() {
    if (generatingMore) {
      return;
    }

    const nextBatch =
      batchNumber + 1;

    setGeneratingMore(true);
    setError("");

    try {
      const result =
        await getDashboardDesigns(
          datasetId,
          nextBatch,
        );

      setResponse(
        result,
      );

      setBatchNumber(
        nextBatch,
      );

      setSelectedDesign(
        null,
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch {
      setError(
        "Unable to generate the next 6 dashboard designs.",
      );
    } finally {
      setGeneratingMore(false);
    }
  }


  function handleSelect(
    design: DashboardDesign,
  ) {
    setSelectedDesign(
      design,
    );
  }


  function handleOpenSelected() {
    if (
      !selectedDesign ||
      !onOpenDesign
    ) {
      return;
    }

    onOpenDesign(
      selectedDesign,
    );
  }


  if (loading) {
    return (
      <section className="flex min-h-[520px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/10 bg-blue-500/10">
            <LoaderCircle
              size={25}
              className="animate-spin text-blue-400"
            />
          </div>

          <p className="mt-5 text-sm font-semibold text-white">
            Generating 6 dashboard designs
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Analysing the dataset and creating
            different layouts, visual hierarchies
            and themes.
          </p>
        </div>
      </section>
    );
  }


  if (
    error &&
    !response
  ) {
    return (
      <section className="rounded-2xl border border-red-900/60 bg-red-950/20 p-6">
        <p className="text-sm text-red-300">
          {error}
        </p>
      </section>
    );
  }


  const designs =
    response?.batch.designs ??
    [];


  return (
    <section className="space-y-6">
      {/* Gallery title */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-blue-400">
            <Sparkles
              size={15}
            />

            <p className="text-[11px] font-semibold uppercase tracking-[0.17em]">
              Generated alternatives
            </p>
          </div>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
            Choose your dashboard
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Compare all six designs below.
            Select one to inspect it in full,
            or generate another batch if none
            fits your preference.
          </p>
        </div>


        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <Layers3
              size={17}
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
              Current batch
            </p>

            <p className="mt-0.5 text-sm font-semibold text-white">
              Batch{" "}
              {batchNumber}
            </p>
          </div>
        </div>
      </div>


      {error && (
        <div className="rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}


      {/* Design previews */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {designs.map(
          (design) => {
            const isSelected =
              selectedDesign
                ?.design_id ===
              design.design_id;

            return (
              <div
                key={
                  design.design_id
                }
                className={[
                  "relative rounded-2xl transition-all duration-200",
                  isSelected
                    ? "ring-2 ring-blue-500 ring-offset-4 ring-offset-slate-950"
                    : "",
                ].join(" ")}
              >
                {isSelected && (
                  <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg">
                    <CheckCircle2
                      size={12}
                    />

                    Selected
                  </div>
                )}

                <DashboardDesignPreview
                  design={
                    design
                  }
                  selected={
                    isSelected
                  }
                  onSelect={() =>
                    handleSelect(
                      design,
                    )
                  }
                />
              </div>
            );
          },
        )}
      </div>


      {/* Sticky-style action footer */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/10 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {selectedDesign ? (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={16}
                  className="text-blue-400"
                />

                <p className="text-sm font-semibold text-white">
                  Design{" "}
                  {
                    selectedDesign.design_number
                  }{" "}
                  selected
                </p>
              </div>

              <p className="mt-1 truncate text-xs text-slate-500">
                {
                  selectedDesign.name
                }
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-white">
                Select a design to continue
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Click any preview above to
                choose a dashboard.
              </p>
            </>
          )}
        </div>


        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={
              handleGenerateNext
            }
            disabled={
              generatingMore
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                generatingMore
                  ? "animate-spin"
                  : ""
              }
            />

            {generatingMore
              ? "Generating next batch..."
              : "Generate Next 6"}
          </button>


          <button
            type="button"
            disabled={
              selectedDesign ===
              null
            }
            onClick={
              handleOpenSelected
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-40"
          >
            Open Selected Design

            <ArrowRight
              size={15}
            />
          </button>
        </div>
      </div>
    </section>
  );
}


export default DashboardDesignGallery;