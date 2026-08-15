import {
  CalendarDays,
  Database,
  Download,
  Eye,
  FileText,
  LoaderCircle,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  deleteSavedReport,
  downloadSavedReportPdf,
  getSavedReports,
} from "../../api/savedReport.api";

import type {
  SavedReportListItem,
} from "../../types/savedReport";


function formatDate(
  value: string,
): string {
  return new Date(
    value,
  ).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
}


function createSafeFilename(
  title: string,
): string {
  const safeTitle =
    title
      .replace(
        /[\\/:*?"<>|]/g,
        "-",
      )
      .trim();

  return (
    safeTitle ||
    "AI Report"
  );
}


function ReportsPage() {
  const navigate =
    useNavigate();

  const [
    reports,
    setReports,
  ] =
    useState<
      SavedReportListItem[]
    >([]);

  const [
    search,
    setSearch,
  ] =
    useState("");

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

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    downloadingId,
    setDownloadingId,
  ] =
    useState<number | null>(
      null,
    );


  useEffect(() => {
    let cancelled =
      false;

    async function loadReports() {
      setLoading(true);
      setError("");

      try {
        const response =
          await getSavedReports();

        if (!cancelled) {
          setReports(
            response,
          );
        }
      } catch {
        if (!cancelled) {
          setError(
            "Unable to load saved reports.",
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

    loadReports();

    return () => {
      cancelled = true;
    };
  }, []);


  const filteredReports =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return reports;
      }

      return reports.filter(
        (report) =>
          report.title
            .toLowerCase()
            .includes(query) ||
          report.dataset_name
            .toLowerCase()
            .includes(query),
      );
    }, [
      reports,
      search,
    ]);


  async function handleDownload(
    report: SavedReportListItem,
  ) {
    if (
      downloadingId !==
        null ||
      deletingId !== null
    ) {
      return;
    }

    setDownloadingId(
      report.id,
    );

    setError("");

    try {
      const pdfBlob =
        await downloadSavedReportPdf(
          report.id,
        );

      const downloadUrl =
        URL.createObjectURL(
          pdfBlob,
        );

      const link =
        document.createElement(
          "a",
        );

      link.href =
        downloadUrl;

      link.download =
        `${createSafeFilename(
          report.title,
        )}.pdf`;

      document.body.appendChild(
        link,
      );

      link.click();
      link.remove();

      URL.revokeObjectURL(
        downloadUrl,
      );
    } catch {
      setError(
        "Unable to download the report PDF.",
      );
    } finally {
      setDownloadingId(
        null,
      );
    }
  }


  async function handleDelete(
    reportId: number,
  ) {
    if (
      deletingId !== null ||
      downloadingId !==
        null
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this saved report?",
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      reportId,
    );

    setError("");

    try {
      await deleteSavedReport(
        reportId,
      );

      setReports(
        (current) =>
          current.filter(
            (report) =>
              report.id !==
              reportId,
          ),
      );
    } catch {
      setError(
        "Unable to delete the report.",
      );
    } finally {
      setDeletingId(
        null,
      );
    }
  }


  return (
    <section className="min-h-full text-white">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <div className="border-b border-slate-800/80 pb-7">
          <div className="mb-3 flex items-center gap-2">
            <FileText
              size={15}
              className="text-blue-400"
            />

            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-400">
              AI report library
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Reports
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Review, download and
            manage AI-generated reports
            saved from your dataset
            analysis.
          </p>
        </div>


        {/* Toolbar */}
        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
              placeholder="Search reports or datasets..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/70 py-3 pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60 focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/10"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-slate-500 transition hover:bg-slate-800 hover:text-white"
              >
                <X
                  size={15}
                />
              </button>
            )}
          </div>


          {!loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-slate-900 px-2 font-semibold text-slate-300">
                {
                  filteredReports.length
                }
              </span>

              <span>
                {filteredReports.length ===
                1
                  ? "saved report"
                  : "saved reports"}
              </span>
            </div>
          )}
        </div>


        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}


        {/* Loading */}
        {loading && (
          <div className="mt-5 flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="text-center">
              <LoaderCircle
                size={27}
                className="mx-auto animate-spin text-blue-400"
              />

              <p className="mt-4 text-sm text-slate-400">
                Loading saved
                reports...
              </p>
            </div>
          </div>
        )}


        {/* Empty state */}
        {!loading &&
          filteredReports.length ===
            0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                {search ? (
                  <Search
                    size={21}
                  />
                ) : (
                  <FileText
                    size={21}
                  />
                )}
              </div>

              <h2 className="mt-4 text-sm font-semibold text-white">
                {search
                  ? "No matching reports"
                  : "No saved reports yet"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search
                  ? "Try another report title or dataset name."
                  : "Generate an AI report from a dataset and save it to build your report library."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="mt-5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Clear search
                </button>
              )}
            </div>
          )}


        {/* Reports */}
        {!loading &&
          filteredReports.length >
            0 && (
            <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {filteredReports.map(
                (
                  report,
                ) => {
                  const isDeleting =
                    deletingId ===
                    report.id;

                  const isDownloading =
                    downloadingId ===
                    report.id;

                  const cardBusy =
                    isDeleting ||
                    isDownloading;

                  return (
                    <article
                      key={
                        report.id
                      }
                      className="group flex min-h-[240px] flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900 hover:shadow-xl hover:shadow-black/10"
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                            <FileText
                              size={18}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                              AI Report
                            </p>

                            <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-6 text-white">
                              {
                                report.title
                              }
                            </h2>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                          #
                          {
                            report.id
                          }
                        </span>
                      </div>


                      {/* Metadata */}
                      <div className="mt-5 space-y-3">
                        <div className="flex items-center gap-2.5 text-sm text-slate-400">
                          <Database
                            size={15}
                            className="shrink-0 text-slate-600"
                          />

                          <span className="truncate">
                            {
                              report.dataset_name
                            }
                          </span>
                        </div>


                        <div className="flex items-center gap-2.5 text-xs text-slate-500">
                          <CalendarDays
                            size={14}
                            className="shrink-0 text-slate-600"
                          />

                          <span>
                            Saved{" "}
                            {formatDate(
                              report.created_at,
                            )}
                          </span>
                        </div>
                      </div>


                      {/* Actions */}
                      <div className="mt-auto flex items-center gap-2 border-t border-slate-800/80 pt-5">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/reports/${report.id}`,
                            )
                          }
                          disabled={
                            cardBusy
                          }
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Eye
                            size={
                              15
                            }
                          />

                          Open
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(
                              report,
                            )
                          }
                          disabled={
                            deletingId !==
                              null ||
                            downloadingId !==
                              null
                          }
                          title="Download PDF"
                          aria-label={`Download ${report.title} as PDF`}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-950/40 text-slate-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isDownloading ? (
                            <LoaderCircle
                              size={
                                15
                              }
                              className="animate-spin"
                            />
                          ) : (
                            <Download
                              size={
                                15
                              }
                            />
                          )}
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              report.id,
                            )
                          }
                          disabled={
                            deletingId !==
                              null ||
                            downloadingId !==
                              null
                          }
                          title="Delete report"
                          aria-label={`Delete ${report.title}`}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 text-slate-500 transition hover:border-red-900/60 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isDeleting ? (
                            <LoaderCircle
                              size={
                                15
                              }
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2
                              size={
                                15
                              }
                            />
                          )}
                        </button>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
      </div>
    </section>
  );
}


export default ReportsPage;