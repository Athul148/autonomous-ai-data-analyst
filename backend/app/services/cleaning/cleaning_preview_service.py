from typing import Any

import numpy as np
import pandas as pd


class CleaningPreviewService:
    """
    Applies cleaning operations to an in-memory copy
    and returns a preview without modifying the source.
    """

    @staticmethod
    def preview(
        *,
        dataframe: pd.DataFrame,
        action: str,
        columns: list[str],
    ) -> dict[str, Any]:
        CleaningPreviewService._validate_columns(
            dataframe=dataframe,
            columns=columns,
        )

        original = dataframe.copy()
        preview = dataframe.copy()

        warnings: list[str] = []
        values_changed = 0

        if action == "drop_missing_rows":
            selected_columns = (
                columns
                if columns
                else list(preview.columns)
            )

            affected_mask = preview[
                selected_columns
            ].isna().any(axis=1)

            values_changed = int(
                affected_mask.sum()
            )

            preview = preview.loc[
                ~affected_mask
            ].copy()

        elif action in {
            "fill_missing_mean",
            "fill_missing_median",
            "fill_missing_mode",
        }:
            if not columns:
                raise ValueError(
                    "Select at least one column."
                )

            for column in columns:
                missing_mask = preview[
                    column
                ].isna()

                missing_count = int(
                    missing_mask.sum()
                )

                if missing_count == 0:
                    warnings.append(
                        f"{column} has no missing values."
                    )
                    continue

                if action == "fill_missing_mean":
                    CleaningPreviewService._require_numeric(
                        preview,
                        column,
                    )

                    fill_value = preview[
                        column
                    ].mean()

                elif action == "fill_missing_median":
                    CleaningPreviewService._require_numeric(
                        preview,
                        column,
                    )

                    fill_value = preview[
                        column
                    ].median()

                else:
                    mode_values = preview[
                        column
                    ].mode(
                        dropna=True
                    )

                    if mode_values.empty:
                        warnings.append(
                            f"{column} has no valid mode value."
                        )
                        continue

                    fill_value = mode_values.iloc[0]

                if pd.isna(fill_value):
                    warnings.append(
                        f"{column} could not be imputed."
                    )
                    continue

                preview.loc[
                    missing_mask,
                    column,
                ] = fill_value

                values_changed += missing_count

        elif action == "drop_duplicates":
            duplicate_mask = preview.duplicated(
                keep="first"
            )

            values_changed = int(
                duplicate_mask.sum()
            )

            preview = preview.loc[
                ~duplicate_mask
            ].copy()

        elif action == "drop_column":
            if not columns:
                raise ValueError(
                    "Select at least one column."
                )

            preview = preview.drop(
                columns=columns
            )

        elif action in {
            "standardize",
            "normalize",
        }:
            if not columns:
                raise ValueError(
                    "Select at least one column."
                )

            for column in columns:
                CleaningPreviewService._require_numeric(
                    preview,
                    column,
                )

                valid_mask = preview[
                    column
                ].notna()

                valid_count = int(
                    valid_mask.sum()
                )

                if valid_count == 0:
                    warnings.append(
                        f"{column} has no numeric values to transform."
                    )
                    continue

                series = preview.loc[
                    valid_mask,
                    column,
                ].astype(float)

                if action == "standardize":
                    standard_deviation = float(
                        series.std(ddof=0)
                    )

                    if np.isclose(
                        standard_deviation,
                        0.0,
                    ):
                        warnings.append(
                            f"{column} is constant and cannot be standardized."
                        )
                        continue

                    transformed = (
                        series - series.mean()
                    ) / standard_deviation

                else:
                    minimum = float(
                        series.min()
                    )

                    maximum = float(
                        series.max()
                    )

                    value_range = (
                        maximum - minimum
                    )

                    if np.isclose(
                        value_range,
                        0.0,
                    ):
                        warnings.append(
                            f"{column} is constant and cannot be normalized."
                        )
                        continue

                    transformed = (
                        series - minimum
                    ) / value_range

                preview.loc[
                    valid_mask,
                    column,
                ] = transformed

                values_changed += valid_count

        else:
            raise ValueError(
                "Unsupported cleaning action."
            )

        affected_indices = (
            CleaningPreviewService
            ._find_affected_indices(
                original=original,
                preview=preview,
            )
        )

        return {
            "summary": {
                "original_rows": int(
                    original.shape[0]
                ),
                "preview_rows": int(
                    preview.shape[0]
                ),
                "original_columns": int(
                    original.shape[1]
                ),
                "preview_columns": int(
                    preview.shape[1]
                ),
                "rows_removed": int(
                    original.shape[0]
                    - preview.shape[0]
                ),
                "columns_removed": int(
                    original.shape[1]
                    - preview.shape[1]
                ),
                "values_changed": values_changed,
            },
            "before_sample": (
                CleaningPreviewService._sample(
                    dataframe=original,
                    preferred_indices=affected_indices,
                )
            ),
            "after_sample": (
                CleaningPreviewService._sample(
                    dataframe=preview,
                    preferred_indices=affected_indices,
                )
            ),
            "warnings": warnings,
        }

    @staticmethod
    def _validate_columns(
        *,
        dataframe: pd.DataFrame,
        columns: list[str],
    ) -> None:
        missing_columns = [
            column
            for column in columns
            if column not in dataframe.columns
        ]

        if missing_columns:
            raise ValueError(
                "Unknown columns: "
                + ", ".join(
                    missing_columns
                )
            )

    @staticmethod
    def _require_numeric(
        dataframe: pd.DataFrame,
        column: str,
    ) -> None:
        if not pd.api.types.is_numeric_dtype(
            dataframe[column]
        ):
            raise ValueError(
                f"{column} must be numeric for this action."
            )

    @staticmethod
    def _find_affected_indices(
        *,
        original: pd.DataFrame,
        preview: pd.DataFrame,
    ) -> list[Any]:
        affected_indices: list[Any] = []

        removed_indices = (
            original.index
            .difference(preview.index)
            .tolist()
        )

        affected_indices.extend(
            removed_indices
        )

        common_indices = (
            original.index
            .intersection(preview.index)
        )

        common_columns = [
            column
            for column in original.columns
            if column in preview.columns
        ]

        if (
            len(common_indices) > 0
            and common_columns
        ):
            original_values = original.loc[
                common_indices,
                common_columns,
            ]

            preview_values = preview.loc[
                common_indices,
                common_columns,
            ]

            equal_values = (
                original_values.eq(
                    preview_values
                )
                | (
                    original_values.isna()
                    & preview_values.isna()
                )
            )

            changed_rows = (
                ~equal_values.all(axis=1)
            )

            affected_indices.extend(
                common_indices[
                    changed_rows
                ].tolist()
            )

        if (
            original.shape[1]
            != preview.shape[1]
            and not affected_indices
        ):
            affected_indices.extend(
                original.index[
                    :10
                ].tolist()
            )

        return list(
            dict.fromkeys(
                affected_indices
            )
        )

    @staticmethod
    def _sample(
        *,
        dataframe: pd.DataFrame,
        preferred_indices: list[Any],
    ) -> list[dict[str, Any]]:
        available_indices = [
            index
            for index in preferred_indices
            if index in dataframe.index
        ]

        unique_indices = list(
            dict.fromkeys(
                available_indices
            )
        )

        if unique_indices:
            sample = dataframe.loc[
                unique_indices[:10]
            ].copy()
        else:
            sample = (
                dataframe
                .head(10)
                .copy()
            )

        sample = sample.replace(
            {
                np.nan: None,
                np.inf: None,
                -np.inf: None,
            }
        )

        return sample.to_dict(
            orient="records"
        )