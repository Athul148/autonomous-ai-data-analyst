import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  ArrowRight,
  Database,
  FileSpreadsheet,
  Plus,
  Rows3,
  Sparkles,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import apiClient from "../../api/client";

import type {
  User,
} from "../../types/auth";

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
  date: string,
): string {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(
    new Date(date),
  );
}


function Dashboard() {
  const navigate =
    useNavigate();

  const [
    datasets,
    setDatasets,
  ] =
    useState<Dataset[]>([]);

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


  const storedUser =
    localStorage.getItem(
      "user",
    );

  let user: User | null =
    null;

  try {
    user = storedUser
      ? (
          JSON.parse(
            storedUser,
          ) as User
        )
      : null;
  } catch {
    user = null;
  }


  useEffect(() => {
    if (
      !localStorage.getItem(
        "access_token",
      )
    ) {
      navigate("/");
      return;
    }

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
          ) &&
          requestError.response
            ?.status === 401
        ) {
          localStorage.clear();

          navigate("/");

          return;
        }

        setError(
          "Unable to load datasets.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDatasets();
  }, [navigate]);


  const totalRows =
    useMemo(
      () =>
        datasets.reduce(
          (
            total,
            dataset,
          ) =>
            total +
            dataset.rows,
          0,
        ),
      [datasets],
    );


  const totalStorage =
    useMemo(
      () =>
        datasets.reduce(
          (
            total,
            dataset,
          ) =>
            total +
            dataset.file_size,
          0,
        ),
      [datasets],
    );


  const recentDatasets =
    useMemo(
      () =>
        [...datasets]
          .sort(
            (a, b) =>
              new Date(
                b.created_at,
              ).getTime() -
              new Date(
                a.created_at,
              ).getTime(),
          )
          .slice(0, 6),
      [datasets],
    );


  return (
    <section className="min-h-full text-white">
      <div className="mx-auto max-w-[1500px]">
        {/* Page header */}
        <div className="flex flex-col gap-5 border-b border-slate-800/80 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-blue-400">
              <Sparkles
                size={15}
              />

              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                Data workspace
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Welcome back,{" "}
              {user?.name ??
                "User"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Monitor your data workspace,
              access recent datasets and
              continue your analysis.
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


        {/* KPI cards */}
        <section className="mt-7 grid gap-4 md:grid-cols-3">
          <div className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition duration-200 hover:border-slate-700 hover:bg-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                  Total datasets
                </p>

                <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                  {datasets.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/10 bg-blue-500/10 text-blue-400">
                <Database
                  size={20}
                />
              </div>
            </div>

            <div className="mt-5 border-t border-slate-800/80 pt-4">
              <p className="text-xs text-slate-500">
                Datasets available in
                your workspace
              </p>
            </div>
          </div>


          <div className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition duration-200 hover:border-slate-700 hover:bg-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                  Total rows
                </p>

                <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                  {totalRows.toLocaleString(
                    "en-IN",
                  )}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/10 bg-blue-500/10 text-blue-400">
                <Rows3
                  size={20}
                />
              </div>
            </div>

            <div className="mt-5 border-t border-slate-800/80 pt-4">
              <p className="text-xs text-slate-500">
                Records currently
                available for analysis
              </p>
            </div>
          </div>


          <div className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition duration-200 hover:border-slate-700 hover:bg-slate-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                  Storage used
                </p>

                <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                  {formatFileSize(
                    totalStorage,
                  )}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/10 bg-blue-500/10 text-blue-400">
                <FileSpreadsheet
                  size={20}
                />
              </div>
            </div>

            <div className="mt-5 border-t border-slate-800/80 pt-4">
              <p className="text-xs text-slate-500">
                Dataset file storage
                currently in use
              </p>
            </div>
          </div>
        </section>


        {/* Recent datasets */}
        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-white">
                Recent datasets
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Quickly continue working
                with your latest uploads.
              </p>
            </div>

            {datasets.length >
              0 && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/datasets",
                  )
                }
                className="flex items-center gap-1.5 text-sm font-medium text-blue-400 transition hover:text-blue-300"
              >
                View all

                <ArrowRight
                  size={15}
                />
              </button>
            )}
          </div>


          {loading && (
            <div className="px-6 py-14 text-center">
              <p className="text-sm text-slate-400">
                Loading datasets...
              </p>
            </div>
          )}


          {error && (
            <div className="px-6 py-10">
              <div className="rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            </div>
          )}


          {!loading &&
            !error &&
            datasets.length ===
              0 && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                  <Database
                    size={21}
                  />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-white">
                  No datasets yet
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Upload your first CSV
                  or Excel dataset to
                  begin exploring and
                  analysing your data.
                </p>

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
              </div>
            )}


          {!loading &&
            !error &&
            recentDatasets.length >
              0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/30 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      <th className="px-6 py-3.5">
                        Dataset
                      </th>

                      <th className="px-5 py-3.5">
                        Rows
                      </th>

                      <th className="px-5 py-3.5">
                        Columns
                      </th>

                      <th className="px-5 py-3.5">
                        Size
                      </th>

                      <th className="px-5 py-3.5">
                        Uploaded
                      </th>

                      <th className="px-6 py-3.5 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>


                  <tbody>
                    {recentDatasets.map(
                      (
                        dataset,
                      ) => (
                        <tr
                          key={
                            dataset.id
                          }
                          className="group border-b border-slate-800/70 last:border-b-0 transition hover:bg-slate-800/30"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                                <FileSpreadsheet
                                  size={17}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[320px] truncate font-medium text-slate-100">
                                  {
                                    dataset.name
                                  }
                                </p>

                                <p className="mt-1 max-w-[320px] truncate text-xs text-slate-500">
                                  {
                                    dataset.original_filename
                                  }
                                </p>
                              </div>
                            </div>
                          </td>


                          <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                            {dataset.rows.toLocaleString(
                              "en-IN",
                            )}
                          </td>


                          <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                            {
                              dataset.columns
                            }
                          </td>


                          <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                            {formatFileSize(
                              dataset.file_size,
                            )}
                          </td>


                          <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                            {formatDate(
                              dataset.created_at,
                            )}
                          </td>


                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/datasets/${dataset.id}`,
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-300"
                            >
                              Open

                              <ArrowRight
                                size={13}
                              />
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
        </section>
      </div>
    </section>
  );
}


export default Dashboard;