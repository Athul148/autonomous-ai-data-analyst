import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  CSSProperties,
} from "react";

import Plot from "react-plotly.js";

import {
  Download,
  Filter,
  Lightbulb,
  LoaderCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import {
  toBlob,
} from "html-to-image";

import {
  jsPDF,
} from "jspdf";

import {
  filterDashboard,
} from "../../../api/dashboard.api";

import type {
  DashboardFilterItem,
} from "../../../api/dashboard.api";

import type {
  DashboardChart,
  DashboardContent,
  DashboardKPI,
} from "../../../types/dashboard";

import type {
  DashboardDesign,
  DashboardSlicer,
  DashboardWidget,
} from "../../../types/dashboardDesign";

interface FullDashboardCanvasProps {
  datasetId: number;
  design: DashboardDesign;
}


type SlicerValue =
  | string
  | {
      minimum: number | null;
      maximum: number | null;
    };


type SlicerState = Record<
  string,
  SlicerValue
>;


function positionStyle(
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  },
): CSSProperties {
  return {
    gridColumn:
      `${position.x + 1} / span ${position.w}`,

    gridRow:
      `${position.y + 1} / span ${position.h}`,
  };
}


function normalizedChartType(
  type: string,
) {
  if (type === "donut") {
    return "pie";
  }

  return type;
}


function sameColumns(
  first: string[],
  second: string[],
) {
  if (
    first.length !==
    second.length
  ) {
    return false;
  }

  return first.every(
    (
      column,
      index,
    ) =>
      column ===
      second[index],
  );
}


function findUpdatedKPI(
  widget: DashboardWidget,
  kpis: DashboardKPI[],
) {
  return (
    kpis.find(
      (kpi) =>
        kpi.title ===
        widget.title,
    ) ??
    kpis.find(
      (kpi) =>
        kpi.metric ===
          widget.metric &&
        (
          kpi.column ??
          null
        ) ===
          (
            widget.columns[0] ??
            null
          ),
    )
  );
}


function findUpdatedChart(
  widget: DashboardWidget,
  charts: DashboardChart[],
) {
  return (
    charts.find(
      (chart) =>
        chart.title ===
        widget.title,
    ) ??
    charts.find(
      (chart) =>
        normalizedChartType(
          chart.chart_type,
        ) ===
          normalizedChartType(
            widget.widget_type,
          ) &&
        sameColumns(
          chart.columns,
          widget.columns,
        ),
    )
  );
}


function updateDesignData(
  design: DashboardDesign,
  dashboard: DashboardContent,
): DashboardDesign {
  const widgets =
    design.widgets.map(
      (widget) => {
        if (
          widget.widget_type ===
          "kpi"
        ) {
          const updated =
            findUpdatedKPI(
              widget,
              dashboard.kpis,
            );

          if (!updated) {
            return widget;
          }

          return {
            ...widget,
            value:
              updated.value,
            subtitle:
              updated.subtitle,
          };
        }


        if (
          widget.widget_type ===
          "insight"
        ) {
          return {
            ...widget,

            data: {
              items:
                dashboard.insights
                  .filter(
                    (insight) =>
                      !insight.title.includes(
                        "__",
                      ),
                  )
                  .slice(0, 4)
                  .map(
                    (insight) => ({
                      title:
                        insight.title,
                      value:
                        insight.value,
                      description:
                        insight.description,
                      category:
                        insight.category,
                    }),
                  ),
            },
          };
        }


        const updatedChart =
          findUpdatedChart(
            widget,
            dashboard.charts,
          );

        if (!updatedChart) {
          return widget;
        }

        return {
          ...widget,

          reason:
            updatedChart.reason,

          x_label:
            updatedChart.x_label,

          y_label:
            updatedChart.y_label,

          data:
            updatedChart.data,
        };
      },
    );

  return {
    ...design,
    widgets,
  };
}


function buildDefaultSlicerState(
  slicers: DashboardSlicer[],
): SlicerState {
  const state: SlicerState =
    {};

  slicers.forEach(
    (slicer) => {
      if (
        slicer.filter_type ===
        "categorical"
      ) {
        state[
          slicer.id
        ] = "";
      }

      if (
        slicer.filter_type ===
        "numeric_range"
      ) {
        state[
          slicer.id
        ] = {
          minimum:
            slicer.minimum,

          maximum:
            slicer.maximum,
        };
      }
    },
  );

  return state;
}


