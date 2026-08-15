import Plot from "react-plotly.js";

import type { BoxPlotData } from "../../types/distribution";
import ChartCard from "./ChartCard";

interface BoxPlotChartProps {
  title: string;
  boxPlot: BoxPlotData;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function BoxPlotChart({
  title,
  boxPlot,
}: BoxPlotChartProps) {
  const {
    min,
    q1,
    median,
    q3,
    max,
  } = boxPlot;

  const spread = Math.max(max - min, 1);

  return (
    <ChartCard
      title={title}
      subtitle="Five-number distribution summary"
    >
      <Plot
        data={[
          {
            type: "scatter",
            mode: "markers",
            x: [min, q1, median, q3, max],
            y: [0, 0, 0, 0, 0],
            marker: {
              size: 8,
              opacity: 0,
            },
            hovertemplate:
              "<b>Value</b>: %{x:,.2f}<extra></extra>",
            showlegend: false,
          },
        ]}
        layout={{
          autosize: true,
          height: 300,
          margin: {
            l: 30,
            r: 30,
            t: 20,
            b: 60,
          },
          paper_bgcolor: "#0f172a",
          plot_bgcolor: "#0f172a",
          font: {
            color: "#e2e8f0",
          },
          showlegend: false,
          xaxis: {
            title: {
              text: "Value",
            },
            range: [
              min - spread * 0.05,
              max + spread * 0.05,
            ],
            gridcolor: "#1e293b",
            zeroline: false,
            automargin: true,
          },
          yaxis: {
            range: [-1, 1],
            visible: false,
            fixedrange: true,
          },
          shapes: [
            {
              type: "line",
              x0: min,
              x1: q1,
              y0: 0,
              y1: 0,
              line: {
                color: "#38bdf8",
                width: 2,
              },
            },
            {
              type: "line",
              x0: q3,
              x1: max,
              y0: 0,
              y1: 0,
              line: {
                color: "#38bdf8",
                width: 2,
              },
            },
            {
              type: "line",
              x0: min,
              x1: min,
              y0: -0.3,
              y1: 0.3,
              line: {
                color: "#38bdf8",
                width: 2,
              },
            },
            {
              type: "line",
              x0: max,
              x1: max,
              y0: -0.3,
              y1: 0.3,
              line: {
                color: "#38bdf8",
                width: 2,
              },
            },
            {
              type: "rect",
              x0: q1,
              x1: q3,
              y0: -0.45,
              y1: 0.45,
              fillcolor: "rgba(59, 130, 246, 0.35)",
              line: {
                color: "#38bdf8",
                width: 2,
              },
            },
            {
              type: "line",
              x0: median,
              x1: median,
              y0: -0.45,
              y1: 0.45,
              line: {
                color: "#f8fafc",
                width: 3,
              },
            },
          ],
        }}
        config={{
          responsive: true,
          displaylogo: false,
          displayModeBar: false,
        }}
        style={{
          width: "100%",
          height: "300px",
        }}
        useResizeHandler
      />

      <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-5 sm:grid-cols-5">
        {[
          ["Min", min],
          ["Q1", q1],
          ["Median", median],
          ["Q3", q3],
          ["Max", max],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="text-center"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {label}
            </p>

            <p className="mt-1 text-lg font-bold text-white">
              {formatNumber(Number(value))}
            </p>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export default BoxPlotChart;