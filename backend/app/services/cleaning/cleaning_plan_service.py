from typing import Any

import numpy as np
import pandas as pd


class CleaningPlanService:
    """
    Applies a sequence of cleaning actions to an
    in-memory DataFrame copy.

    The original dataset is never modified.
    """

    @staticmethod
    def execute(
        *,
        dataframe: pd.DataFrame,
        actions: list[dict[str, Any]],
    ) -> dict[str, Any]:
        original = dataframe.copy()
        cleaned = dataframe.copy()

        before_state = (
            CleaningPlanService._dataset_state(
                original
            )
        )

        action_results: list[
            dict[str, Any]
        ] = []

        global_warnings: list[str] = []

        for action_item in actions:
            action = str(
                action_item.get(
                    "action",
                    "",
                )
            )

            columns = [
                str(column)
                for column in action_item.get(
                    "columns",
                    [],
                )
            ]

            result = (
                CleaningPlanService._apply_action(
                    dataframe=cleaned,
                    action=action,
                    columns=columns,
                )
            )

            cleaned = result.pop(
                "dataframe"
            )

            action_results.append(
                result
            )

            global_warnings.extend(
                result.get(
                    "warnings",
                    [],
                )
            )

        after_state = (
            CleaningPlanService._dataset_state(
                cleaned
            )
        )

        before_issue_count = (
            CleaningPlanService._issue_count(
                before_state
            )
        )

        after_issue_count = (
            CleaningPlanService._issue_count(
                after_state
            )
        )

        applied_actions = sum(
            result["status"] == "applied"
            for result in action_results
        )

        skipped_actions = sum(
            result["status"] == "skipped"
            for result in action_results
        )

        failed_actions = sum(
            result["status"] == "failed"
            for result in action_results
        )

        return {
            "dataframe": cleaned,
            "before": before_state,
            "after": after_state,
            "total_actions": len(
                action_results
            ),
            "applied_actions": applied_actions,
            "skipped_actions": skipped_actions,
            "failed_actions": failed_actions,
            "resolved_issues": max(
                before_issue_count
                - after_issue_count,
                0,
            ),
            "remaining_issues": (
                after_issue_count
            ),
            "actions": action_results,
            "cleaned_sample": (
                CleaningPlanService._sample(
                    cleaned
                )
            ),
            "warnings": list(
                dict.fromkeys(
                    global_warnings
                )
            ),
        }

    @staticmethod
    def _apply_action(
        *,
        dataframe: pd.DataFrame,
        action: str,
        columns: list[str],
    ) -> dict[str, Any]:
        working = dataframe.copy()

        try:
            CleaningPlanService._validate_columns(
                dataframe=working,
                columns=columns,
            )

            if action == "drop_empty_rows":
                return (
                    CleaningPlanService
                    ._drop_empty_rows(
                        dataframe=working,
                    )
                )

            if action == "drop_missing_rows":
                return (
                    CleaningPlanService
                    ._drop_missing_rows(
                        dataframe=working,
                        columns=columns,
                    )
                )

            if action == "fill_missing_mean":
                return (
                    CleaningPlanService
                    ._fill_missing(
                        dataframe=working,
                        columns=columns,
                        method="mean",
                    )
                )

            if action == "fill_missing_median":
                return (
                    CleaningPlanService
                    ._fill_missing(
                        dataframe=working,
                        columns=columns,
                        method="median",
                    )
                )

            if action == "fill_missing_mode":
                return (
                    CleaningPlanService
                    ._fill_missing(
                        dataframe=working,
                        columns=columns,
                        method="mode",
                    )
                )

            if action == "drop_duplicates":
                return (
                    CleaningPlanService
                    ._drop_duplicates(
                        dataframe=working
                    )
                )

            if action == "drop_column":
                return (
                    CleaningPlanService
                    ._drop_columns(
                        dataframe=working,
                        columns=columns,
                    )
                )

            if action == "one_hot_encode":
                return (
                    CleaningPlanService
                    ._one_hot_encode(
                        dataframe=working,
                        columns=columns,
                    )
                )

            if action == "frequency_encode":
                return (
                    CleaningPlanService
                    ._frequency_encode(
                        dataframe=working,
                        columns=columns,
                    )
                )

            if action == "standardize":
                return (
                    CleaningPlanService
                    ._scale_columns(
                        dataframe=working,
                        columns=columns,
                        method="standardize",
                    )
                )

            if action == "normalize":
                return (
                    CleaningPlanService
                    ._scale_columns(
                        dataframe=working,
                        columns=columns,
                        method="normalize",
                    )
                )

            return {
                "dataframe": working,
                "action": action,
                "columns": columns,
                "status": "failed",
                "message": (
                    "Unsupported cleaning action."
                ),
                "values_changed": 0,
                "rows_removed": 0,
                "columns_removed": 0,
                "warnings": [],
            }

        except ValueError as exc:
            return {
                "dataframe": working,
                "action": action,
                "columns": columns,
                "status": "failed",
                "message": str(exc),
                "values_changed": 0,
                "rows_removed": 0,
                "columns_removed": 0,
                "warnings": [],
            }

        except Exception:
            return {
                "dataframe": working,
                "action": action,
                "columns": columns,
                "status": "failed",
                "message": (
                    "Unexpected error while "
                    "applying this action."
                ),
                "values_changed": 0,
                "rows_removed": 0,
                "columns_removed": 0,
                "warnings": [],
            }

    @staticmethod
    def _drop_empty_rows(
        *,
        dataframe: pd.DataFrame,
    ) -> dict[str, Any]:
        empty_mask = dataframe.isna().all(
            axis=1
        )

        rows_removed = int(
            empty_mask.sum()
        )

        if rows_removed == 0:
            return {
                "dataframe": dataframe,
                "action": "drop_empty_rows",
                "columns": [],
                "status": "skipped",
                "message": (
                    "No completely empty rows were found."
                ),
                "values_changed": 0,
                "rows_removed": 0,
                "columns_removed": 0,
                "warnings": [],
            }

        cleaned = dataframe.loc[
            ~empty_mask
        ].copy()

        return {
            "dataframe": cleaned,
            "action": "drop_empty_rows",
            "columns": [],
            "status": "applied",
            "message": (
                f"Removed {rows_removed} completely "
                "empty rows."
            ),
            "values_changed": rows_removed,
            "rows_removed": rows_removed,
            "columns_removed": 0,
            "warnings": [],
        }

    @staticmethod
    def _drop_missing_rows(
        *,
        dataframe: pd.DataFrame,
        columns: list[str],
    ) -> dict[str, Any]:
        selected_columns = (
            columns
            if columns
            else list(dataframe.columns)
        )

        affected_mask = dataframe[
            selected_columns
        ].isna().any(axis=1)

        rows_removed = int(
            affected_mask.sum()
        )

        if rows_removed == 0:
            return {
                "dataframe": dataframe,
                "action": "drop_missing_rows",
                "columns": columns,
                "status": "skipped",
                "message": (
                    "No rows with missing values "
                    "were found."
                ),
                "values_changed": 0,
                "rows_removed": 0,
                "columns_removed": 0,
                "warnings": [],
            }

        cleaned = dataframe.loc[
            ~affected_mask
        ].copy()

        return {
            "dataframe": cleaned,
            "action": "drop_missing_rows",
            "columns": columns,
            "status": "applied",
            "message": (
                f"Removed {rows_removed} rows "
                "containing missing values."
            ),
            "values_changed": rows_removed,
            "rows_removed": rows_removed,
            "columns_removed": 0,
            "warnings": [],
        }

    @staticmethod
    def _fill_missing(
        *,
        dataframe: pd.DataFrame,
        columns: list[str],
        method: str,
    ) -> dict[str, Any]:
        if not columns:
            raise ValueError(
                "Select at least one column."
            )

        cleaned = dataframe.copy()
        values_changed = 0
        warnings: list[str] = []

        for column in columns:
            missing_mask = cleaned[
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

            if method in {
                "mean",
                "median",
            }:
                CleaningPlanService._require_numeric(
                    cleaned,
                    column,
                )

            if method == "mean":
                fill_value = cleaned[
                    column
                ].mean()

            elif method == "median":
                fill_value = cleaned[
                    column
                ].median()

            else:
                mode_values = cleaned[
                    column
                ].mode(
                    dropna=True
                )

                if mode_values.empty:
                    warnings.append(
                        f"{column} could not be imputed."
                    )
                    continue

                fill_value = mode_values.iloc[0]

            if pd.isna(fill_value):
                warnings.append(
                    f"{column} could not be imputed."
                )
                continue

            cleaned.loc[
                missing_mask,
                column,
            ] = fill_value

            values_changed += missing_count

        if values_changed == 0:
            return {
                "dataframe": dataframe,
                "action": (
                    f"fill_missing_{method}"
                ),
                "columns": columns,
                "status": "skipped",
                "message": (
                    "No missing values were filled."
                ),
                "values_changed": 0,
                "rows_removed": 0,
                "columns_removed": 0,
                "warnings": warnings,
            }

        return {
            "dataframe": cleaned,
            "action": (
                f"fill_missing_{method}"
            ),
            "columns": columns,
            "status": "applied",
            "message": (
                f"Filled {values_changed} missing "
                f"values using {method}."
            ),
            "values_changed": values_changed,
            "rows_removed": 0,
            "columns_removed": 0,
            "warnings": warnings,
        }

    @staticmethod
    def _drop_duplicates(
        *,
        dataframe: pd.DataFrame,
    ) -> dict[str, Any]:
        duplicate_mask = (
            dataframe.duplicated(
                keep="first"
            )
        )

        rows_removed = int(
            duplicate_mask.sum()
        )

        if rows_removed == 0:
            return {
                "dataframe": dataframe,
                "action": "drop_duplicates",
                "columns": [],
                "status": "skipped",
                "message": (
                    "No duplicate rows were found."
                ),
                "values_changed": 0,
                "rows_removed": 0,
                "columns_removed": 0,
                "warnings": [],
            }

        cleaned = dataframe.loc[
            ~duplicate_mask
        ].copy()

        return {
            "dataframe": cleaned,
            "action": "drop_duplicates",
            "columns": [],
            "status": "applied",
            "message": (
                f"Removed {rows_removed} "
                "duplicate rows."
            ),
            "values_changed": rows_removed,
            "rows_removed": rows_removed,
            "columns_removed": 0,
            "warnings": [],
        }

    @staticmethod
    def _drop_columns(
        *,
        dataframe: pd.DataFrame,
        columns: list[str],
    ) -> dict[str, Any]:
        if not columns:
            raise ValueError(
                "Select at least one column."
            )

        cleaned = dataframe.drop(
            columns=columns
        )

        return {
            "dataframe": cleaned,
            "action": "drop_column",
            "columns": columns,
            "status": "applied",
            "message": (
                f"Removed {len(columns)} columns."
            ),
            "values_changed": 0,
            "rows_removed": 0,
            "columns_removed": len(
                columns
            ),
            "warnings": [],
        }

    @staticmethod
    def _one_hot_encode(
        *,
        dataframe: pd.DataFrame,
        columns: list[str],
    ) -> dict[str, Any]:
        if not columns:
            raise ValueError(
                "Select at least one column."
            )

        cleaned = dataframe.copy()
        original_column_count = int(
            cleaned.shape[1]
        )

        warnings: list[str] = []
        usable_columns: list[str] = []

        for column in columns:
            unique_count = int(
                cleaned[column].nunique(
                    dropna=True
                )
            )

            if unique_count == 0:
                warnings.append(
                    f"{column} has no usable values and "
                    "was not one-hot encoded."
                )
                continue

            usable_columns.append(column)

        if not usable_columns:
            return {
                "dataframe": dataframe,
                "action": "one_hot_encode",
                "columns": columns,
                "status": "skipped",
                "message": (
                    "No categorical columns were encoded."
                ),
                "values_changed": 0,
                "rows_removed": 0,
                "columns_removed": 0,
                "warnings": warnings,
            }

        cleaned = pd.get_dummies(
            cleaned,
            columns=usable_columns,
            prefix=usable_columns,
            prefix_sep="__",
            dummy_na=False,
            dtype=int,
        )

        new_column_count = int(
            cleaned.shape[1]
        )

        generated_columns = max(
            new_column_count
            - (
                original_column_count
                - len(usable_columns)
            ),
            0,
        )

        values_changed = int(
            cleaned.shape[0]
            * generated_columns
        )

        return {
            "dataframe": cleaned,
            "action": "one_hot_encode",
            "columns": usable_columns,
            "status": "applied",
            "message": (
                f"One-hot encoded {len(usable_columns)} "
                f"categorical columns into {generated_columns} "
                "binary feature columns."
            ),
            "values_changed": values_changed,
            "rows_removed": 0,
            "columns_removed": len(
                usable_columns
            ),
            "warnings": warnings,
        }

    @staticmethod
    def _frequency_encode(
        *,
        dataframe: pd.DataFrame,
        columns: list[str],
    ) -> dict[str, Any]:
        if not columns:
            raise ValueError(
                "Select at least one column."
            )

        cleaned = dataframe.copy()
        values_changed = 0
        warnings: list[str] = []
        encoded_columns: list[str] = []

        for column in columns:
            valid_mask = cleaned[column].notna()
            valid_count = int(
                valid_mask.sum()
            )

            if valid_count == 0:
                warnings.append(
                    f"{column} has no usable values and "
                    "was not frequency encoded."
                )
                continue

            frequencies = (
                cleaned.loc[
                    valid_mask,
                    column,
                ]
                .value_counts(
                    normalize=True
                )
            )

            encoded = cleaned.loc[
                valid_mask,
                column,
            ].map(frequencies)

            cleaned.loc[
                valid_mask,
                column,
            ] = encoded.astype(float)

            cleaned[column] = pd.to_numeric(
                cleaned[column],
                errors="coerce",
            )

            values_changed += valid_count
            encoded_columns.append(column)

        if values_changed == 0:
            return {
                "dataframe": dataframe,
                "action": "frequency_encode",
                "columns": columns,
                "status": "skipped",
                "message": (
                    "No categorical values were frequency encoded."
                ),
                "values_changed": 0,
                "rows_removed": 0,
                "columns_removed": 0,
                "warnings": warnings,
            }

        return {
            "dataframe": cleaned,
            "action": "frequency_encode",
            "columns": encoded_columns,
            "status": "applied",
            "message": (
                f"Frequency encoded {len(encoded_columns)} "
                f"categorical columns and transformed "
                f"{values_changed} values."
            ),
            "values_changed": values_changed,
            "rows_removed": 0,
            "columns_removed": 0,
            "warnings": warnings,
        }

    @staticmethod
    def _scale_columns(
        *,
        dataframe: pd.DataFrame,
        columns: list[str],
        method: str,
    ) -> dict[str, Any]:
        if not columns:
            raise ValueError(
                "Select at least one column."
            )

        cleaned = dataframe.copy()
        values_changed = 0
        warnings: list[str] = []

        for column in columns:
            CleaningPlanService._require_numeric(
                cleaned,
                column,
            )

            valid_mask = cleaned[
                column
            ].notna()

            valid_count = int(
                valid_mask.sum()
            )

            if valid_count == 0:
                warnings.append(
                    f"{column} has no numeric values."
                )
                continue

            series = cleaned.loc[
                valid_mask,
                column,
            ].astype(float)

            if method == "standardize":
                std_value = float(
                    series.std(ddof=0)
                )

                if np.isclose(
                    std_value,
                    0.0,
                ):
                    warnings.append(
                        f"{column} is constant and "
                        "cannot be standardized."
                    )
                    continue

                transformed = (
                    series - series.mean()
                ) / std_value

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
                        f"{column} is constant and "
                        "cannot be normalized."
                    )
                    continue

                transformed = (
                    series - minimum
                ) / value_range

            cleaned.loc[
                valid_mask,
                column,
            ] = transformed

            values_changed += valid_count

        if values_changed == 0:
            return {
                "dataframe": dataframe,
                "action": method,
                "columns": columns,
                "status": "skipped",
                "message": (
                    "No numeric values were transformed."
                ),
                "values_changed": 0,
                "rows_removed": 0,
                "columns_removed": 0,
                "warnings": warnings,
            }

        return {
            "dataframe": cleaned,
            "action": method,
            "columns": columns,
            "status": "applied",
            "message": (
                f"Transformed {values_changed} values "
                f"using {method}."
            ),
            "values_changed": values_changed,
            "rows_removed": 0,
            "columns_removed": 0,
            "warnings": warnings,
        }

    @staticmethod
    def _dataset_state(
        dataframe: pd.DataFrame,
    ) -> dict[str, int]:
        return {
            "rows": int(
                dataframe.shape[0]
            ),
            "columns": int(
                dataframe.shape[1]
            ),
            "missing_values": int(
                dataframe.isna().sum().sum()
            ),
            "duplicate_rows": int(
                dataframe.duplicated().sum()
            ),
        }

    @staticmethod
    def _issue_count(
        state: dict[str, int],
    ) -> int:
        return sum(
            [
                state["missing_values"] > 0,
                state["duplicate_rows"] > 0,
            ]
        )

    @staticmethod
    def _validate_columns(
        *,
        dataframe: pd.DataFrame,
        columns: list[str],
    ) -> None:
        unknown_columns = [
            column
            for column in columns
            if column not in dataframe.columns
        ]

        if unknown_columns:
            raise ValueError(
                "Unknown columns: "
                + ", ".join(
                    unknown_columns
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
                f"{column} must be numeric "
                "for this action."
            )

    @staticmethod
    def _sample(
        dataframe: pd.DataFrame,
    ) -> list[dict[str, Any]]:
        sample = (
            dataframe
            .head(10)
            .replace(
                {
                    np.nan: None,
                    np.inf: None,
                    -np.inf: None,
                }
            )
        )

        return sample.to_dict(
            orient="records"
        )