function FullDashboardCanvas({
  datasetId,
  design,
}: FullDashboardCanvasProps) {
  const [
    renderedDesign,
    setRenderedDesign,
  ] =
    useState<DashboardDesign>(
      design,
    );

  const [
    slicerState,
    setSlicerState,
  ] =
    useState<SlicerState>(
      () =>
        buildDefaultSlicerState(
          design.slicers,
        ),
    );

  const [
    filtering,
    setFiltering,
  ] =
    useState(false);

  const [
    filterError,
    setFilterError,
  ] =
    useState("");

  const [
    filteredRows,
    setFilteredRows,
  ] =
    useState<number | null>(
      null,
    );

  const dashboardRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    exporting,
    setExporting,
  ] =
    useState(false);

  const [
    exportingPdf,
    setExportingPdf,
  ] =
    useState(false);


  useEffect(() => {
    setRenderedDesign(
      design,
    );

    setSlicerState(
      buildDefaultSlicerState(
        design.slicers,
      ),
    );

    setFilteredRows(null);
    setFilterError("");
  }, [design]);


  function buildPayload(
    state: SlicerState,
  ): DashboardFilterItem[] {
    const filters:
      DashboardFilterItem[] =
      [];

    renderedDesign.slicers.forEach(
      (slicer) => {
        const value =
          state[
            slicer.id
          ];


        if (
          slicer.filter_type ===
          "categorical" &&
          typeof value ===
            "string" &&
          value !== ""
        ) {
          filters.push({
            filter_type:
              "categorical",

            column:
              slicer.column,

            value,
          });

          return;
        }


        if (
          slicer.filter_type ===
            "numeric_range" &&
          typeof value ===
            "object" &&
          value !== null
        ) {
          const isDefault =
            value.minimum ===
              slicer.minimum &&
            value.maximum ===
              slicer.maximum;

          if (!isDefault) {
            filters.push({
              filter_type:
                "numeric_range",

              column:
                slicer.column,

              minimum:
                value.minimum,

              maximum:
                value.maximum,
            });
          }
        }
      },
    );

    return filters;
  }


  async function applyFilters(
    nextState: SlicerState,
  ) {
    setFiltering(true);
    setFilterError("");

    try {
      const response =
        await filterDashboard(
          datasetId,
          {
            filters:
              buildPayload(
                nextState,
              ),
          },
        );

      setRenderedDesign(
        updateDesignData(
          design,
          response.dashboard,
        ),
      );

      setFilteredRows(
        response.filtered_rows,
      );
    } catch {
      setFilterError(
        "No matching dashboard data was found for the selected filters.",
      );
    } finally {
      setFiltering(false);
    }
  }


  function handleCategoricalChange(
    slicer: DashboardSlicer,
    value: string,
  ) {
    setSlicerState(
      (current) => ({
        ...current,
        [slicer.id]: value,
      }),
    );
  }


  function handleRangeChange(
    slicer: DashboardSlicer,
    field:
      | "minimum"
      | "maximum",
    value: number | null,
  ) {
    const current =
      slicerState[
        slicer.id
      ];

    const range =
      typeof current ===
        "object"
        ? current
        : {
            minimum:
              slicer.minimum,
            maximum:
              slicer.maximum,
          };

    const nextState = {
      ...slicerState,

      [slicer.id]: {
        ...range,
        [field]:
          value,
      },
    };

    setSlicerState(
      nextState,
    );
  }


  function handleApplyFilters() {
    void applyFilters(
      slicerState,
    );
  }


  async function resetFilters() {
    const defaultState =
      buildDefaultSlicerState(
        design.slicers,
      );

    setSlicerState(
      defaultState,
    );

    setFiltering(true);
    setFilterError("");

    try {
      const response =
        await filterDashboard(
          datasetId,
          {
            filters: [],
          },
        );

      setRenderedDesign(
        updateDesignData(
          design,
          response.dashboard,
        ),
      );

      setFilteredRows(null);
    } catch {
      setFilterError(
        "Unable to reset dashboard filters.",
      );
    } finally {
      setFiltering(false);
    }
  }


  const theme =
    renderedDesign.theme;


  const maximumRow =
    Math.max(
      12,

      ...renderedDesign.widgets.map(
        (widget) =>
          widget.position.y +
          widget.position.h,
      ),

      ...renderedDesign.slicers.map(
        (slicer) =>
          slicer.position.y +
          slicer.position.h,
      ),
    );


  async function handleDownloadPNG() {
    if (
      !dashboardRef.current ||
      exporting ||
      filtering
    ) {
      return;
    }

    setExporting(true);
    setFilterError("");

    try {
      /*
       * Give Plotly/browser layout a short moment
       * to settle before capturing the dashboard.
       */
      await new Promise<void>(
        (resolve) => {
          window.requestAnimationFrame(
            () => {
              window.requestAnimationFrame(
                () => resolve(),
              );
            },
          );
        },
      );

      const blob =
        await toBlob(
          dashboardRef.current,
          {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor:
              theme.background,

            /*
             * Keep screen controls out of the
             * exported dashboard image.
             */
            filter: (node) => {
              if (
                node instanceof
                HTMLElement
              ) {
                return (
                  node.dataset
                    .exportIgnore !==
                  "true"
                );
              }

              return true;
            },
          },
        );

      if (!blob) {
        throw new Error(
          "PNG blob was not generated.",
        );
      }

      /*
       * Force the downloaded file to use the
       * correct PNG MIME type.
       */
      const pngBlob =
        new Blob(
          [blob],
          {
            type: "image/png",
          },
        );

      const objectUrl =
        URL.createObjectURL(
          pngBlob,
        );

      const safeTitle =
        renderedDesign.title
          .replace(
            /[^a-zA-Z0-9]+/g,
            "_",
          )
          .replace(
            /^_+|_+$/g,
            "",
          );

      const fileName =
        `${
          safeTitle ||
          "AI_Dashboard"
        }_Design_${
          renderedDesign.design_number
        }.png`;

      const link =
        document.createElement(
          "a",
        );

      link.href =
        objectUrl;

      link.download =
        fileName;

      document.body.appendChild(
        link,
      );

      link.click();

      document.body.removeChild(
        link,
      );

      window.setTimeout(
        () => {
          URL.revokeObjectURL(
            objectUrl,
          );
        },
        1000,
      );
    } catch (error) {
      console.error(
        "Dashboard PNG export failed:",
        error,
      );

      setFilterError(
        "Unable to export the dashboard as PNG.",
      );
    } finally {
      setExporting(false);
    }
  }


  async function handleDownloadPDF() {
    if (
      !dashboardRef.current ||
      exportingPdf ||
      filtering
    ) {
      return;
    }

    setExportingPdf(true);
    setFilterError("");

    let imageUrl: string | null =
      null;

    try {
      /*
       * Allow Plotly and browser layout to settle
       * before capturing the current dashboard state.
       */
      await new Promise<void>(
        (resolve) => {
          window.requestAnimationFrame(
            () => {
              window.requestAnimationFrame(
                () => resolve(),
              );
            },
          );
        },
      );

      const blob =
        await toBlob(
          dashboardRef.current,
          {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor:
              theme.background,

            /*
             * Exclude dashboard controls from the
             * exported report.
             */
            filter: (node) => {
              if (
                node instanceof
                HTMLElement
              ) {
                return (
                  node.dataset
                    .exportIgnore !==
                  "true"
                );
              }

              return true;
            },
          },
        );

      if (!blob) {
        throw new Error(
          "Dashboard image could not be generated.",
        );
      }

      const pngBlob =
        new Blob(
          [blob],
          {
            type: "image/png",
          },
        );

      imageUrl =
        URL.createObjectURL(
          pngBlob,
        );

      const image =
        new Image();

      await new Promise<void>(
        (
          resolve,
          reject,
        ) => {
          image.onload =
            () => resolve();

          image.onerror =
            () =>
              reject(
                new Error(
                  "Unable to load dashboard image.",
                ),
              );

          image.src =
            imageUrl as string;
        },
      );

      const imageWidth =
        image.naturalWidth;

      const imageHeight =
        image.naturalHeight;

      if (
        imageWidth <= 0 ||
        imageHeight <= 0
      ) {
        throw new Error(
          "Dashboard image dimensions are invalid.",
        );
      }

      const pdf =
        new jsPDF({
          orientation:
            "landscape",
          unit: "mm",
          format: "a4",
        });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 8;

      const availableWidth =
        pageWidth -
        margin * 2;

      const availableHeight =
        pageHeight -
        margin * 2;

      const widthRatio =
        availableWidth /
        imageWidth;

      const heightRatio =
        availableHeight /
        imageHeight;

      const scale =
        Math.min(
          widthRatio,
          heightRatio,
        );

      const finalWidth =
        imageWidth *
        scale;

      const finalHeight =
        imageHeight *
        scale;

      const x =
        (
          pageWidth -
          finalWidth
        ) / 2;

      const y =
        (
          pageHeight -
          finalHeight
        ) / 2;

      pdf.addImage(
        imageUrl,
        "PNG",
        x,
        y,
        finalWidth,
        finalHeight,
        undefined,
        "FAST",
      );

      const safeTitle =
        renderedDesign.title
          .replace(
            /[^a-zA-Z0-9]+/g,
            "_",
          )
          .replace(
            /^_+|_+$/g,
            "",
          );

      const fileName =
        `${
          safeTitle ||
          "AI_Dashboard"
        }_Design_${
          renderedDesign.design_number
        }.pdf`;

      pdf.save(
        fileName,
      );
    } catch (error) {
      console.error(
        "Dashboard PDF export failed:",
        error,
      );

      setFilterError(
        "Unable to export the dashboard as PDF.",
      );
    } finally {
      if (imageUrl) {
        URL.revokeObjectURL(
          imageUrl,
        );
      }

      setExportingPdf(false);
    }
  }


  function FullSlicer({
    slicer,
  }: {
    slicer: DashboardSlicer;
  }) {
    const value =
      slicerState[
        slicer.id
      ];


    return (
      <div
        style={{
          ...positionStyle(
            slicer.position,
          ),

          background:
            theme.surface_secondary,

          borderColor:
            theme.border,
        }}
        className="min-h-0 overflow-hidden rounded-lg border p-3"
      >
        <div className="flex items-center gap-2">
          <Filter
            size={14}
            style={{
              color:
                theme.accent,
            }}
          />

          <p
            className="truncate text-xs font-semibold"
            style={{
              color:
                theme.text_primary,
            }}
          >
            {slicer.title}
          </p>
        </div>


        {slicer.filter_type ===
          "categorical" && (
          <select
            value={
              typeof value ===
              "string"
                ? value
                : ""
            }
            onChange={(
              event,
            ) =>
              handleCategoricalChange(
                slicer,
                event.target.value,
              )
            }
            disabled={
              filtering
            }
            className="mt-2 w-full rounded-md border px-2 py-1.5 text-xs outline-none disabled:opacity-60"
            style={{
              background:
                theme.background,

              borderColor:
                theme.border,

              color:
                theme.text_primary,
            }}
          >
            <option value="">
              All
            </option>

            {slicer.options.map(
              (
                option,
                index,
              ) => (
                <option
                  key={index}
                  value={String(
                    option.value,
                  )}
                >
                  {
                    option.label
                  }
                </option>
              ),
            )}
          </select>
        )}


        {slicer.filter_type ===
          "numeric_range" &&
          typeof value ===
            "object" && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              type="number"
              value={
                value.minimum ??
                ""
              }
              min={
                slicer.minimum ??
                undefined
              }
              max={
                value.maximum ??
                slicer.maximum ??
                undefined
              }
              disabled={
                filtering
              }
              onChange={(
                event,
              ) =>
                handleRangeChange(
                  slicer,
                  "minimum",
                  event.target.value ===
                    ""
                    ? null
                    : Number(
                        event.target.value,
                      ),
                )
              }
              className="min-w-0 rounded-md border px-2 py-1.5 text-xs outline-none disabled:opacity-60"
              style={{
                background:
                  theme.background,

                borderColor:
                  theme.border,

                color:
                  theme.text_primary,
              }}
            />


            <input
              type="number"
              value={
                value.maximum ??
                ""
              }
              min={
                value.minimum ??
                slicer.minimum ??
                undefined
              }
              max={
                slicer.maximum ??
                undefined
              }
              disabled={
                filtering
              }
              onChange={(
                event,
              ) =>
                handleRangeChange(
                  slicer,
                  "maximum",
                  event.target.value ===
                    ""
                    ? null
                    : Number(
                        event.target.value,
                      ),
                )
              }
              className="min-w-0 rounded-md border px-2 py-1.5 text-xs outline-none disabled:opacity-60"
              style={{
                background:
                  theme.background,

                borderColor:
                  theme.border,

                color:
                  theme.text_primary,
              }}
            />
          </div>
        )}
      </div>
    );
  }


  function KPIWidget({
    widget,
  }: {
    widget: DashboardWidget;
  }) {
    return (
      <div
        style={{
          ...positionStyle(
            widget.position,
          ),

          background:
            theme.surface,

          borderColor:
            theme.border,
        }}
        className="relative min-h-0 overflow-hidden rounded-lg border p-4"
      >
        <div
          className="absolute left-0 top-0 h-full w-1"
          style={{
            background:
              theme.accent,
          }}
        />

        <p
          className="truncate text-xs font-semibold uppercase tracking-wide"
          style={{
            color:
              theme.text_secondary,
          }}
        >
          {widget.title}
        </p>

        <p
          className="mt-2 truncate text-2xl font-bold"
          style={{
            color:
              theme.text_primary,
          }}
        >
          {widget.value}
        </p>

        {widget.subtitle && (
          <p
            className="mt-1 truncate text-xs"
            style={{
              color:
                theme.text_secondary,
            }}
          >
            {widget.subtitle}
          </p>
        )}
      </div>
    );
  }


  function InsightWidget({
    widget,
  }: {
    widget: DashboardWidget;
  }) {
    const items =
      (
        widget.data.items as
          | Array<{
              title?: string;
              value?: string;
              description?: string;
            }>
          | undefined
      ) ?? [];

    return (
      <div
        style={{
          ...positionStyle(
            widget.position,
          ),

          background:
            theme.surface_secondary,

          borderColor:
            theme.border,
        }}
        className="min-h-0 overflow-hidden rounded-lg border p-4"
      >
        <div className="flex items-center gap-2">
          <Lightbulb
            size={16}
            style={{
              color:
                theme.accent,
            }}
          />

          <p
            className="text-sm font-semibold"
            style={{
              color:
                theme.text_primary,
            }}
          >
            AI Insights
          </p>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {items.map(
            (
              item,
              index,
            ) => (
              <div
                key={index}
                className="min-w-0"
              >
                <div className="flex items-center gap-2">
                  {item.value && (
                    <span
                      className="font-bold"
                      style={{
                        color:
                          theme.accent,
                      }}
                    >
                      {item.value}
                    </span>
                  )}

                  <span
                    className="truncate text-xs font-semibold"
                    style={{
                      color:
                        theme.text_primary,
                    }}
                  >
                    {item.title}
                  </span>
                </div>

                {item.description && (
                  <p
                    className="mt-1 line-clamp-2 text-[11px] leading-4"
                    style={{
                      color:
                        theme.text_secondary,
                    }}
                  >
                    {
                      item.description
                    }
                  </p>
                )}
              </div>
            ),
          )}
        </div>
      </div>
    );
  }


  function ChartWidget({
    widget,
  }: {
    widget: DashboardWidget;
  }) {
    const labels =
      (
        widget.data.labels as
          | Array<
              string | number
            >
          | undefined
      ) ?? [];

    const values =
      (
        widget.data.values as
          | number[]
          | undefined
      ) ?? [];

    const x =
      (
        widget.data.x as
          | Array<
              string | number
            >
          | undefined
      ) ?? [];

    const y =
      (
        widget.data.y as
          | Array<
              string | number
            >
          | undefined
      ) ?? [];


    const layout = {
      autosize: true,

      margin: {
        l: 45,
        r: 15,
        t: 15,
        b: 45,
      },

      paper_bgcolor:
        theme.surface,

      plot_bgcolor:
        theme.surface,

      font: {
        color:
          theme.text_secondary,

        size: 10,
      },

      xaxis: {
        title: {
          text:
            widget.x_label ??
            "",
        },

        gridcolor:
          theme.border,

        zeroline: false,

        automargin: true,
      },

      yaxis: {
        title: {
          text:
            widget.y_label ??
            "",
        },

        gridcolor:
          theme.border,

        zeroline: false,

        automargin: true,
      },
    };


    const config = {
      responsive: true,
      displaylogo: false,
      displayModeBar: false,
    };


    let data: any[] = [];


    if (
      widget.widget_type ===
      "bar"
    ) {
      data = [
        {
          type: "bar",

          x: labels,
          y: values,

          marker: {
            color:
              theme.accent,
          },
        },
      ];
    }


    if (
      widget.widget_type ===
        "donut" ||
      widget.widget_type ===
        "pie"
    ) {
      data = [
        {
          type: "pie",

          labels,
          values,

          hole:
            widget.widget_type ===
            "donut"
              ? 0.58
              : 0,

          marker: {
            colors: [
              theme.accent,
              theme.accent_secondary,
              "#8b5cf6",
              "#f59e0b",
              "#10b981",
              "#ef4444",
            ],
          },

          textinfo:
            "percent",
        },
      ];
    }


    if (
      widget.widget_type ===
      "histogram"
    ) {
      data = [
        {
          type:
            "histogram",

          x: values,

          marker: {
            color:
              theme.accent,
          },
        },
      ];
    }


    if (
      widget.widget_type ===
      "scatter"
    ) {
      data = [
        {
          type:
            "scatter",

          mode:
            "markers",

          x,
          y,

          marker: {
            color:
              theme.accent,
            size: 7,
            opacity: 0.65,
          },
        },
      ];
    }


    if (
      widget.widget_type ===
        "line" ||
      widget.widget_type ===
        "area"
    ) {
      data = [
        {
          type:
            "scatter",

          mode:
            "lines",

          x:
            x.length > 0
              ? x
              : labels,

          y:
            y.length > 0
              ? y
              : values,

          line: {
            color:
              theme.accent,
            width: 3,
          },

          fill:
            widget.widget_type ===
            "area"
              ? "tozeroy"
              : "none",
        },
      ];
    }


    if (
      widget.widget_type ===
      "box"
    ) {
      data = [
        {
          type: "box",

          x: values,

          orientation:
            "h",

          marker: {
            color:
              theme.accent,
          },

          line: {
            color:
              theme.accent,
          },

          boxpoints:
            "outliers",
        },
      ];
    }


    return (
      <div
        style={{
          ...positionStyle(
            widget.position,
          ),

          background:
            theme.surface,

          borderColor:
            theme.border,
        }}
        className="flex min-h-0 flex-col overflow-hidden rounded-lg border"
      >
        <div
          className="border-b px-4 py-3"
          style={{
            borderColor:
              theme.border,
          }}
        >
          <p
            className="truncate text-sm font-semibold"
            style={{
              color:
                theme.text_primary,
            }}
          >
            {widget.title}
          </p>

          {widget.reason && (
            <p
              className="mt-1 truncate text-[10px]"
              style={{
                color:
                  theme.text_secondary,
              }}
            >
              {widget.reason}
            </p>
          )}
        </div>

        <div className="min-h-0 flex-1 p-2">
          <Plot
            data={
              data as any
            }
            layout={
              layout as any
            }
            config={
              config as any
            }
            style={{
              width: "100%",
              height: "100%",
            }}
            useResizeHandler
          />
        </div>
      </div>
    );
  }


  return (
    <div
      ref={
        dashboardRef
      }
      className="relative overflow-hidden rounded-2xl border shadow-2xl"
      style={{
        background:
          theme.background,

        borderColor:
          theme.border,
      }}
    >
      <div
        className="flex flex-col gap-4 border-b px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
        style={{
          borderColor:
            theme.border,

          background:
            theme.surface,
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <Sparkles
              size={16}
              style={{
                color:
                  theme.accent,
              }}
            />

            <span
              className="text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{
                color:
                  theme.accent,
              }}
            >
              AI Generated Dashboard
            </span>
          </div>

          <h2
            className="mt-2 text-2xl font-bold"
            style={{
              color:
                theme.text_primary,
            }}
          >
            {
              renderedDesign.title
            }
          </h2>

          {renderedDesign.subtitle && (
            <p
              className="mt-1 text-sm"
              style={{
                color:
                  theme.text_secondary,
              }}
            >
              {
                renderedDesign.subtitle
              }
            </p>
          )}
        </div>


        <div className="flex flex-wrap items-center gap-3">
          {filteredRows !==
            null && (
            <div
              className="rounded-lg px-3 py-2 text-xs font-semibold"
              style={{
                background:
                  theme.surface_secondary,

                color:
                  theme.text_secondary,
              }}
            >
              {filteredRows.toLocaleString()}
              {" "}
              filtered rows
            </div>
          )}

          <button
            type="button"
            onClick={
              handleDownloadPNG
            }
            disabled={
              exporting ||
              filtering
            }
            data-export-ignore="true"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50"
            style={{
              borderColor:
                theme.border,

              background:
                theme.surface_secondary,

              color:
                theme.text_primary,
            }}
          >
            <Download
              size={13}
            />

            {exporting
              ? "Exporting..."
              : "Download PNG"}
          </button>

          <button
            type="button"
            onClick={
              handleDownloadPDF
            }
            disabled={
              exportingPdf ||
              filtering
            }
            data-export-ignore="true"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50"
            style={{
              borderColor:
                theme.border,

              background:
                theme.surface_secondary,

              color:
                theme.text_primary,
            }}
          >
            <Download
              size={13}
            />

            {exportingPdf
              ? "Exporting PDF..."
              : "Download PDF"}
          </button>

          <button
            type="button"
            onClick={
              handleApplyFilters
            }
            data-export-ignore="true"
            disabled={
              filtering
            }
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition disabled:opacity-50"
            style={{
              background:
                theme.accent,
            }}
          >
            <Filter
              size={13}
            />

            Apply Filters
          </button>

          <button
            type="button"
            onClick={
              resetFilters
            }
            disabled={
              filtering
            }
            data-export-ignore="true"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50"
            style={{
              borderColor:
                theme.border,

              background:
                theme.surface_secondary,

              color:
                theme.text_primary,
            }}
          >
            <RotateCcw
              size={13}
            />

            Reset Filters
          </button>

          <div
            className="rounded-lg px-3 py-2 text-xs font-semibold"
            style={{
              background:
                theme.surface_secondary,

              color:
                theme.accent,
            }}
          >
            Design{" "}
            {
              renderedDesign.design_number
            }
          </div>
        </div>
      </div>


      {filterError && (
        <div className="border-b border-red-900 bg-red-950/20 px-5 py-3 text-xs text-red-300">
          {filterError}
        </div>
      )}


      <div
        className="grid gap-3 p-5"
        style={{
          gridTemplateColumns:
            "repeat(12, minmax(0, 1fr))",

          gridTemplateRows:
            `repeat(${maximumRow}, minmax(54px, auto))`,
        }}
      >
        {renderedDesign.slicers.map(
          (slicer) => (
            <FullSlicer
              key={
                slicer.id
              }
              slicer={
                slicer
              }
            />
          ),
        )}


        {renderedDesign.widgets.map(
          (widget) => {
            if (
              widget.widget_type ===
              "kpi"
            ) {
              return (
                <KPIWidget
                  key={
                    widget.id
                  }
                  widget={
                    widget
                  }
                />
              );
            }


            if (
              widget.widget_type ===
              "insight"
            ) {
              return (
                <InsightWidget
                  key={
                    widget.id
                  }
                  widget={
                    widget
                  }
                />
              );
            }


            return (
              <ChartWidget
                key={
                  widget.id
                }
                widget={
                  widget
                }
              />
            );
          },
        )}
      </div>


      {filtering && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
          <div
            className="flex items-center gap-3 rounded-xl border px-4 py-3"
            style={{
              background:
                theme.surface,

              borderColor:
                theme.border,

              color:
                theme.text_primary,
            }}
          >
            <LoaderCircle
              size={17}
              className="animate-spin"
              style={{
                color:
                  theme.accent,
              }}
            />

            <span className="text-sm font-medium">
              Updating dashboard...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


export default FullDashboardCanvas;