import Plot from "react-plotly.js";

import type {
  VisualizationChart,
} from "../../../types/visualization";


interface VisualizationRendererProps {
  chart: VisualizationChart;
}


function hasLongLabels(
  labels: string[],
): boolean {
  return (
    labels.length > 7 ||
    labels.some(
      (label) => label.length > 14,
    )
  );
}


function VisualizationRenderer({
  chart,
}: VisualizationRendererProps) {
  const labels = (
    chart.data.labels ?? []
  ).map(String);

  const values =
    chart.data.values ?? [];

  const useHorizontalBars =
    chart.type === "bar" &&
    hasLongLabels(labels);

  const commonLayout = {
    autosize: true,

    height: useHorizontalBars
      ? Math.max(
          360,
          labels.length * 34,
        )
      : 340,

    margin: {
      l: useHorizontalBars
        ? 190
        : 65,

      r: 30,

      t: 20,

      b: useHorizontalBars
        ? 55
        : 90,
    },

    paper_bgcolor: "#0f172a",

    plot_bgcolor: "#0f172a",

    font: {
      color: "#e2e8f0",
    },

    showlegend:
      chart.type === "pie",
  };

  const commonConfig = {
    responsive: true,

    displaylogo: false,

    modeBarButtonsToRemove: [
      "lasso2d",
      "select2d",
    ],
  };

  const commonStyle = {
    width: "100%",
  };

  // =====================================================
  // HISTOGRAM
  // =====================================================

  if (chart.type === "histogram") {
    return (
      <Plot
        data={[
          {
            type: "histogram",

            x: values,

            hovertemplate:
              "<b>Value</b>: %{x}<br>" +
              "<b>Count</b>: %{y}" +
              "<extra></extra>",
          },
        ]}
        layout={{
          ...commonLayout,

          xaxis: {
            title: {
              text:
                chart.x_label ??
                "Value",
            },

            gridcolor: "#1e293b",

            zeroline: false,

            automargin: true,
          },

          yaxis: {
            title: {
              text:
                chart.y_label ??
                "Frequency",
            },

            gridcolor: "#1e293b",

            zeroline: false,

            automargin: true,
          },
        }}
        config={commonConfig}
        style={commonStyle}
        useResizeHandler
      />
    );
  }

  // =====================================================
  // BAR
  // =====================================================

  if (chart.type === "bar") {
    if (useHorizontalBars) {
      const reversedLabels = [
        ...labels,
      ].reverse();

      const reversedValues = [
        ...values,
      ].reverse();

      return (
        <Plot
          data={[
            {
              type: "bar",

              orientation: "h",

              x: reversedValues,

              y: reversedLabels,

              hovertemplate:
                "<b>%{y}</b><br>" +
                "<b>Count</b>: %{x}" +
                "<extra></extra>",
            },
          ]}
          layout={{
            ...commonLayout,

            xaxis: {
              title: {
                text:
                  chart.y_label ??
                  "Count",
              },

              gridcolor:
                "#1e293b",

              zeroline: false,

              automargin: true,
            },

            yaxis: {
              title: {
                text:
                  chart.x_label ??
                  "Category",
              },

              automargin: true,

              tickfont: {
                size: 11,
              },
            },
          }}
          config={commonConfig}
          style={commonStyle}
          useResizeHandler
        />
      );
    }

    return (
      <Plot
        data={[
          {
            type: "bar",

            x: labels,

            y: values,

            hovertemplate:
              "<b>%{x}</b><br>" +
              "<b>Count</b>: %{y}" +
              "<extra></extra>",
          },
        ]}
        layout={{
          ...commonLayout,

          xaxis: {
            title: {
              text:
                chart.x_label ??
                "Category",
            },

            tickangle: -30,

            automargin: true,

            gridcolor: "#1e293b",

            zeroline: false,
          },

          yaxis: {
            title: {
              text:
                chart.y_label ??
                "Count",
            },

            gridcolor: "#1e293b",

            zeroline: false,

            automargin: true,
          },
        }}
        config={commonConfig}
        style={commonStyle}
        useResizeHandler
      />
    );
  }

  // =====================================================
  // PIE
  // =====================================================

  if (chart.type === "pie") {
    return (
      <Plot
        data={[
          {
            type: "pie",

            labels,

            values,

            textinfo:
              labels.length <= 6
                ? "label+percent"
                : "percent",

            hovertemplate:
              "<b>%{label}</b><br>" +
              "<b>Count</b>: %{value}<br>" +
              "<b>Share</b>: %{percent}" +
              "<extra></extra>",
          },
        ]}
        layout={{
          ...commonLayout,

          height: 360,

          margin: {
            l: 30,
            r: 30,
            t: 20,
            b: 30,
          },

          legend: {
            orientation: "h",

            y: -0.1,

            x: 0.5,

            xanchor: "center",
          },
        }}
        config={commonConfig}
        style={commonStyle}
        useResizeHandler
      />
    );
  }

  // =====================================================
  // SCATTER
  // =====================================================

  if (chart.type === "scatter") {
    return (
      <Plot
        data={[
          {
            type: "scatter",

            mode: "markers",

            x:
              chart.data.x ??
              [],

            y:
              chart.data.y ??
              [],

            marker: {
              size: 6,

              opacity: 0.65,
            },

            hovertemplate:
              `<b>${
                chart.x_label ??
                "X"
              }</b>: %{x}<br>` +
              `<b>${
                chart.y_label ??
                "Y"
              }</b>: %{y}` +
              "<extra></extra>",
          },
        ]}
        layout={{
          ...commonLayout,

          xaxis: {
            title: {
              text:
                chart.x_label ??
                "X",
            },

            gridcolor: "#1e293b",

            zeroline: false,

            automargin: true,
          },

          yaxis: {
            title: {
              text:
                chart.y_label ??
                "Y",
            },

            gridcolor: "#1e293b",

            zeroline: false,

            automargin: true,
          },
        }}
        config={commonConfig}
        style={commonStyle}
        useResizeHandler
      />
    );
  }

  // =====================================================
  // LINE / AREA
  // =====================================================

  if (
    chart.type === "line" ||
    chart.type === "area"
  ) {
    return (
      <Plot
        data={[
          {
            type: "scatter",

            mode: "lines",

            x:
              chart.data.x ??
              [],

            y:
              chart.data.y ??
              [],

            fill:
              chart.type === "area"
                ? "tozeroy"
                : "none",

            hovertemplate:
              `<b>${
                chart.x_label ??
                "X"
              }</b>: %{x}<br>` +
              `<b>${
                chart.y_label ??
                "Y"
              }</b>: %{y}` +
              "<extra></extra>",
          },
        ]}
        layout={{
          ...commonLayout,

          xaxis: {
            title: {
              text:
                chart.x_label ??
                "X",
            },

            gridcolor: "#1e293b",

            zeroline: false,

            automargin: true,
          },

          yaxis: {
            title: {
              text:
                chart.y_label ??
                "Y",
            },

            gridcolor: "#1e293b",

            zeroline: false,

            automargin: true,
          },
        }}
        config={commonConfig}
        style={commonStyle}
        useResizeHandler
      />
    );
  }

  // =====================================================
  // BOX
  // =====================================================

  if (chart.type === "box") {
    return (
      <Plot
        data={[
          {
            type: "box",

            x: values,

            orientation: "h",

            boxpoints: "outliers",

            hovertemplate:
              "<b>Value</b>: %{x}" +
              "<extra></extra>",
          },
        ]}
        layout={{
          ...commonLayout,

          yaxis: {
            visible: false,
          },

          xaxis: {
            title: {
              text:
                chart.x_label ??
                "Value",
            },

            gridcolor: "#1e293b",

            zeroline: false,

            automargin: true,
          },
        }}
        config={commonConfig}
        style={commonStyle}
        useResizeHandler
      />
    );
  }

  // =====================================================
  // UNSUPPORTED
  // =====================================================

  return (
    <div className="flex h-64 items-center justify-center text-sm text-slate-400">
      Unsupported chart type:
      {" "}
      {chart.type}
    </div>
  );
}


export default VisualizationRenderer;