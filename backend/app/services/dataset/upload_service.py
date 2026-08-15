from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.dataset_profile_repository import (
    DatasetProfileRepository,
)
from app.repositories.dataset_repository import DatasetRepository
from app.schemas.dataset_schema import DatasetResponse
from app.services.profiling.profile_service import ProfileService
from app.utils.dataset_loader import DatasetLoader
from app.utils.file_storage import FileStorage


class UploadService:
    """
    Service responsible for dataset upload and automatic profiling.
    """

    def __init__(self, db: Session):
        self.dataset_repository = DatasetRepository(db)
        self.profile_repository = DatasetProfileRepository(db)

    def upload(
        self,
        file: UploadFile,
        current_user: User,
    ) -> DatasetResponse:
        """
        Upload a dataset, store its metadata, and generate its profile.
        """
        if not file.filename:
            raise ValueError("Uploaded file must have a filename.")

        storage_path, _ = FileStorage.save_file(
            upload_file=file,
            user_id=current_user.id,
        )

        try:
            dataframe = DatasetLoader.load(storage_path)

            dataset = self.dataset_repository.create(
                user_id=current_user.id,
                name=Path(file.filename).stem,
                original_filename=file.filename,
                file_type=Path(file.filename).suffix.lower(),
                storage_path=storage_path,
                file_size=Path(storage_path).stat().st_size,
                rows=len(dataframe),
                columns=len(dataframe.columns),
            )

            profile_service = ProfileService(
                self.profile_repository
            )

            profile_service.profile(
                dataset_id=dataset.id,
                dataframe=dataframe,
            )

            return DatasetResponse.model_validate(dataset)

        except Exception:
            FileStorage.delete_file(storage_path)
            raise