import {
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

import DatasetSummary from "./DatasetSummary";

import type {
  Dataset,
} from "../../../types/dataset";


interface Props {
  dataset: Dataset;

  profile?: {
    rows: number;
    columns: number;
    quality_score: number;
    missing_values: number;
    duplicate_rows: number;

    column_metadata: {
      dtype: string;
    }[];
  };
}


function DatasetHeader({
  dataset,
  profile,
}: Props) {
  const numericColumns =
    profile?.column_metadata.filter(
      (column) =>
        [
          "int64",
          "float64",
          "int32",
          "float32",
        ].includes(
          column.dtype,
        ),
    ).length ?? 0;


  const fileType =
    dataset.original_filename
      .split(".")
      .pop()
      ?.toUpperCase() ||
    "DATA";


  return (
    <header className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
      <div className="border-b border-slate-800/80 px-6 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/10 bg-blue-500/10 text-blue-400">
              <FileSpreadsheet
                size={26}
              />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-400">
                Dataset workspace
              </p>

              <h1 className="mt-2 truncate text-3xl font-semibold tracking-tight text-white">
                {dataset.name}
              </h1>

              <p className="mt-1 truncate text-sm text-slate-500">
                {dataset.original_filename}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                <span>
                  {dataset.rows.toLocaleString(
                    "en-IN",
                  )}{" "}
                  rows
                </span>

                <span className="h-1 w-1 rounded-full bg-slate-700" />

                <span>
                  {dataset.columns} columns
                </span>

                <span className="h-1 w-1 rounded-full bg-slate-700" />

                <span>
                  {fileType}
                </span>
              </div>
            </div>
          </div>


          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5">
            <CheckCircle2
              size={16}
              className="text-emerald-400"
            />

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-500/70">
                Status
              </p>

              <p className="mt-0.5 text-xs font-semibold text-emerald-300">
                Analysis Complete
              </p>
            </div>
          </div>
        </div>
      </div>


      {profile && (
        <div className="px-6 py-5">
          <DatasetSummary
            rows={
              profile.rows
            }
            columns={
              profile.columns
            }
            quality={
              profile.quality_score
            }
            missing={
              profile.missing_values
            }
            duplicates={
              profile.duplicate_rows
            }
            numericColumns={
              numericColumns
            }
          />
        </div>
      )}
    </header>
  );
}


export default DatasetHeader;