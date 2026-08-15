import type {
  CSSProperties,
} from "react";

import {
  BarChart3,
  Filter,
  Lightbulb,
} from "lucide-react";

import type {
  DashboardDesign,
  DashboardWidget,
} from "../../types/dashboardDesign";


interface DashboardDesignPreviewProps {
  design: DashboardDesign;
  selected?: boolean;
  onSelect?: () => void;
}


function getWidgetStyle(
  widget: DashboardWidget,
): CSSProperties {
  return {
    gridColumn: `${
      widget.position.x + 1
    } / span ${widget.position.w}`,

    gridRow: `${
      widget.position.y + 1
    } / span ${widget.position.h}`,
  };
}


function getSlicerStyle(
  x: number,
  y: number,
  w: number,
  h: number,
): CSSProperties {
  return {
    gridColumn: `${
      x + 1
    } / span ${w}`,

    gridRow: `${
      y + 1
    } / span ${h}`,
  };
}


function MiniBarChart({
  widget,
  accent,
  textSecondary,
}: {
  widget: DashboardWidget;
  accent: string;
  textSecondary: string;
}) {
  const labels = (
    widget.data.labels as string[] | undefined
  ) ?? [];

  const values = (
    widget.data.values as number[] | undefined
  ) ?? [];

  const maxValue =
    values.length > 0
      ? Math.max(...values)
      : 1;

  const items = labels
    .slice(0, 6)
    .map((label, index) => ({
      label,
      value:
        values[index] ?? 0,
    }));

  return (
    <div className="mt-2 flex flex-1 items-end gap-1.5 overflow-hidden">
      {items.map(
        (item) => {
          const height =
            maxValue > 0
              ? Math.max(
                  10,
                  (
                    item.value /
                    maxValue
                  ) * 100,
                )
              : 10;

          return (
            <div
              key={
                item.label
              }
              className="flex min-w-0 flex-1 flex-col justify-end"
            >
              <div className="flex h-14 items-end">
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${height}%`,
                    background:
                      accent,
                    opacity: 0.9,
                  }}
                />
              </div>

              <p
                className="mt-1 truncate text-center text-[6px]"
                style={{
                  color:
                    textSecondary,
                }}
              >
                {item.label}
              </p>
            </div>
          );
        },
      )}
    </div>
  );
}


function MiniDonutChart({
  widget,
  accent,
  accentSecondary,
  textPrimary,
}: {
  widget: DashboardWidget;
  accent: string;
  accentSecondary: string;
  textPrimary: string;
}) {
  const values = (
    widget.data.values as number[] | undefined
  ) ?? [];

  const total =
    values.reduce(
      (
        current,
        value,
      ) =>
        current + value,
      0,
    );

  const firstValue =
    values[0] ?? 0;

  const percentage =
    total > 0
      ? Math.round(
          (
            firstValue /
            total
          ) * 100,
        )
      : 0;

  return (
    <div className="flex flex-1 items-center justify-center">
      <div
        className="relative h-16 w-16 rounded-full"
        style={{
          background: `conic-gradient(
            ${accent} 0deg ${
              percentage * 3.6
            }deg,
            ${accentSecondary} ${
              percentage * 3.6
            }deg 360deg
          )`,
        }}
      >
        <div
          className="absolute inset-[9px] flex items-center justify-center rounded-full"
          style={{
            background:
              widget.data
                ? undefined
                : undefined,
          }}
        >
          <span
            className="text-[10px] font-bold"
            style={{
              color:
                textPrimary,
            }}
          >
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}


function MiniHistogram({
  widget,
  accent,
}: {
  widget: DashboardWidget;
  accent: string;
}) {
  const values = (
    widget.data.values as number[] | undefined
  ) ?? [];

  if (
    values.length === 0
  ) {
    return null;
  }

  const sample =
    values.slice(
      0,
      120,
    );

  const minimum =
    Math.min(
      ...sample,
    );

  const maximum =
    Math.max(
      ...sample,
    );

  const range =
    maximum - minimum ||
    1;

  const bins =
    Array.from(
      {
        length: 12,
      },
      () => 0,
    );

  sample.forEach(
    (value) => {
      const index =
        Math.min(
          11,
          Math.floor(
            (
              (value -
                minimum) /
              range
            ) * 12,
          ),
        );

      bins[index] += 1;
    },
  );

  const maxBin =
    Math.max(
      ...bins,
      1,
    );

  return (
    <div className="mt-2 flex h-16 flex-1 items-end gap-[2px]">
      {bins.map(
        (
          value,
          index,
        ) => (
          <div
            key={index}
            className="flex-1 rounded-t-[1px]"
            style={{
              height: `${
                Math.max(
                  8,
                  (
                    value /
                    maxBin
                  ) * 100,
                )
              }%`,
              background:
                accent,
              opacity:
                0.85,
            }}
          />
        ),
      )}
    </div>
  );
}


function MiniScatter({
  widget,
  accent,
}: {
  widget: DashboardWidget;
  accent: string;
}) {
  const x = (
    widget.data.x as number[] | undefined
  ) ?? [];

  const y = (
    widget.data.y as number[] | undefined
  ) ?? [];

  if (
    x.length === 0 ||
    y.length === 0
  ) {
    return null;
  }

  const sampleX =
    x.slice(
      0,
      25,
    );

  const sampleY =
    y.slice(
      0,
      25,
    );

  const minX =
    Math.min(
      ...sampleX,
    );

  const maxX =
    Math.max(
      ...sampleX,
    );

  const minY =
    Math.min(
      ...sampleY,
    );

  const maxY =
    Math.max(
      ...sampleY,
    );

  const rangeX =
    maxX - minX ||
    1;

  const rangeY =
    maxY - minY ||
    1;

  return (
    <div className="relative mt-2 h-16 overflow-hidden rounded-sm">
      {sampleX.map(
        (
          value,
          index,
        ) => {
          const yValue =
            sampleY[index] ??
            minY;

          const left =
            (
              (value -
                minX) /
              rangeX
            ) * 90 +
            5;

          const top =
            90 -
            (
              (
                yValue -
                minY
              ) /
              rangeY
            ) *
              80;

          return (
            <span
              key={index}
              className="absolute h-1.5 w-1.5 rounded-full"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                background:
                  accent,
                opacity: 0.75,
              }}
            />
          );
        },
      )}
    </div>
  );
}


function MiniLine({
  widget,
  accent,
}: {
  widget: DashboardWidget;
  accent: string;
}) {
  const values = (
    widget.data.y as number[] | undefined
  ) ?? (
    widget.data.values as number[] | undefined
  ) ?? [];

  if (
    values.length < 2
  ) {
    return null;
  }

  const sample =
    values.slice(
      0,
      20,
    );

  const minimum =
    Math.min(
      ...sample,
    );

  const maximum =
    Math.max(
      ...sample,
    );

  const range =
    maximum - minimum ||
    1;

  const points =
    sample
      .map(
        (
          value,
          index,
        ) => {
          const x =
            (
              index /
              Math.max(
                sample.length -
                  1,
                1,
              )
            ) *
            100;

          const y =
            90 -
            (
              (
                value -
                minimum
              ) /
              range
            ) *
              80;

          return `${x},${y}`;
        },
      )
      .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="mt-2 h-16 w-full"
    >
      <polyline
        points={
          points
        }
        fill="none"
        stroke={
          accent
        }
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}


function PreviewWidget({
  widget,
  design,
}: {
  widget: DashboardWidget;
  design: DashboardDesign;
}) {
  const {
    theme,
  } = design;

  if (
    widget.widget_type ===
    "kpi"
  ) {
    return (
      <div
        style={{
          ...getWidgetStyle(
            widget,
          ),
          background:
            theme.surface,
          borderColor:
            theme.border,
        }}
        className="min-h-0 overflow-hidden rounded-md border p-2"
      >
        <p
          className="truncate text-[7px] font-medium uppercase tracking-wide"
          style={{
            color:
              theme.text_secondary,
          }}
        >
          {widget.title}
        </p>

        <p
          className="mt-1 truncate text-sm font-bold"
          style={{
            color:
              theme.text_primary,
          }}
        >
          {widget.value}
        </p>

        <div
          className="mt-1 h-[2px] w-8 rounded-full"
          style={{
            background:
              theme.accent,
          }}
        />
      </div>
    );
  }

  if (
    widget.widget_type ===
    "insight"
  ) {
    const items = (
      widget.data.items as
        | Array<{
            title?: string;
            value?: string;
          }>
        | undefined
    ) ?? [];

    return (
      <div
        style={{
          ...getWidgetStyle(
            widget,
          ),
          background:
            theme.surface_secondary,
          borderColor:
            theme.border,
        }}
        className="min-h-0 overflow-hidden rounded-md border px-2 py-1.5"
      >
        <div className="flex items-center gap-1">
          <Lightbulb
            size={8}
            style={{
              color:
                theme.accent,
            }}
          />

          <span
            className="text-[7px] font-semibold"
            style={{
              color:
                theme.text_primary,
            }}
          >
            AI Insights
          </span>
        </div>

        <div className="mt-1 flex gap-2 overflow-hidden">
          {items
            .slice(0, 3)
            .map(
              (
                item,
                index,
              ) => (
                <span
                  key={index}
                  className="truncate text-[6px]"
                  style={{
                    color:
                      theme.text_secondary,
                  }}
                >
                  {item.value &&
                    `${item.value} `}
                  {item.title}
                </span>
              ),
            )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...getWidgetStyle(
          widget,
        ),
        background:
          theme.surface,
        borderColor:
          theme.border,
      }}
      className="flex min-h-0 flex-col overflow-hidden rounded-md border p-2"
    >
      <div className="flex items-center justify-between gap-1">
        <p
          className="truncate text-[7px] font-semibold"
          style={{
            color:
              theme.text_primary,
          }}
        >
          {widget.title}
        </p>

        <BarChart3
          size={7}
          style={{
            color:
              theme.text_secondary,
          }}
        />
      </div>

      {widget.widget_type ===
        "bar" && (
        <MiniBarChart
          widget={
            widget
          }
          accent={
            theme.accent
          }
          textSecondary={
            theme.text_secondary
          }
        />
      )}

      {(
        widget.widget_type ===
          "donut" ||
        widget.widget_type ===
          "pie"
      ) && (
        <MiniDonutChart
          widget={
            widget
          }
          accent={
            theme.accent
          }
          accentSecondary={
            theme.accent_secondary
          }
          textPrimary={
            theme.text_primary
          }
        />
      )}

      {widget.widget_type ===
        "histogram" && (
        <MiniHistogram
          widget={
            widget
          }
          accent={
            theme.accent
          }
        />
      )}

      {widget.widget_type ===
        "scatter" && (
        <MiniScatter
          widget={
            widget
          }
          accent={
            theme.accent
          }
        />
      )}

      {(
        widget.widget_type ===
          "line" ||
        widget.widget_type ===
          "area"
      ) && (
        <MiniLine
          widget={
            widget
          }
          accent={
            theme.accent
          }
        />
      )}
    </div>
  );
}


function DashboardDesignPreview({
  design,
  selected = false,
  onSelect,
}: DashboardDesignPreviewProps) {
  const {
    theme,
  } = design;

  const maximumRow =
    Math.max(
      12,
      ...design.widgets.map(
        (widget) =>
          widget.position.y +
          widget.position.h,
      ),
      ...design.slicers.map(
        (slicer) =>
          slicer.position.y +
          slicer.position.h,
      ),
    );

  return (
    <button
      type="button"
      onClick={
        onSelect
      }
      className={[
        "group w-full overflow-hidden rounded-xl border text-left transition",
        selected
          ? "border-blue-500 ring-2 ring-blue-500/20"
          : "border-slate-800 hover:border-slate-600",
      ].join(" ")}
    >
      <div
        className="p-3"
        style={{
          background:
            theme.background,
        }}
      >
        {/* Mini report title */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p
              className="truncate text-[9px] font-bold"
              style={{
                color:
                  theme.text_primary,
              }}
            >
              {design.title}
            </p>

            <p
              className="mt-0.5 truncate text-[6px]"
              style={{
                color:
                  theme.text_secondary,
              }}
            >
              {
                design.subtitle
              }
            </p>
          </div>

          <div
            className="rounded px-1.5 py-1 text-[6px] font-semibold"
            style={{
              background:
                theme.surface_secondary,
              color:
                theme.accent,
            }}
          >
            BI
          </div>
        </div>

        {/* Dashboard canvas */}
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns:
              "repeat(12, minmax(0, 1fr))",

            gridTemplateRows: `repeat(${maximumRow}, 14px)`,
          }}
        >
          {design.slicers.map(
            (slicer) => (
              <div
                key={
                  slicer.id
                }
                style={{
                  ...getSlicerStyle(
                    slicer
                      .position.x,
                    slicer
                      .position.y,
                    slicer
                      .position.w,
                    slicer
                      .position.h,
                  ),

                  background:
                    theme.surface_secondary,

                  borderColor:
                    theme.border,
                }}
                className="flex min-h-0 items-center gap-1 overflow-hidden rounded border px-1.5"
              >
                <Filter
                  size={6}
                  style={{
                    color:
                      theme.accent,
                  }}
                />

                <span
                  className="truncate text-[6px]"
                  style={{
                    color:
                      theme.text_secondary,
                  }}
                >
                  {
                    slicer.title
                  }
                </span>
              </div>
            ),
          )}

          {design.widgets.map(
            (widget) => (
              <PreviewWidget
                key={
                  widget.id
                }
                widget={
                  widget
                }
                design={
                  design
                }
              />
            ),
          )}
        </div>
      </div>

      {/* Preview footer */}
      <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">
            Design{" "}
            {
              design.design_number
            }
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            {design.name}
          </p>
        </div>

        <span
          className={[
            "rounded-lg px-3 py-1.5 text-xs font-semibold",
            selected
              ? "bg-blue-600 text-white"
              : "bg-slate-800 text-slate-300 group-hover:bg-slate-700",
          ].join(" ")}
        >
          {selected
            ? "Selected"
            : "Preview"}
        </span>
      </div>
    </button>
  );
}


export default DashboardDesignPreview;