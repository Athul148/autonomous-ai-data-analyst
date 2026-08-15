from sqlalchemy.orm import Session

from app.models.dataset_profile import DatasetProfile


class DatasetProfileRepository:
    """
    Repository for dataset profile database operations.
    """

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        *,
        dataset_id: int,
        rows: int,
        columns: int,
        missing_values: int,
        duplicate_rows: int,
        memory_usage: int,
        quality_score: float,
        column_metadata: dict,
    ) -> DatasetProfile:

        profile = DatasetProfile(
            dataset_id=dataset_id,
            rows=rows,
            columns=columns,
            missing_values=missing_values,
            duplicate_rows=duplicate_rows,
            memory_usage=memory_usage,
            quality_score=quality_score,
            column_metadata=column_metadata,
        )

        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)

        return profile

    def get_by_dataset_id(
        self,
        dataset_id: int,
    ) -> DatasetProfile | None:

        return (
            self.db.query(DatasetProfile)
            .filter(DatasetProfile.dataset_id == dataset_id)
            .first()
        )