from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DatasetResponse(BaseModel):
    id: int
    name: str
    original_filename: str
    file_type: str
    file_size: int
    rows: int
    columns: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)