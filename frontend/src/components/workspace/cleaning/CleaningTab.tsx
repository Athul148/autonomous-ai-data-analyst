import {
  AlertTriangle,
  CheckCircle2,
  Database,
  LoaderCircle,
  Play,
  Save,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  executeAutomaticCleaning,
  getAutomaticCleaningPlan,
  getCleaningRecommendations,
  saveAutomaticCleanedDataset,
} from "../../../api/cleaning.api";

import type {
  AutomaticCleaningPlanResponse,
  AutomaticCleaningResult,
  CleaningResponse,
  SaveAutomaticCleanedDatasetResponse,
} from "../../../types/cleaning";

interface CleaningTabProps {
  datasetId: number;
}

function formatName(value: string): string {
  return value
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function CleaningTab({
  datasetId,
}: CleaningTabProps) {
  const navigate = useNavigate();

  const [cleaning, setCleaning] =
    useState<CleaningResponse | null>(
      null,
    );

  const [plan, setPlan] =
    useState<AutomaticCleaningPlanResponse | null>(
      null,
    );

  const [result, setResult] =
    useState<AutomaticCleaningResult | null>(
      null,
    );

  const [prepareForMl, setPrepareForMl] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [planLoading, setPlanLoading] =
    useState(false);

  const [executing, setExecuting] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [saveName, setSaveName] =
    useState("");

  const [savedDataset, setSavedDataset] =
    useState<SaveAutomaticCleanedDatasetResponse | null>(
      null,
    );

  useEffect(() => {
    let cancelled = false;

    async function loadCleaning() {
      setLoading(true);
      setError("");
      setResult(null);
      setSavedDataset(null);

      try {
        const [
          cleaningResponse,
          planResponse,
        ] = await Promise.all([
          getCleaningRecommendations(
            datasetId,
          ),
          getAutomaticCleaningPlan(
            datasetId,
            {
              prepare_for_ml: false,
            },
          ),
        ]);

        if (cancelled) {
          return;
        }

        setCleaning(cleaningResponse);
        setPlan(planResponse);

        setSaveName(
          `${cleaningResponse.dataset_name}-cleaned`,
        );
      } catch {
        if (!cancelled) {
          setError(
            "Unable to load cleaning analysis.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCleaning();

    return () => {
      cancelled = true;
    };
  }, [datasetId]);

  async function handlePrepareForMlChange(
    checked: boolean,
  ) {
    setPrepareForMl(checked);
    setPlanLoading(true);
    setError("");
    setResult(null);
    setSavedDataset(null);

    try {
      const response =
        await getAutomaticCleaningPlan(
          datasetId,
          {
            prepare_for_ml: checked,
          },
        );

      setPlan(response);

      if (cleaning) {
        setSaveName(
          checked
            ? `${cleaning.dataset_name}-ml-ready`
            : `${cleaning.dataset_name}-cleaned`,
        );
      }
    } catch {
      setError(
        "Unable to generate the automatic cleaning plan.",
      );
    } finally {
      setPlanLoading(false);
    }
  }

  async function handleCleanDataset() {
    setExecuting(true);
    setError("");
    setResult(null);
    setSavedDataset(null);

    try {
      const response =
        await executeAutomaticCleaning(
          datasetId,
          {
            prepare_for_ml:
              prepareForMl,
          },
        );

      setResult(response);
    } catch {
      setError(
        "Unable to clean the dataset.",
      );
    } finally {
      setExecuting(false);
    }
  }

  async function handleSaveDataset() {
    if (!result) {
      return;
    }

    const name = saveName.trim();

    if (!name) {
      setError(
        "Enter a name for the cleaned dataset.",
      );
      return;
    }

    if (result.failed_actions > 0) {
      setError(
        "The cleaned dataset contains failed actions and cannot be saved.",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response =
        await saveAutomaticCleanedDataset(
          datasetId,
          {
            name,
            prepare_for_ml:
              prepareForMl,
          },
        );

      setSavedDataset(response);
    } catch {
      setError(
        "Unable to save the cleaned dataset.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <LoaderCircle
            size={18}
            className="animate-spin"
          />

          Analysing dataset...
        </div>
      </div>
    );
  }

  if (!cleaning || !plan) {
    return (
      <div className="rounded-xl border border-red-900 bg-red-950/30 p-5 text-sm text-red-300">
        {error ||
          "Cleaning analysis is unavailable."}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles
            size={20}
            className="text-blue-300"
          />

          <h2 className="text-xl font-semibold text-white">
            Data Cleaning
          </h2>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Detected data issues are analysed
          automatically and the most suitable
          cleaning actions are selected for
          this dataset.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Detected Issues"
          value={
            cleaning.summary
              .total_recommendations
          }
        />

        <SummaryCard
          label="High Priority"
          value={
            cleaning.summary.high_priority
          }
        />

        <SummaryCard
          label="Medium Priority"
          value={
            cleaning.summary
              .medium_priority
          }
        />

        <SummaryCard
          label="Automatic Actions"
          value={plan.total_decisions}
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={18}
              className="text-amber-300"
            />

            <h3 className="font-semibold text-white">
              Detected Dataset Issues
            </h3>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            These issues were detected during
            dataset analysis.
          </p>
        </div>

        {cleaning.recommendations.length >
        0 ? (
          <div className="divide-y divide-slate-800">
            {cleaning.recommendations.map(
              (recommendation) => (
                <div
                  key={recommendation.id}
                  className="p-5"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="font-medium text-white">
                      {recommendation.title}
                    </h4>

                    <span
                      className={[
                        "rounded-full px-2.5 py-1",
                        "text-xs font-semibold capitalize",
                        recommendation.priority ===
                        "high"
                          ? "bg-red-500/10 text-red-300"
                          : recommendation.priority ===
                              "medium"
                            ? "bg-amber-500/10 text-amber-300"
                            : "bg-slate-800 text-slate-300",
                      ].join(" ")}
                    >
                      {recommendation.priority}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {
                      recommendation.description
                    }
                  </p>

                  {recommendation
                    .affected_columns.length >
                    0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {recommendation.affected_columns.map(
                        (column) => (
                          <span
                            key={column}
                            className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
                          >
                            {column}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="p-5 text-sm text-slate-400">
            No major cleaning issues were
            detected.
          </div>
        )}
      </div>

      <div className="rounded-xl border border-blue-900/50 bg-blue-950/20 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-white">
              Prepare for Machine Learning
            </h3>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
              Enable this when you want a
              model-ready dataset. Identifier
              columns, categorical encoding and
              numeric scaling will be handled
              automatically when appropriate.
            </p>
          </div>

          <label className="flex shrink-0 cursor-pointer items-center gap-3">
            <span className="text-sm font-medium text-slate-300">
              {prepareForMl
                ? "Enabled"
                : "Disabled"}
            </span>

            <input
              type="checkbox"
              checked={prepareForMl}
              disabled={
                planLoading ||
                executing
              }
              onChange={(event) =>
                handlePrepareForMlChange(
                  event.target.checked,
                )
              }
              className="h-5 w-5 accent-blue-600"
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={18}
              className="text-blue-300"
            />

            <h3 className="font-semibold text-white">
              Automatic Cleaning Plan
            </h3>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            The system selected these actions
            based on the characteristics of
            this dataset.
          </p>
        </div>

        {planLoading ? (
          <div className="flex items-center gap-3 p-5 text-sm text-slate-400">
            <LoaderCircle
              size={17}
              className="animate-spin"
            />

            Updating cleaning plan...
          </div>
        ) : plan.decisions.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {plan.decisions.map(
              (decision, index) => (
                <div
                  key={`${decision.issue}-${index}`}
                  className="p-5"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <CheckCircle2
                      size={17}
                      className="text-emerald-400"
                    />

                    <h4 className="font-medium text-white">
                      {formatName(
                        decision.action,
                      )}
                    </h4>

                    <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-300">
                      Automatic
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {decision.reason}
                  </p>

                  {decision.columns.length >
                    0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {decision.columns.map(
                        (column) => (
                          <span
                            key={column}
                            className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
                          >
                            {column}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="p-5">
            <div className="flex items-center gap-2 text-sm text-emerald-300">
              <CheckCircle2 size={17} />
              No cleaning actions are required.
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCleanDataset}
          disabled={
            executing ||
            planLoading ||
            plan.decisions.length === 0
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {executing ? (
            <LoaderCircle
              size={17}
              className="animate-spin"
            />
          ) : (
            <Play size={17} />
          )}

          {executing
            ? "Cleaning Dataset..."
            : "Clean Dataset"}
        </button>
      </div>

      {result && (
        <>
          <div className="rounded-xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={19}
                  className="text-emerald-300"
                />

                <h3 className="font-semibold text-white">
                  Cleaning Results
                </h3>
              </div>

              <p className="mt-2 text-sm text-slate-400">
                Review the cleaned dataset
                before saving it.
              </p>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
              <ComparisonCard
                label="Rows"
                before={result.before.rows}
                after={result.after.rows}
              />

              <ComparisonCard
                label="Columns"
                before={
                  result.before.columns
                }
                after={
                  result.after.columns
                }
              />

              <ComparisonCard
                label="Missing Values"
                before={
                  result.before
                    .missing_values
                }
                after={
                  result.after
                    .missing_values
                }
              />

              <ComparisonCard
                label="Duplicate Rows"
                before={
                  result.before
                    .duplicate_rows
                }
                after={
                  result.after
                    .duplicate_rows
                }
              />
            </div>

            <div className="grid gap-4 border-t border-slate-800 p-5 sm:grid-cols-3">
              <ResultMetric
                label="Applied"
                value={
                  result.applied_actions
                }
              />

              <ResultMetric
                label="Skipped"
                value={
                  result.skipped_actions
                }
              />

              <ResultMetric
                label="Failed"
                value={
                  result.failed_actions
                }
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 p-5">
              <h3 className="font-semibold text-white">
                Actions Performed
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Cleaning operations performed
                automatically on the dataset.
              </p>
            </div>

            <div className="divide-y divide-slate-800">
              {result.actions.map(
                (action, index) => (
                  <div
                    key={`${action.action}-${index}`}
                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {action.status ===
                          "applied" && (
                          <CheckCircle2
                            size={17}
                            className="text-emerald-400"
                          />
                        )}

                        {action.status ===
                          "skipped" && (
                          <AlertTriangle
                            size={17}
                            className="text-amber-400"
                          />
                        )}

                        {action.status ===
                          "failed" && (
                          <XCircle
                            size={17}
                            className="text-red-400"
                          />
                        )}

                        <p className="font-medium text-white">
                          {formatName(
                            action.action,
                          )}
                        </p>
                      </div>

                      <p className="mt-2 text-sm text-slate-400">
                        {action.message}
                      </p>

                      {action.columns.length >
                        0 && (
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Columns:{" "}
                          {action.columns.join(
                            ", ",
                          )}
                        </p>
                      )}
                    </div>

                    <span
                      className={[
                        "w-fit rounded-full px-2.5 py-1",
                        "text-xs font-semibold capitalize",
                        action.status ===
                        "applied"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : action.status ===
                              "failed"
                            ? "bg-red-500/10 text-red-300"
                            : "bg-amber-500/10 text-amber-300",
                      ].join(" ")}
                    >
                      {action.status}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>

          {result.cleaned_sample.length >
            0 && (
            <CleanedSampleTable
              rows={
                result.cleaned_sample
              }
            />
          )}

          <div className="rounded-xl border border-blue-900/60 bg-blue-950/20 p-5">
            <div className="flex items-start gap-3">
              <Database
                size={20}
                className="mt-0.5 shrink-0 text-blue-300"
              />

              <div className="flex-1">
                <h3 className="font-semibold text-white">
                  Save Cleaned Dataset
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Saving creates a new dataset.
                  Your original uploaded dataset
                  remains unchanged.
                </p>

                <div className="mt-4 flex flex-col gap-3 lg:flex-row">
                  <input
                    type="text"
                    value={saveName}
                    onChange={(event) =>
                      setSaveName(
                        event.target.value,
                      )
                    }
                    disabled={
                      saving ||
                      savedDataset !== null
                    }
                    placeholder="Cleaned dataset name"
                    className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={
                      handleSaveDataset
                    }
                    disabled={
                      saving ||
                      result.failed_actions >
                        0 ||
                      savedDataset !== null
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={17} />
                    )}

                    {saving
                      ? "Saving..."
                      : savedDataset
                        ? "Saved"
                        : "Save Cleaned Dataset"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {savedDataset && (
            <div className="rounded-xl border border-emerald-900 bg-emerald-950/20 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={21}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-300">
                    Cleaned dataset saved
                  </h3>

                  <p className="mt-2 text-sm text-slate-300">
                    {
                      savedDataset.dataset_name
                    }{" "}
                    was saved as dataset #
                    {
                      savedDataset.dataset_id
                    }{" "}
                    with{" "}
                    {savedDataset.rows.toLocaleString(
                      "en-IN",
                    )}{" "}
                    rows and{" "}
                    {
                      savedDataset.columns
                    }{" "}
                    columns.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/datasets/${savedDataset.dataset_id}`,
                      )
                    }
                    className="mt-4 rounded-lg border border-emerald-800 bg-emerald-950/40 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-950/70"
                  >
                    Open Cleaned Dataset
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-white">
        {value.toLocaleString(
          "en-IN",
        )}
      </p>
    </div>
  );
}

function ComparisonCard({
  label,
  before,
  after,
}: {
  label: string;
  before: number;
  after: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <p className="text-sm font-medium text-slate-400">
        {label}
      </p>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-lg font-semibold text-slate-500">
          {before.toLocaleString(
            "en-IN",
          )}
        </span>

        <span className="text-slate-600">
          →
        </span>

        <span className="text-lg font-semibold text-white">
          {after.toLocaleString(
            "en-IN",
          )}
        </span>
      </div>
    </div>
  );
}

function ResultMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold text-white">
        {value.toLocaleString(
          "en-IN",
        )}
      </p>
    </div>
  );
}

function CleanedSampleTable({
  rows,
}: {
  rows: Record<
    string,
    unknown
  >[];
}) {
  const columns =
    rows.length > 0
      ? Object.keys(rows[0])
      : [];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-5">
        <h3 className="font-semibold text-white">
          Cleaned Data Preview
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Sample rows from the automatically
          cleaned in-memory dataset.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-950/70 text-xs uppercase text-slate-500">
            <tr>
              {columns.map(
                (column) => (
                  <th
                    key={column}
                    className="whitespace-nowrap px-4 py-3 font-semibold"
                  >
                    {column}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {rows.map(
              (row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="text-slate-300"
                >
                  {columns.map(
                    (column) => {
                      const value =
                        row[column];

                      return (
                        <td
                          key={column}
                          className="whitespace-nowrap px-4 py-3"
                        >
                          {value ===
                            null ||
                          value ===
                            undefined
                            ? "—"
                            : typeof value ===
                                "number" &&
                              !Number.isInteger(
                                value,
                              )
                              ? value.toFixed(
                                  4,
                                )
                              : String(
                                  value,
                                )}
                        </td>
                      );
                    },
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CleaningTab;