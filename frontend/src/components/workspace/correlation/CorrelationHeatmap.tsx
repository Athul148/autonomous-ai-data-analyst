import Plot from "react-plotly.js";

import ChartCard from "../../charts/ChartCard";

interface CorrelationHeatmapProps {
  matrix: Record<string, Record<string, number>>;
}

function CorrelationHeatmap({
  matrix,
}: CorrelationHeatmapProps) {
  const columns = Object.keys(matrix);

  const values = columns.map((row) =>
    columns.map((column) => matrix[row]?.[column] ?? 0),
  );

  return (
    <ChartCard
      title="Correlation Heatmap"
      subtitle="Relationship strength between numeric variables"
    >
      <Plot
        data={[
          {
            type: "heatmap",
            x: columns,
            y: columns,
            z: values,
            zmin: -1,
            zmax: 1,
            colorscale: "RdBu",
            reversescale: true,
            hovertemplate:
              "<b>%{y}</b> vs <b>%{x}</b><br>" +
              "Correlation: %{z:.3f}<extra></extra>",
            colorbar: {
              title: {
                text: "Correlation",
              },
            },
          },
        ]}
        layout={{
          autosize: true,
          height: Math.max(500, columns.length * 55),
          margin: {
            l: 130,
            r: 40,
            t: 20,
            b: 130,
          },
          paper_bgcolor: "#0f172a",
          plot_bgcolor: "#0f172a",
          font: {
            color: "#e2e8f0",
          },
          xaxis: {
            tickangle: -45,
            automargin: true,
          },
          yaxis: {
            autorange: "reversed",
            automargin: true,
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
        useResizeHandler
      />
    </ChartCard>
  );
}

export default CorrelationHeatmap;