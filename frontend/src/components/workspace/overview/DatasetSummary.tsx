import {
  Braces,
  CheckCircle2,
  CircleAlert,
  CopyX,
} from "lucide-react";


interface Props {
  rows: number;
  columns: number;
  quality: number;
  missing: number;
  duplicates: number;
  numericColumns: number;
}


function DatasetSummary({
  quality,
  missing,
  duplicates,
  numericColumns,
}: Props) {
  const items = [
    {
      key: "quality",
      label: "Quality Score",
      value: `${quality}%`,
      subtitle:
        "Overall dataset health",
      icon: CheckCircle2,
      iconClass:
        "text-emerald-400",
      backgroundClass:
        "bg-emerald-500/10",
    },

    {
      key: "missing",
      label: "Missing Values",
      value:
        missing.toLocaleString(
          "en-IN",
        ),
      subtitle:
        "Cells requiring attention",
      icon: CircleAlert,
      iconClass:
        "text-amber-400",
      backgroundClass:
        "bg-amber-500/10",
    },

    {
      key: "duplicates",
      label: "Duplicate Rows",
      value:
        duplicates.toLocaleString(
          "en-IN",
        ),
      subtitle:
        "Potential duplicate records",
      icon: CopyX,
      iconClass:
        "text-sky-400",
      backgroundClass:
        "bg-sky-500/10",
    },

    {
      key: "numericColumns",
      label: "Numeric Columns",
      value:
        numericColumns.toLocaleString(
          "en-IN",
        ),
      subtitle:
        "Available for statistical analysis",
      icon: Braces,
      iconClass:
        "text-violet-400",
      backgroundClass:
        "bg-violet-500/10",
    },
  ];


  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(
        ({
          key,
          label,
          value,
          subtitle,
          icon: Icon,
          iconClass,
          backgroundClass,
        }) => (
          <article
            key={key}
            className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 transition hover:border-slate-700 hover:bg-slate-950/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {label}
                </p>

                <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  {value}
                </p>
              </div>

              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${backgroundClass}`}
              >
                <Icon
                  size={17}
                  className={
                    iconClass
                  }
                />
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-600">
              {subtitle}
            </p>
          </article>
        ),
      )}
    </div>
  );
}


export default DatasetSummary;