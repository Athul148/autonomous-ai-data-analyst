import pandas as pd
from pandas.api.types import (
    is_bool_dtype,
    is_numeric_dtype,
)


class QualityService:
    """
    Evaluates dataset quality and generates quality metrics.
    """

    @staticmethod
    def analyze(dataframe: pd.DataFrame) -> dict:

        rows = len(dataframe)
        columns = len(dataframe.columns)
        total_cells = rows * columns

        missing_values = int(dataframe.isna().sum().sum())
        duplicate_rows = int(dataframe.duplicated().sum())

        constant_columns = [
            column
            for column in dataframe.columns
            if dataframe[column].nunique(dropna=False) <= 1
        ]

        empty_columns = [
            column
            for column in dataframe.columns
            if dataframe[column].isna().all()
        ]

        # Only check high-cardinality for non-numeric columns
        high_cardinality_columns = []

        for column in dataframe.columns:

            series = dataframe[column]

            if (
                is_numeric_dtype(series)
                or is_bool_dtype(series)
            ):
                continue

            unique_ratio = (
                series.nunique(dropna=True) / rows
                if rows > 0
                else 0
            )

            if unique_ratio >= 0.90:
                high_cardinality_columns.append(column)

        memory_usage = int(
            dataframe.memory_usage(deep=True).sum()
        )

        warnings = []

        if missing_values > 0:
            warnings.append(
                f"{missing_values} missing values detected."
            )

        if duplicate_rows > 0:
            warnings.append(
                f"{duplicate_rows} duplicate rows detected."
            )

        if constant_columns:
            warnings.append(
                f"{len(constant_columns)} constant column(s) detected."
            )

        if empty_columns:
            warnings.append(
                f"{len(empty_columns)} empty column(s) detected."
            )

        if high_cardinality_columns:
            warnings.append(
                f"{len(high_cardinality_columns)} high-cardinality categorical column(s) detected."
            )

        quality_score = QualityService.calculate_score(
            rows=rows,
            columns=columns,
            missing_values=missing_values,
            duplicate_rows=duplicate_rows,
            constant_columns=len(constant_columns),
        )

        return {
            "quality_score": quality_score,
            "missing_values": missing_values,
            "duplicate_rows": duplicate_rows,
            "constant_columns": constant_columns,
            "empty_columns": empty_columns,
            "high_cardinality_columns": high_cardinality_columns,
            "memory_usage": memory_usage,
            "warnings": warnings,
        }

    @staticmethod
    def calculate_score(
        *,
        rows: int,
        columns: int,
        missing_values: int,
        duplicate_rows: int,
        constant_columns: int,
    ) -> float:

        total_cells = rows * columns

        if total_cells == 0:
            return 0.0

        score = 100.0

        # Missing values penalty (40%)
        score -= (missing_values / total_cells) * 40

        # Duplicate rows penalty (30%)
        if rows > 0:
            score -= (duplicate_rows / rows) * 30

        # Constant columns penalty
        score -= constant_columns * 5

        return round(max(score, 0), 2)