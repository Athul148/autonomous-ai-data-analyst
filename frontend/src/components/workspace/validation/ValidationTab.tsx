import {
  CheckCircle2,
  CircleAlert,
  Hash,
  LoaderCircle,
  Tags,
  Workflow,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getValidation,
} from "../../../api/validation.api";

import type {
  ColumnValidation,
  ValidationIssue,
  ValidationResponse,
} from "../../../types/validation";


interface ValidationTabProps {
  datasetId: number;
}


interface ValidationSectionProps {
  title: string;
  items: ColumnValidation[];
  icon: typeof Hash;
}


function formatIssueType(
  type: string,
): string {
  return type
    .split("_")
    .map(
      (word) =>
        word.charAt(0)
          .toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}


function countIssues(
  items: ColumnValidation[],
): number {
  return items.reduce(
    (
      total,
      item,
    ) =>
      total +
      item.issues.reduce(
        (
          issueTotal,
          issue,
        ) =>
          issueTotal +
          issue.count,
        0,
      ),
    0,
  );
}


function getIssueKey(
  column: string,
  issue: ValidationIssue,
  index: number,
): string {
  return `${column}-${issue.type}-${index}`;
}


function ValidationSection({
  title,
  items,
  icon: Icon,
}: ValidationSectionProps) {
  const totalIssues =
    countIssues(
      items,
    );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
      <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Icon
              size={16}
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              {title}
            </h3>

            <p className="mt-0.5 text-xs text-slate-600">
              {
                items.length
              }{" "}
              {items.length ===
              1
                ? "column"
                : "columns"}{" "}
              with issues
            </p>
          </div>
        </div>

        <span className="rounded-lg bg-slate-950/60 px-2.5 py-1 text-xs font-semibold text-slate-400">
          {totalIssues.toLocaleString(
            "en-IN",
          )}{" "}
          affected
        </span>
      </div>


      {items.length ===
      0 ? (
        <div className="flex items-center gap-3 px-5 py-6">
          <CheckCircle2
            size={17}
            className="text-emerald-400"
          />

          <p className="text-sm text-emerald-300">
            No issues found.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/70">
          {items.map(
            (
              item,
            ) => {
              const affected =
                countIssues([
                  item,
                ]);

              return (
                <div
                  key={
                    item.column
                  }
                  className="px-5 py-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {
                          item.column
                        }
                      </h4>

                      <p className="mt-1 text-xs text-slate-600">
                        {
                          affected
                        }{" "}
                        affected{" "}
                        {affected ===
                        1
                          ? "value"
                          : "values"}
                      </p>
                    </div>
                  </div>


                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    {item.issues.map(
                      (
                        issue,
                        index,
                      ) => (
                        <article
                          key={getIssueKey(
                            item.column,
                            issue,
                            index,
                          )}
                          className="rounded-xl border border-amber-900/50 bg-amber-950/15 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <CircleAlert
                                size={
                                  14
                                }
                                className="text-amber-400"
                              />

                              <span className="text-xs font-semibold text-amber-200">
                                {formatIssueType(
                                  issue.type,
                                )}
                              </span>
                            </div>

                            <span className="rounded-lg bg-red-500/10 px-2 py-1 text-[11px] font-semibold text-red-300">
                              {issue.count.toLocaleString(
                                "en-IN",
                              )}
                            </span>
                          </div>

                          <p className="mt-3 text-sm leading-6 text-slate-400">
                            {
                              issue.message
                            }
                          </p>
                        </article>
                      ),
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}


function ValidationTab({
  datasetId,
}: ValidationTabProps) {
  const [
    validation,
    setValidation,
  ] =
    useState<
      ValidationResponse | null
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

    async function loadValidation() {
      setLoading(true);
      setError("");

      try {
        const response =
          await getValidation(
            datasetId,
          );

        if (!cancelled) {
          setValidation(
            response,
          );
        }
      } catch {
        if (!cancelled) {
          setValidation(
            null,
          );

          setError(
            "Unable to load validation results.",
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

    loadValidation();

    return () => {
      cancelled = true;
    };
  }, [datasetId]);


  const summary =
    useMemo(() => {
      if (!validation) {
        return {
          total: 0,
          numeric: 0,
          categorical: 0,
          identifier: 0,
        };
      }

      const numeric =
        countIssues(
          validation.numeric,
        );

      const categorical =
        countIssues(
          validation.categorical,
        );

      const identifier =
        countIssues(
          validation.identifier,
        );

      return {
        total:
          numeric +
          categorical +
          identifier,

        numeric,
        categorical,
        identifier,
      };
    }, [validation]);


  if (loading) {
    return (
      <section className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={24}
            className="mx-auto animate-spin text-blue-400"
          />

          <p className="mt-4 text-sm text-slate-400">
            Loading validation results...
          </p>
        </div>
      </section>
    );
  }


  if (
    error ||
    !validation
  ) {
    return (
      <div className="rounded-2xl border border-red-900/60 bg-red-950/20 px-5 py-4 text-sm text-red-300">
        {error ||
          "Validation results are unavailable."}
      </div>
    );
  }


  const summaryCards = [
    {
      label:
        "Total Issues",
      value:
        summary.total,
      icon:
        CircleAlert,
    },
    {
      label:
        "Numeric",
      value:
        summary.numeric,
      icon:
        Hash,
    },
    {
      label:
        "Categorical",
      value:
        summary.categorical,
      icon:
        Tags,
    },
    {
      label:
        "Identifier",
      value:
        summary.identifier,
      icon:
        Workflow,
    },
  ];


  return (
    <section className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <Workflow
            size={17}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Dataset Validation
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Review invalid values, category issues
            and identifier anomalies detected in the dataset.
          </p>
        </div>
      </div>


      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(
          ({
            label,
            value,
            icon: Icon,
          }) => (
            <article
              key={
                label
              }
              className="rounded-xl border border-slate-800 bg-slate-950/30 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                    {label}
                  </p>

                  <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
                    {value.toLocaleString(
                      "en-IN",
                    )}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Icon
                    size={16}
                  />
                </div>
              </div>
            </article>
          ),
        )}
      </div>


      <ValidationSection
        title="Numeric Validation"
        items={
          validation.numeric
        }
        icon={Hash}
      />

      <ValidationSection
        title="Categorical Validation"
        items={
          validation.categorical
        }
        icon={Tags}
      />

      <ValidationSection
        title="Identifier Validation"
        items={
          validation.identifier
        }
        icon={Workflow}
      />
    </section>
  );
}


export default ValidationTab;