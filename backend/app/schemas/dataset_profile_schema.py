from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class DatasetProfileResponse(BaseModel):
    id: int
    dataset_id: int
    rows: int
    columns: int
    missing_values: int
    duplicate_rows: int
    memory_usage: int
    quality_score: float
    column_metadata: list[dict[str, Any]]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)