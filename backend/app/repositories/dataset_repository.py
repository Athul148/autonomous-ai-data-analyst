from sqlalchemy.orm import Session

from app.models.dataset import Dataset


class DatasetRepository:
    """
    Repository for dataset database operations.
    """

    def __init__(
        self,
        db: Session,
    ) -> None:
        self.db = db

    def create(
        self,
        *,
        user_id: int,
        name: str,
        original_filename: str,
        file_type: str,
        storage_path: str,
        file_size: int,
        rows: int,
        columns: int,
        status: str = "uploaded",
    ) -> Dataset:
        dataset = Dataset(
            user_id=user_id,
            name=name,
            original_filename=original_filename,
            file_type=file_type,
            storage_path=storage_path,
            file_size=file_size,
            rows=rows,
            columns=columns,
            status=status,
        )

        self.db.add(dataset)
        self.db.commit()
        self.db.refresh(dataset)

        return dataset

    def get_by_id(
        self,
        dataset_id: int,
    ) -> Dataset | None:
        return (
            self.db.query(Dataset)
            .filter(
                Dataset.id == dataset_id
            )
            .first()
        )

    def get_all_by_user(
        self,
        user_id: int,
    ) -> list[Dataset]:
        return (
            self.db.query(Dataset)
            .filter(
                Dataset.user_id == user_id
            )
            .order_by(
                Dataset.created_at.desc()
            )
            .all()
        )

    def delete(
        self,
        dataset: Dataset,
    ) -> None:
        self.db.delete(dataset)
        self.db.commit()