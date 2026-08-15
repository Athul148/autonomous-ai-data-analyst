from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ReportCreate(BaseModel):
    dataset_id: int
    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )
    report_data: dict[str, Any]


class ReportResponse(BaseModel):
    id: int
    user_id: int
    dataset_id: int
    title: str
    report_data: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class ReportListItem(BaseModel):
    id: int
    dataset_id: int
    title: str
    dataset_name: str
    created_at: datetime
    updated_at: datetime