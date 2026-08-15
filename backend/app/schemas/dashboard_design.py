from typing import Any, Literal

from pydantic import BaseModel, Field


DashboardWidgetType = Literal[
    "kpi",
    "bar",
    "pie",
    "donut",
    "histogram",
    "scatter",
    "line",
    "area",
    "box",
    "insight",
    "text",
]


DashboardThemeName = Literal[
    "executive_dark",
    "powerbi_classic",
    "modern_light",
    "analytics_blue",
    "minimal_pro",
]


DashboardTemplateName = Literal[
    "executive",
    "sidebar_slicers",
    "balanced_grid",
    "story",
    "analytical",
    "command_center",
    "hero_analytics",
    "explorer",
    "performance_cockpit",
    "insight_board",
    "compact_intelligence",
    "segmentation",
    "comparison",
    "metric_wall",
    "analytical_canvas",
    "storyboard",
    "minimal_executive",
]

class DashboardPosition(BaseModel):
    """
    Grid position of one dashboard widget.

    The frontend will render widgets on a
    12-column report canvas.
    """

    x: int = Field(
        ge=0,
        le=11,
    )

    y: int = Field(
        ge=0,
    )

    w: int = Field(
        ge=1,
        le=12,
    )

    h: int = Field(
        ge=1,
    )


class DashboardWidget(BaseModel):
    """
    One visual element placed on the
    generated dashboard canvas.
    """

    id: str

    widget_type: DashboardWidgetType

    title: str

    subtitle: str | None = None

    position: DashboardPosition

    columns: list[str] = Field(
        default_factory=list
    )

    metric: str | None = None

    value: str | None = None

    x_label: str | None = None

    y_label: str | None = None

    reason: str | None = None

    data: dict[str, Any] = Field(
        default_factory=dict
    )


class DashboardSlicer(BaseModel):
    """
    Filter/slicer configuration for a
    generated dashboard design.
    """

    id: str

    column: str

    title: str

    filter_type: Literal[
        "categorical",
        "numeric_range",
        "date_range",
    ]

    position: DashboardPosition

    options: list[dict[str, Any]] = Field(
        default_factory=list
    )

    minimum: float | None = None

    maximum: float | None = None


class DashboardTheme(BaseModel):
    """
    Theme values used by the frontend
    renderer.
    """

    name: DashboardThemeName

    background: str

    surface: str

    surface_secondary: str

    text_primary: str

    text_secondary: str

    accent: str

    accent_secondary: str

    border: str


class DashboardDesign(BaseModel):
    """
    Complete specification for one generated
    dashboard design.
    """

    design_id: str

    design_number: int

    name: str

    template: DashboardTemplateName

    theme: DashboardTheme

    title: str

    subtitle: str | None = None

    canvas_columns: int = 12

    widgets: list[DashboardWidget] = Field(
        default_factory=list
    )

    slicers: list[DashboardSlicer] = Field(
        default_factory=list
    )


class DashboardDesignBatch(BaseModel):
    """
    Represents one generated batch of
    dashboard alternatives.
    """

    batch_number: int

    designs: list[DashboardDesign] = Field(
        default_factory=list
    )


class DashboardDesignResponse(BaseModel):
    dataset_id: int

    dataset_name: str

    batch: DashboardDesignBatch