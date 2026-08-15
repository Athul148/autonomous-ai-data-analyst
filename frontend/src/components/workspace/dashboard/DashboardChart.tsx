import Plot from "react-plotly.js";

import type {
  DashboardChart as DashboardChartType,
} from "../../../types/dashboard";


interface DashboardChartProps {
  chart: DashboardChartType;
  compact?: boolean;
}


function hasLongLabels(
  labels: string[],
): boolean {
  return (
    labels.length > 6 ||
    labels.some(
      (label) =>
        label.length > 12,
    )
  );
}


function DashboardChart({
  chart,
  compact = false,
}: DashboardChartProps) {
  const labels =
    chart.data.labels ?? [];

  const values =
    chart.data.values ?? [];

  const useHorizontalBars =
    chart.chart_type === "bar" &&
    hasLongLabels(labels);

  const chartHeight =
    compact
      ? 260
      : 310;

  const commonLayout = {
    autosize: true,
    height: chartHeight,

    margin: {
      l:
        useHorizontalBars
          ? 120
          : 48,
      r: 24,
      t: 10,
      b:
        useHorizontalBars
          ? 45
          : 55,
    },

    paper_bgcolor:
      "rgba(0,0,0,0)",

    plot_bgcolor:
      "rgba(0,0,0,0)",

    font: {
      color: "#cbd5e1",
      size: 12,
    },

    hoverlabel: {
      bgcolor: "#0f172a",
      bordercolor: "#334155",
      font: {
        color: "#f8fafc",
      },
    },

    showlegend: false,
  };

  const commonAxis = {
    gridcolor:
      "rgba(148,163,184,0.10)",

    zeroline: false,

    automargin: true,

    tickfont: {
      color: "#94a3b8",
      size: 11,
    },

    title: {
      font: {
        color: "#94a3b8",
        size: 11,
      },
    },
  };

  const commonConfig = {
    responsive: true,
    displaylogo: false,

    modeBarButtonsToRemove: [
      "lasso2d",
      "select2d",
      "zoom2d",
      "pan2d",
      "zoomIn2d",
      "zoomOut2d",
      "autoScale2d",
    ],

    displayModeBar:
      "hover" as const,
  };

  const commonStyle = {
    width: "100%",
    height: "100%",
  };

  // -----------------------------------------
  // BAR
  // -----------------------------------------

  if (
    chart.chart_type === "bar"
  ) {
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

              marker: {
                color: "#3b82f6",
                line: {
                  width: 0,
                },
              },

              hovertemplate:
                "<b>%{y}</b><br>" +
                "Count: %{x:,}" +
                "<extra></extra>",
            },
          ]}
          layout={{
            ...commonLayout,

            margin: {
              ...commonLayout.margin,
              l: 125,
              b: 35,
            },

            xaxis: {
              ...commonAxis,

              title: {
                ...commonAxis.title,
                text:
                  chart.y_label ??
                  "Count",
              },
            },

            yaxis: {
              ...commonAxis,

              title: {
                ...commonAxis.title,
                text: "",
              },

              gridcolor:
                "rgba(0,0,0,0)",
            },

            bargap: 0.35,
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

            marker: {
              color: "#3b82f6",

              line: {
                width: 0,
              },
            },

            hovertemplate:
              "<b>%{x}</b><br>" +
              "Count: %{y:,}" +
              "<extra></extra>",
          },
        ]}
        layout={{
          ...commonLayout,

          xaxis: {
            ...commonAxis,

            title: {
              ...commonAxis.title,
              text: "",
            },

            gridcolor:
              "rgba(0,0,0,0)",

            tickangle:
              labels.some(
                (label) =>
                  label.length > 8,
              )
                ? -20
                : 0,
          },

          yaxis: {
            ...commonAxis,

            title: {
              ...commonAxis.title,
              text:
                chart.y_label ??
                "Count",
            },
          },

          bargap: 0.3,
        }}
        config={commonConfig}
        style={commonStyle}
        useResizeHandler
      />
    );
  }

  // -----------------------------------------
  // PIE / DONUT
  // -----------------------------------------

  if (
    chart.chart_type === "pie"
  ) {
    return (
      <Plot
        data={[
          {
            type: "pie",

            labels,
            values,

            hole: 0.62,

            sort: false,

            textinfo:
              "percent",

            textposition:
              "inside",

            insidetextorientation:
              "horizontal",

            marker: {
              colors: [
                "#3b82f6",
                "#8b5cf6",
                "#14b8a6",
                "#f59e0b",
                "#ec4899",
              ],

              line: {
                color: "#0f172a",
                width: 2,
              },
            },

            hovertemplate:
              "<b>%{label}</b><br>" +
              "Count: %{value:,}<br>" +
              "Share: %{percent}" +
              "<extra></extra>",
          },
        ]}
        layout={{
          ...commonLayout,

          height:
            compact
              ? 250
              : 300,

          margin: {
            l: 15,
            r: 15,
            t: 5,
            b: 55,
          },

          showlegend: true,

          legend: {
            orientation: "h",

            y: -0.05,
            x: 0.5,

            xanchor:
              "center",

            font: {
              color: "#94a3b8",
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

  // -----------------------------------------
  // HISTOGRAM
  // -----------------------------------------

  if (
    chart.chart_type ===
    "histogram"
  ) {
    return (
      <Plot
        data={[
          {
            type: "histogram",

            x:
              chart.data.values ??
              [],

            nbinsx: 24,

            marker: {
              color: "#3b82f6",

              line: {
                width: 0,
              },
            },

            hovertemplate:
              "Range: %{x}<br>" +
              "Count: %{y}" +
              "<extra></extra>",
          },
        ]}
        layout={{
          ...commonLayout,

          xaxis: {
            ...commonAxis,

            title: {
              ...commonAxis.title,
              text:
                chart.x_label ??
                "",
            },
          },

          yaxis: {
            ...commonAxis,

            title: {
              ...commonAxis.title,
              text:
                chart.y_label ??
                "Frequency",
            },
          },

          bargap: 0.03,
        }}
        config={commonConfig}
        style={commonStyle}
        useResizeHandler
      />
    );
  }

  // -----------------------------------------
  // SCATTER
  // -----------------------------------------

  if (
    chart.chart_type ===
    "scatter"
  ) {
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
              size: 7,

              opacity: 0.7,

              color: "#60a5fa",
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
            ...commonAxis,

            title: {
              ...commonAxis.title,
              text:
                chart.x_label ??
                "",
            },
          },

          yaxis: {
            ...commonAxis,

            title: {
              ...commonAxis.title,
              text:
                chart.y_label ??
                "",
            },
          },
        }}
        config={commonConfig}
        style={commonStyle}
        useResizeHandler
      />
    );
  }

  // -----------------------------------------
  // LINE / AREA
  // -----------------------------------------

  if (
    chart.chart_type === "line" ||
    chart.chart_type === "area"
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
              chart.chart_type ===
              "area"
                ? "tozeroy"
                : "none",

            line: {
              color: "#3b82f6",
              width: 3,
            },

            fillcolor:
              "rgba(59,130,246,0.18)",

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
            ...commonAxis,

            title: {
              ...commonAxis.title,
              text:
                chart.x_label ??
                "",
            },
          },

          yaxis: {
            ...commonAxis,

            title: {
              ...commonAxis.title,
              text:
                chart.y_label ??
                "",
            },
          },
        }}
        config={commonConfig}
        style={commonStyle}
        useResizeHandler
      />
    );
  }

  // -----------------------------------------
  // BOX
  // -----------------------------------------

  if (
    chart.chart_type === "box"
  ) {
    return (
      <Plot
        data={[
          {
            type: "box",

            x:
              chart.data.values ??
              [],

            orientation: "h",

            boxpoints:
              "outliers",

            marker: {
              color: "#60a5fa",
            },

            line: {
              color: "#3b82f6",
            },

            hovertemplate:
              "Value: %{x}" +
              "<extra></extra>",
          },
        ]}
        layout={{
          ...commonLayout,

          height:
            compact
              ? 210
              : 260,

          yaxis: {
            visible: false,
          },

          xaxis: {
            ...commonAxis,

            title: {
              ...commonAxis.title,
              text:
                chart.x_label ??
                "",
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
    <div className="flex h-[240px] items-center justify-center text-sm text-slate-500">
      Unsupported chart type:{" "}
      {chart.chart_type}
    </div>
  );
}


export default DashboardChart;