from typing import Any

from pydantic import BaseModel


class DatasetSampleResponse(BaseModel):
    page: int
    page_size: int
    total_rows: int
    total_pages: int
    columns: list[str]
    rows: list[dict[str, Any]]