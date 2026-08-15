from typing import Any, Literal

from pydantic import BaseModel, Field


class DashboardKPI(BaseModel):
    """
    Represents one KPI card displayed
    at the top of the dashboard.
    """

    id: str
    title: str
    value: str
    subtitle: str | None = None
    column: str | None = None
    metric: str | None = None


class DashboardChart(BaseModel):
    """
    Represents one visualization selected
    for the dashboard.
    """

    id: str
    title: str

    chart_type: Literal[
        "bar",
        "pie",
        "histogram",
        "scatter",
        "line",
        "area",
        "box",
        "heatmap",
    ]

    columns: list[str] = Field(
        default_factory=list
    )

    x_label: str | None = None
    y_label: str | None = None

    reason: str

    data: dict[str, Any] = Field(
        default_factory=dict
    )


class DashboardInsight(BaseModel):
    """
    Represents one important analytical
    observation shown on the dashboard.
    """

    id: str
    title: str
    description: str
    value: str | None = None

    category: Literal[
        "quality",
        "statistics",
        "relationship",
        "distribution",
        "general",
    ] = "general"


class DashboardFilterOption(BaseModel):
    label: str
    value: str | int | float | bool


class DashboardFilter(BaseModel):
    """
    Describes a dashboard filter that the
    frontend may render.
    """

    id: str
    column: str
    title: str

    filter_type: Literal[
        "categorical",
        "numeric_range",
        "date_range",
    ]

    options: list[DashboardFilterOption] = Field(
        default_factory=list
    )

    minimum: float | None = None
    maximum: float | None = None


class DashboardContent(BaseModel):
    """
    Complete automatically generated
    dashboard configuration.
    """

    title: str
    description: str | None = None

    kpis: list[DashboardKPI] = Field(
        default_factory=list
    )

    charts: list[DashboardChart] = Field(
        default_factory=list
    )

    insights: list[DashboardInsight] = Field(
        default_factory=list
    )

    filters: list[DashboardFilter] = Field(
        default_factory=list
    )


class DashboardResponse(BaseModel):
    dataset_id: int
    dataset_name: str
    dashboard: DashboardContent