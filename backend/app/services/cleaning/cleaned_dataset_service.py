from pathlib import Path
from typing import Any
from uuid import uuid4

import pandas as pd
from sqlalchemy.orm import Session

from app.models.dataset import Dataset
from app.repositories.dataset_profile_repository import (
    DatasetProfileRepository,
)
from app.repositories.dataset_repository import (
    DatasetRepository,
)
from app.services.cleaning.cleaning_plan_service import (
    CleaningPlanService,
)
from app.services.profiling.profile_service import (
    ProfileService,
)


class CleanedDatasetService:
    """
    Executes a cleaning plan, writes the cleaned data
    to a new file, creates a new dataset record,
    and automatically generates the dataset profile.

    The original dataset file and record remain unchanged.
    """

    @staticmethod
    def save(
        *,
        db: Session,
        source_dataset: Dataset,
        user_id: int,
        name: str,
        actions: list[dict[str, Any]],
        dataframe: pd.DataFrame,
    ) -> dict[str, Any]:
        cleaned_name = name.strip()

        if not cleaned_name:
            raise ValueError(
                "Cleaned dataset name is required."
            )

        # -------------------------------------------------
        # Execute cleaning plan
        # -------------------------------------------------

        result = CleaningPlanService.execute(
            dataframe=dataframe,
            actions=actions,
        )

        if result["failed_actions"] > 0:
            raise ValueError(
                "The cleaned dataset cannot be saved "
                "because one or more actions failed."
            )

        cleaned_dataframe = result[
            "dataframe"
        ]

        # -------------------------------------------------
        # Determine source file type
        # -------------------------------------------------

        source_path = Path(
            source_dataset.storage_path
        )

        source_extension = (
            source_path.suffix.lower()
        )

        if source_extension not in {
            ".csv",
            ".xlsx",
        }:
            raise ValueError(
                "Only CSV and XLSX datasets can be saved."
            )

        # -------------------------------------------------
        # Create storage location
        # -------------------------------------------------

        user_directory = (
            source_path.parent
        )

        user_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

        unique_filename = (
            f"{uuid4().hex}"
            f"{source_extension}"
        )

        cleaned_storage_path = (
            user_directory
            / unique_filename
        )

        # -------------------------------------------------
        # Write cleaned dataframe
        # -------------------------------------------------

        CleanedDatasetService._write_dataframe(
            dataframe=cleaned_dataframe,
            destination=cleaned_storage_path,
            extension=source_extension,
        )

        cleaned_dataset: Dataset | None = None

        try:
            # ---------------------------------------------
            # File metadata
            # ---------------------------------------------

            file_size = (
                cleaned_storage_path
                .stat()
                .st_size
            )

            # ---------------------------------------------
            # Create dataset database record
            # ---------------------------------------------

            dataset_repository = (
                DatasetRepository(db)
            )

            cleaned_dataset = (
                dataset_repository.create(
                    user_id=user_id,
                    name=cleaned_name,
                    original_filename=(
                        f"{cleaned_name}"
                        f"{source_extension}"
                    ),
                    file_type=(
                        source_extension
                        .lstrip(".")
                    ),
                    storage_path=str(
                        cleaned_storage_path
                    ),
                    file_size=file_size,
                    rows=int(
                        cleaned_dataframe.shape[0]
                    ),
                    columns=int(
                        cleaned_dataframe.shape[1]
                    ),
                    status="uploaded",
                )
            )

            # ---------------------------------------------
            # Generate profile for the NEW cleaned dataset
            # ---------------------------------------------

            profile_repository = (
                DatasetProfileRepository(
                    db
                )
            )

            profile_service = (
                ProfileService(
                    profile_repository
                )
            )

            profile_service.profile(
                dataset_id=cleaned_dataset.id,
                dataframe=cleaned_dataframe,
            )

        except Exception:
            # ---------------------------------------------
            # Remove partially created dataset record
            # ---------------------------------------------

            if cleaned_dataset is not None:
                try:
                    dataset_repository = (
                        DatasetRepository(db)
                    )

                    dataset_repository.delete(
                        cleaned_dataset
                    )
                except Exception:
                    db.rollback()

            # ---------------------------------------------
            # Remove partially created file
            # ---------------------------------------------

            if cleaned_storage_path.exists():
                cleaned_storage_path.unlink()

            raise

        return {
            "dataset": cleaned_dataset,
            "result": result,
        }

    @staticmethod
    def _write_dataframe(
        *,
        dataframe: pd.DataFrame,
        destination: Path,
        extension: str,
    ) -> None:
        if extension == ".csv":
            dataframe.to_csv(
                destination,
                index=False,
            )
            return

        if extension == ".xlsx":
            dataframe.to_excel(
                destination,
                index=False,
                engine="openpyxl",
            )
            return

        raise ValueError(
            "Unsupported cleaned dataset file type."
        )