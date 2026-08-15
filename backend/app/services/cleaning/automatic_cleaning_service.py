from typing import Any

import numpy as np
import pandas as pd

from app.services.eda.datatype_service import (
    DatatypeService,
)


class AutomaticCleaningService:
    """
    Builds an automatic cleaning plan from the dataset.

    Normal cleaning:
    - Remove completely empty rows.
    - Remove duplicate rows.
    - Handle missing values intelligently.

    Optional ML preparation:
    - Remove identifier columns.
    - Encode categorical feature columns.
    - Keep numeric values in their original units.
    - Do not automatically standardize or normalize.
    """

    @staticmethod
    def build_plan(
        *,
        dataframe: pd.DataFrame,
        prepare_for_ml: bool,
    ) -> dict[str, Any]:
        decisions: list[dict[str, Any]] = []

        datatypes = DatatypeService.classify(
            dataframe
        )

        # -------------------------------------------------
        # Normal dataset cleaning
        # -------------------------------------------------

        AutomaticCleaningService._add_empty_row_decision(
            dataframe=dataframe,
            decisions=decisions,
        )

        AutomaticCleaningService._add_duplicate_decision(
            dataframe=dataframe,
            decisions=decisions,
        )

        AutomaticCleaningService._add_missing_value_decisions(
            dataframe=dataframe,
            decisions=decisions,
        )

        # -------------------------------------------------
        # Optional ML preparation
        # -------------------------------------------------

        if prepare_for_ml:
            AutomaticCleaningService._add_identifier_decisions(
                datatypes=datatypes,
                decisions=decisions,
            )

            AutomaticCleaningService._add_categorical_decisions(
                dataframe=dataframe,
                datatypes=datatypes,
                decisions=decisions,
            )

        return {
            "prepare_for_ml": prepare_for_ml,
            "decisions": decisions,
            "total_decisions": len(
                decisions
            ),
        }

    # =====================================================
    # COMPLETELY EMPTY ROWS
    # =====================================================

    @staticmethod
    def _add_empty_row_decision(
        *,
        dataframe: pd.DataFrame,
        decisions: list[dict[str, Any]],
    ) -> None:
        empty_row_mask = dataframe.isna().all(
            axis=1
        )

        empty_rows = int(
            empty_row_mask.sum()
        )

        if empty_rows == 0:
            return

        decisions.append(
            {
                "issue": "completely_empty_rows",
                "action": "drop_empty_rows",
                "columns": [],
                "reason": (
                    f"{empty_rows} completely empty rows were detected. "
                    "They contain no usable information and should be removed."
                ),
            }
        )

    # =====================================================
    # DUPLICATE ROWS
    # =====================================================

    @staticmethod
    def _add_duplicate_decision(
        *,
        dataframe: pd.DataFrame,
        decisions: list[dict[str, Any]],
    ) -> None:
        duplicate_rows = int(
            dataframe.duplicated().sum()
        )

        if duplicate_rows == 0:
            return

        decisions.append(
            {
                "issue": "duplicate_rows",
                "action": "drop_duplicates",
                "columns": [],
                "reason": (
                    f"{duplicate_rows} duplicate rows were detected. "
                    "Keeping only the first occurrence avoids repeated records."
                ),
            }
        )

    # =====================================================
    # MISSING VALUES
    # =====================================================

    @staticmethod
    def _add_missing_value_decisions(
        *,
        dataframe: pd.DataFrame,
        decisions: list[dict[str, Any]],
    ) -> None:
        """
        Decide the most suitable missing-value strategy
        automatically.

        Completely empty rows are excluded first because
        they are already handled by drop_empty_rows.
        """

        non_empty_dataframe = dataframe.loc[
            ~dataframe.isna().all(axis=1)
        ]

        for column in non_empty_dataframe.columns:
            series = non_empty_dataframe[
                column
            ]

            missing_count = int(
                series.isna().sum()
            )

            if missing_count == 0:
                continue

            missing_ratio = (
                missing_count
                / max(
                    len(non_empty_dataframe),
                    1,
                )
            )

            # ---------------------------------------------
            # Mostly empty column
            # ---------------------------------------------

            if missing_ratio >= 0.95:
                decisions.append(
                    {
                        "issue": "mostly_empty_column",
                        "action": "drop_column",
                        "columns": [
                            str(column)
                        ],
                        "reason": (
                            f"{column} is {missing_ratio:.1%} missing. "
                            "The column contains too little usable information."
                        ),
                    }
                )

                continue

            # ---------------------------------------------
            # Numeric missing values
            # ---------------------------------------------

            if pd.api.types.is_numeric_dtype(
                series
            ):
                valid_series = (
                    series.dropna()
                )

                if valid_series.empty:
                    decisions.append(
                        {
                            "issue": "unusable_numeric_column",
                            "action": "drop_column",
                            "columns": [
                                str(column)
                            ],
                            "reason": (
                                f"{column} has no usable numeric values, "
                                "so statistical imputation is not possible."
                            ),
                        }
                    )

                    continue

                skewness = float(
                    valid_series.skew()
                )

                if not np.isfinite(
                    skewness
                ):
                    skewness = 0.0

                # Strongly skewed numeric data:
                # median is safer.
                if abs(skewness) >= 1.0:
                    action = (
                        "fill_missing_median"
                    )

                    reason = (
                        f"{column} contains {missing_count} missing values "
                        "and has a skewed distribution. Median imputation "
                        "is more robust to skewness and outliers."
                    )

                # Reasonably balanced numeric data:
                # mean is suitable.
                else:
                    action = (
                        "fill_missing_mean"
                    )

                    reason = (
                        f"{column} contains {missing_count} missing values "
                        "and has a reasonably balanced numeric distribution. "
                        "Mean imputation is suitable."
                    )

                decisions.append(
                    {
                        "issue": "missing_numeric_values",
                        "action": action,
                        "columns": [
                            str(column)
                        ],
                        "reason": reason,
                    }
                )

                continue

            # ---------------------------------------------
            # Categorical missing values
            # ---------------------------------------------

            valid_mode = series.mode(
                dropna=True
            )

            if valid_mode.empty:
                decisions.append(
                    {
                        "issue": "unusable_categorical_column",
                        "action": "drop_column",
                        "columns": [
                            str(column)
                        ],
                        "reason": (
                            f"{column} has no usable categorical values, "
                            "so mode imputation is not possible."
                        ),
                    }
                )

                continue

            decisions.append(
                {
                    "issue": "missing_categorical_values",
                    "action": "fill_missing_mode",
                    "columns": [
                        str(column)
                    ],
                    "reason": (
                        f"{column} contains {missing_count} missing values. "
                        "Mode imputation preserves the most common category."
                    ),
                }
            )

    # =====================================================
    # IDENTIFIER COLUMNS
    # =====================================================

    @staticmethod
    def _add_identifier_decisions(
        *,
        datatypes: dict[str, Any],
        decisions: list[dict[str, Any]],
    ) -> None:
        """
        Identifier columns are excluded only when
        Prepare for ML is enabled.
        """

        identifier_columns = [
            str(column)
            for column, metadata
            in datatypes.items()
            if str(
                metadata.get(
                    "category",
                    "",
                )
            ) == "identifier"
        ]

        if not identifier_columns:
            return

        decisions.append(
            {
                "issue": "identifier_columns",
                "action": "drop_column",
                "columns": sorted(
                    identifier_columns
                ),
                "reason": (
                    "Identifier columns usually represent record identity "
                    "rather than predictive information, so they are removed "
                    "from the model-ready dataset."
                ),
            }
        )

    # =====================================================
    # CATEGORICAL FEATURES
    # =====================================================

    @staticmethod
    def _add_categorical_decisions(
        *,
        dataframe: pd.DataFrame,
        datatypes: dict[str, Any],
        decisions: list[dict[str, Any]],
    ) -> None:
        """
        Automatically prepare categorical feature columns.

        Low-cardinality:
            One-hot encoding.

        High-cardinality:
            Frequency encoding.

        Numeric columns are NOT scaled here.
        """

        categorical_columns = [
            str(column)
            for column, metadata
            in datatypes.items()
            if str(
                metadata.get(
                    "category",
                    "",
                )
            )
            in {
                "categorical",
                "binary_categorical",
            }
            and column in dataframe.columns
        ]

        if not categorical_columns:
            return

        low_cardinality: list[str] = []
        high_cardinality: list[str] = []

        for column in categorical_columns:
            unique_count = int(
                dataframe[column]
                .nunique(
                    dropna=True
                )
            )

            if unique_count <= 20:
                low_cardinality.append(
                    column
                )
            else:
                high_cardinality.append(
                    column
                )

        # ---------------------------------------------
        # Low-cardinality categories
        # ---------------------------------------------

        if low_cardinality:
            decisions.append(
                {
                    "issue": "categorical_features",
                    "action": "one_hot_encode",
                    "columns": sorted(
                        low_cardinality
                    ),
                    "reason": (
                        "Low-cardinality categorical columns are converted "
                        "to binary feature columns using one-hot encoding "
                        "for machine-learning compatibility."
                    ),
                }
            )

        # ---------------------------------------------
        # High-cardinality categories
        # ---------------------------------------------

        if high_cardinality:
            decisions.append(
                {
                    "issue": (
                        "high_cardinality_"
                        "categorical_features"
                    ),
                    "action": (
                        "frequency_encode"
                    ),
                    "columns": sorted(
                        high_cardinality
                    ),
                    "reason": (
                        "High-cardinality categorical columns would create "
                        "too many one-hot features, so frequency encoding "
                        "is used instead."
                    ),
                }
            )