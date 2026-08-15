import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Database,
  FileSpreadsheet,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import apiClient from "../../api/client";

import type {
  Dataset,
} from "../../types/dataset";


function formatFileSize(
  bytes: number,
): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}


function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(
    new Date(value),
  );
}


function DatasetList() {
  const navigate =
    useNavigate();

  const [
    datasets,
    setDatasets,
  ] =
    useState<Dataset[]>([]);

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


  useEffect(() => {
    async function loadDatasets() {
      try {
        const response =
          await apiClient.get<
            Dataset[]
          >(
            "/datasets",
          );

        setDatasets(
          response.data,
        );
      } catch (
        requestError
      ) {
        if (
          axios.isAxiosError(
            requestError,
          )
        ) {
          setError(
            requestError.response
              ?.data?.message ||
              requestError.response
                ?.data?.detail ||
              "Unable to load datasets.",
          );
        } else {
          setError(
            "An unexpected error occurred.",
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadDatasets();
  }, []);


  const filteredDatasets =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return datasets;
      }

      return datasets.filter(
        (dataset) =>
          dataset.name
            .toLowerCase()
            .includes(query) ||
          dataset.original_filename
            .toLowerCase()
            .includes(query),
      );
    }, [
      datasets,
      search,
    ]);


  async function handleDelete(
    dataset: Dataset,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${dataset.name}"?\n\nThis will permanently remove the dataset.`,
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      dataset.id,
    );

    setError("");

    try {
      await apiClient.delete(
        `/datasets/${dataset.id}`,
      );

      setDatasets(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              dataset.id,
          ),
      );
    } catch (
      requestError
    ) {
      if (
        axios.isAxiosError(
          requestError,
        )
      ) {
        setError(
          requestError.response
            ?.data?.detail ||
            "Unable to delete dataset.",
        );
      } else {
        setError(
          "An unexpected error occurred while deleting the dataset.",
        );
      }
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
        <div className="flex flex-col gap-5 border-b border-slate-800/80 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Database
                size={15}
                className="text-blue-400"
              />

              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                Data library
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Datasets
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Manage your uploaded data
              sources and open a dataset
              to begin analysis.
            </p>
          </div>


          <button
            type="button"
            onClick={() =>
              navigate(
                "/datasets/upload",
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
          >
            <Plus
              size={17}
            />

            Upload Dataset
          </button>
        </div>


        {/* Search / summary */}
        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search by dataset or file name..."
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
            <p className="text-xs font-medium text-slate-500">
              {filteredDatasets.length}{" "}
              {filteredDatasets.length ===
              1
                ? "dataset"
                : "datasets"}
            </p>
          )}
        </div>


        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}


        {/* Dataset library */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          {loading && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-blue-400" />

              <p className="mt-4 text-sm text-slate-400">
                Loading datasets...
              </p>
            </div>
          )}


          {!loading &&
            filteredDatasets.length ===
              0 && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                  <Database
                    size={21}
                  />
                </div>

                <h2 className="mt-4 text-sm font-semibold text-white">
                  {search
                    ? "No matching datasets"
                    : "No datasets yet"}
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  {search
                    ? "Try a different dataset name or clear your search."
                    : "Upload a CSV or Excel file to start analysing your data."}
                </p>

                {!search && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/datasets/upload",
                      )
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    <Plus
                      size={16}
                    />

                    Upload Dataset
                  </button>
                )}
              </div>
            )}


          {!loading &&
            filteredDatasets.length >
              0 && (
              <>
                {/* Desktop headings */}
                <div className="hidden grid-cols-[minmax(260px,1fr)_110px_110px_110px_180px_90px] items-center gap-4 border-b border-slate-800 bg-slate-950/30 px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 lg:grid">
                  <span>
                    Dataset
                  </span>

                  <span>
                    Rows
                  </span>

                  <span>
                    Columns
                  </span>

                  <span>
                    Size
                  </span>

                  <span>
                    Uploaded
                  </span>

                  <span className="text-right">
                    Action
                  </span>
                </div>


                <div className="divide-y divide-slate-800/70">
                  {filteredDatasets.map(
                    (
                      dataset,
                    ) => (
                      <div
                        key={
                          dataset.id
                        }
                        className="group flex items-center gap-4 px-5 py-4 transition hover:bg-slate-800/30 sm:px-6"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/datasets/${dataset.id}`,
                            )
                          }
                          className="grid min-w-0 flex-1 items-center gap-4 text-left lg:grid-cols-[minmax(260px,1fr)_110px_110px_110px_180px]"
                        >
                          {/* Dataset */}
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-500/15">
                              <FileSpreadsheet
                                size={18}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-100 transition group-hover:text-white">
                                {
                                  dataset.name
                                }
                              </p>

                              <p className="mt-1 truncate text-xs text-slate-500">
                                {
                                  dataset.original_filename
                                }
                              </p>

                              {/* Mobile metadata */}
                              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 lg:hidden">
                                <span>
                                  {dataset.rows.toLocaleString(
                                    "en-IN",
                                  )}{" "}
                                  rows
                                </span>

                                <span>
                                  {
                                    dataset.columns
                                  }{" "}
                                  columns
                                </span>

                                <span>
                                  {formatFileSize(
                                    dataset.file_size,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>


                          <span className="hidden text-sm text-slate-300 lg:block">
                            {dataset.rows.toLocaleString(
                              "en-IN",
                            )}
                          </span>


                          <span className="hidden text-sm text-slate-300 lg:block">
                            {
                              dataset.columns
                            }
                          </span>


                          <span className="hidden text-sm text-slate-300 lg:block">
                            {formatFileSize(
                              dataset.file_size,
                            )}
                          </span>


                          <span className="hidden whitespace-nowrap text-sm text-slate-400 lg:block">
                            {formatDate(
                              dataset.created_at,
                            )}
                          </span>
                        </button>


                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              dataset,
                            )
                          }
                          disabled={
                            deletingId ===
                            dataset.id
                          }
                          aria-label={`Delete ${dataset.name}`}
                          title="Delete dataset"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {deletingId ===
                          dataset.id ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-900 border-t-red-400" />
                          ) : (
                            <Trash2
                              size={16}
                            />
                          )}
                        </button>
                      </div>
                    ),
                  )}
                </div>
              </>
            )}
        </div>
      </div>
    </section>
  );
}


export default DatasetList;