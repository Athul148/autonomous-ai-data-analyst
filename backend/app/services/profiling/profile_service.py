import pandas as pd

from app.repositories.dataset_profile_repository import (
    DatasetProfileRepository,
)


class ProfileService:
    """
    Service responsible for profiling datasets.
    """

    def __init__(self, repository: DatasetProfileRepository):
        self.repository = repository

    def profile(
        self,
        *,
        dataset_id: int,
        dataframe: pd.DataFrame,
    ):
        """
        Generate dataset profile and save it.
        """

        rows = len(dataframe)

        columns = len(dataframe.columns)

        missing_values = int(
            dataframe.isna().sum().sum()
        )

        duplicate_rows = int(
            dataframe.duplicated().sum()
        )

        memory_usage = int(
            dataframe.memory_usage(
                deep=True
            ).sum()
        )

        column_metadata = []

        for column in dataframe.columns:

            column_metadata.append(
                {
                    "name": column,
                    "dtype": str(dataframe[column].dtype),
                    "missing": int(
                        dataframe[column]
                        .isna()
                        .sum()
                    ),
                    "unique": int(
                        dataframe[column]
                        .nunique()
                    ),
                }
            )

        quality_score = self.calculate_quality_score(
            rows,
            columns,
            missing_values,
            duplicate_rows,
        )

        return self.repository.create(
            dataset_id=dataset_id,
            rows=rows,
            columns=columns,
            missing_values=missing_values,
            duplicate_rows=duplicate_rows,
            memory_usage=memory_usage,
            quality_score=quality_score,
            column_metadata=column_metadata,
        )

    @staticmethod
    def calculate_quality_score(
        rows: int,
        columns: int,
        missing_values: int,
        duplicate_rows: int,
    ) -> float:
        """
        Calculate a simple dataset quality score.
        """

        total_cells = rows * columns

        if total_cells == 0:
            return 0.0

        missing_percentage = (
            missing_values / total_cells
        ) * 100

        duplicate_percentage = (
            duplicate_rows / rows
        ) * 100 if rows else 0

        score = (
            100
            - missing_percentage
            - duplicate_percentage
        )

        return round(
            max(score, 0),
            2,
        )