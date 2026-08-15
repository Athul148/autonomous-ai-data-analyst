from typing import Any, Literal

from pydantic import BaseModel, Field


class CategoricalDashboardFilter(BaseModel):
    filter_type: Literal["categorical"]
    column: str
    value: Any


class NumericRangeDashboardFilter(BaseModel):
    filter_type: Literal["numeric_range"]
    column: str
    minimum: float | None = None
    maximum: float | None = None


DashboardFilterItem = (
    CategoricalDashboardFilter
    | NumericRangeDashboardFilter
)


class DashboardFilterRequest(BaseModel):
    filters: list[DashboardFilterItem] = Field(
        default_factory=list
    )