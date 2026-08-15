import Plot from "react-plotly.js";

import ChartCard from "./ChartCard";

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
    .map((edge, index) => {
      return (edge + binEdges[index + 1]) / 2;
    });

  const widths = binEdges
    .slice(0, -1)
    .map((edge, index) => {
      return binEdges[index + 1] - edge;
    });

  return (
    <ChartCard
      title={title}
      subtitle="Frequency distribution across value ranges"
    >
      <Plot
        data={[
          {
            type: "bar",
            x: centers,
            y: counts,
            width: widths,
            hovertemplate:
              "<b>Value</b>: %{x:.2f}<br>" +
              "<b>Frequency</b>: %{y:,}<extra></extra>",
          },
        ]}
        layout={{
          autosize: true,
          height: 360,
          margin: {
            l: 60,
            r: 20,
            t: 10,
            b: 55,
          },
          paper_bgcolor: "#0f172a",
          plot_bgcolor: "#0f172a",
          font: {
            color: "#e2e8f0",
          },
          bargap: 0.04,
          xaxis: {
            title: {
              text: "Value",
            },
            gridcolor: "#1e293b",
            zeroline: false,
          },
          yaxis: {
            title: {
              text: "Frequency",
            },
            gridcolor: "#1e293b",
            zeroline: false,
          },
          showlegend: false,
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
        useResizeHandler
      />
    </ChartCard>
  );
}

export default HistogramChart;