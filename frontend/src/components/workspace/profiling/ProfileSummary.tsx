import type { DatasetProfile } from "../../../types/profile";

interface ProfileSummaryProps {
  profile: DatasetProfile;
}

function percentage(
  value: number,
  total: number
) {
  if (total === 0) return "0%";

  return `${((value / total) * 100).toFixed(2)}%`;
}

function ProfileSummary({
  profile,
}: ProfileSummaryProps) {
  const numericColumns =
    profile.column_metadata.filter((column) =>
      ["int64", "float64", "int32", "float32"].includes(
        column.dtype.toLowerCase()
      )
    ).length;

  const categoricalColumns =
    profile.column_metadata.filter((column) =>
      [
        "object",
        "string",
        "str",
        "category",
      ].includes(column.dtype.toLowerCase())
    ).length;

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">
          Data Profiling
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          High-level summary of your dataset.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full">
          <tbody className="divide-y divide-slate-800">

            <Row
              label="Rows"
              value={profile.rows.toLocaleString()}
            />

            <Row
              label="Columns"
              value={profile.columns}
            />

            <Row
              label="Numeric Columns"
              value={numericColumns}
            />

            <Row
              label="Categorical Columns"
              value={categoricalColumns}
            />

            <Row
              label="Missing Values"
              value={profile.missing_values.toLocaleString()}
            />

            <Row
              label="Missing Percentage"
              value={percentage(
                profile.missing_values,
                profile.rows *
                  profile.columns
              )}
            />

            <Row
              label="Duplicate Rows"
              value={profile.duplicate_rows}
            />

            <Row
              label="Memory Usage"
              value={`${(
                profile.memory_usage /
                1024 /
                1024
              ).toFixed(2)} MB`}
            />

            <Row
              label="Quality Score"
              value={`${profile.quality_score}%`}
            />

          </tbody>
        </table>
      </div>
    </section>
  );
}

interface RowProps {
  label: string;
  value: string | number;
}

function Row({
  label,
  value,
}: RowProps) {
  return (
    <tr className="hover:bg-slate-900/40 transition">
      <td className="px-6 py-4 text-sm font-medium text-slate-300">
        {label}
      </td>

      <td className="px-6 py-4 text-right text-white font-semibold">
        {value}
      </td>
    </tr>
  );
}

export default ProfileSummary;