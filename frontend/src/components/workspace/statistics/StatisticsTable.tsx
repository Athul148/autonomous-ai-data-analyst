import type { StatisticsResponse } from "../../../types/statistics";

interface StatisticsTableProps {
  statistics: StatisticsResponse;
}

function format(value: number) {
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function StatisticsTable({
  statistics,
}: StatisticsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
      <table className="min-w-full table-fixed">
        <thead className="bg-slate-800 text-slate-300">
          <tr>
            <th className="w-56 px-6 py-4 text-left font-semibold">
              Column
            </th>

            <th className="px-4 py-4 text-center font-semibold">
              Mean
            </th>

            <th className="px-4 py-4 text-center font-semibold">
              Median
            </th>

            <th className="px-4 py-4 text-center font-semibold">
              Std Dev
            </th>

            <th className="px-4 py-4 text-center font-semibold">
              Min
            </th>

            <th className="px-4 py-4 text-center font-semibold">
              Max
            </th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(statistics).map(
            ([column, stat]) => (
              <tr
                key={column}
                className="border-t border-slate-800 hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-white">
                  {column}
                </td>

                <td className="px-4 py-4 text-center text-slate-300">
                  {format(stat.mean)}
                </td>

                <td className="px-4 py-4 text-center text-slate-300">
                  {format(stat.median)}
                </td>

                <td className="px-4 py-4 text-center text-slate-300">
                  {format(stat.std)}
                </td>

                <td className="px-4 py-4 text-center text-slate-300">
                  {format(stat.min)}
                </td>

                <td className="px-4 py-4 text-center text-slate-300">
                  {format(stat.max)}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StatisticsTable;