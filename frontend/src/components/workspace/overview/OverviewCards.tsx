import {
  Columns3,
  Database,
  Gauge,
  HardDrive,
} from "lucide-react";

import type {
  DatasetProfile,
} from "../../../types/profile";


interface OverviewCardsProps {
  profile: DatasetProfile;
}


function formatMemory(
  bytes: number,
): string {
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


function OverviewCards({
  profile,
}: OverviewCardsProps) {
  const completeness =
    profile.rows > 0 &&
    profile.columns > 0
      ? Math.max(
          0,
          100 -
            (
              profile.missing_values /
              (
                profile.rows *
                profile.columns
              )
            ) *
              100,
        )
      : 100;

  const cards = [
    {
      label: "Dataset Rows",
      value:
        profile.rows.toLocaleString(
          "en-IN",
        ),
      subtitle:
        "Total records available",
      icon: Database,
    },

    {
      label: "Columns",
      value:
        profile.columns.toLocaleString(
          "en-IN",
        ),
      subtitle:
        "Features in the dataset",
      icon: Columns3,
    },

    {
      label: "Completeness",
      value:
        `${completeness.toFixed(
          1,
        )}%`,
      subtitle:
        "Non-missing cell coverage",
      icon: Gauge,
    },

    {
      label: "Memory Usage",
      value:
        formatMemory(
          profile.memory_usage,
        ),
      subtitle:
        "Approximate in-memory size",
      icon: HardDrive,
    },
  ];


  return (
    <div>
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
          Dataset structure
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(
          ({
            label,
            value,
            subtitle,
            icon: Icon,
          }) => (
            <article
              key={label}
              className="rounded-xl border border-slate-800 bg-slate-950/30 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  {label}
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Icon
                    size={17}
                  />
                </div>
              </div>

              <p className="mt-4 text-2xl font-semibold tracking-tight text-white">
                {value}
              </p>

              <p className="mt-2 text-xs text-slate-600">
                {subtitle}
              </p>
            </article>
          ),
        )}
      </div>
    </div>
  );
}


export default OverviewCards;