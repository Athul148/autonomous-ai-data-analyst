import Plot from "react-plotly.js";

interface HistogramChartProps {
  title: string;
  counts: number[];
  binEdges: number[];
}

function HistogramChart({
  title,
  counts,
  binEdges,
}: HistogramChartProps) {
  const centers = binEdges
    .slice(0, -1)
    .map(
      (edge, index) =>
        (edge + binEdges[index + 1]) / 2,
    );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-4 text-lg font-semibold text-white">
        {title}
      </h3>

      <Plot
        data={[
          {
            type: "bar",
            x: centers,
            y: counts,
            hovertemplate:
              "<b>Range</b>: %{x}<br>" +
              "<b>Count</b>: %{y}<extra></extra>",
          },
        ]}
        layout={{
          autosize: true,
          height: 360,
          margin: {
            l: 50,
            r: 20,
            t: 20,
            b: 50,
          },
          paper_bgcolor: "#0f172a",
          plot_bgcolor: "#0f172a",
          font: {
            color: "#e2e8f0",
          },
          xaxis: {
            title: "Value",
            gridcolor: "#1e293b",
            zeroline: false,
          },
          yaxis: {
            title: "Frequency",
            gridcolor: "#1e293b",
            zeroline: false,
          },
        }}
        config={{
          responsive: true,
          displaylogo: false,
          modeBarButtonsToRemove: [
            "lasso2d",
            "select2d",
          ],
        }}
        style={{
          width: "100%",
        }}
      />
    </div>
  );
}

export default HistogramChart;