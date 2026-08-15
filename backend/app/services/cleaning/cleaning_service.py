from typing import Any

import pandas as pd


class CleaningService:
    """
    Converts existing dataset analysis results into
    safe, explainable cleaning recommendations.

    This service does not modify the original dataset.
    """

    @staticmethod
    def recommend(
        *,
        analysis: dict[str, Any],
        dataframe: pd.DataFrame,
    ) -> dict[str, Any]:
        recommendations: list[dict[str, Any]] = []

        quality = analysis.get(
            "quality",
            {},
        )

        validation = analysis.get(
            "validation",
            {},
        )

        datatypes = analysis.get(
            "datatypes",
            {},
        )

        missing_values = int(
            quality.get(
                "missing_values",
                0,
            )
            or 0
        )

        duplicate_rows = int(
            quality.get(
                "duplicate_rows",
                0,
            )
            or 0
        )

        if missing_values > 0:
            recommendations.append(
                {
                    "id": "handle_missing_values",
                    "category": "missing_values",
                    "priority": "high",
                    "title": "Handle missing values",
                    "description": (
                        f"{missing_values} missing values were detected. "
                        "Inspect the affected columns and choose a suitable "
                        "field-specific strategy such as imputation or leaving "
                        "the value missing when appropriate."
                    ),
                    "automatic": False,
                    "affected_columns": (
                        CleaningService._missing_columns(
                            dataframe
                        )
                    ),
                }
            )

        if duplicate_rows > 0:
            recommendations.append(
                {
                    "id": "review_duplicate_rows",
                    "category": "duplicates",
                    "priority": "high",
                    "title": "Review duplicate rows",
                    "description": (
                        f"{duplicate_rows} duplicate rows were detected. "
                        "Confirm whether they are accidental duplicates before "
                        "removing them."
                    ),
                    "automatic": False,
                    "affected_columns": [],
                }
            )

        recommendations.extend(
            CleaningService._validation_recommendations(
                validation
            )
        )

        recommendations.extend(
            CleaningService._datatype_recommendations(
                datatypes
            )
        )

        priority_order = {
            "high": 0,
            "medium": 1,
            "low": 2,
        }

        recommendations.sort(
            key=lambda item: priority_order.get(
                item["priority"],
                99,
            )
        )

        return {
            "summary": {
                "total_recommendations": len(
                    recommendations
                ),
                "high_priority": sum(
                    item["priority"] == "high"
                    for item in recommendations
                ),
                "medium_priority": sum(
                    item["priority"] == "medium"
                    for item in recommendations
                ),
                "low_priority": sum(
                    item["priority"] == "low"
                    for item in recommendations
                ),
                "automatic_actions": sum(
                    bool(item["automatic"])
                    for item in recommendations
                ),
            },
            "recommendations": recommendations,
        }

    @staticmethod
    def _missing_columns(
        dataframe: pd.DataFrame,
    ) -> list[str]:
        missing_counts = (
            dataframe
            .isna()
            .sum()
        )

        return sorted(
            [
                str(column)
                for column, count
                in missing_counts.items()
                if int(count) > 0
            ]
        )

    @staticmethod
    def _validation_recommendations(
        validation: dict[str, Any],
    ) -> list[dict[str, Any]]:
        results: list[dict[str, Any]] = []

        ignored_missing_types = {
            "missing_values",
            "missing_categories",
            "missing_identifiers",
        }

        for group_name in (
            "numeric",
            "categorical",
            "identifier",
        ):
            for column_result in validation.get(
                group_name,
                [],
            ):
                column = str(
                    column_result.get(
                        "column",
                        "",
                    )
                )

                for issue in column_result.get(
                    "issues",
                    [],
                ):
                    issue_type = str(
                        issue.get(
                            "type",
                            "",
                        )
                    )

                    if (
                        issue_type
                        in ignored_missing_types
                    ):
                        continue

                    message = str(
                        issue.get(
                            "message",
                            "A validation issue was detected.",
                        )
                    )

                    results.append(
                        {
                            "id": (
                                f"validation_{group_name}_"
                                f"{column}_{issue_type}"
                            ),
                            "category": "validation",
                            "priority": (
                                "high"
                                if group_name == "identifier"
                                else "medium"
                            ),
                            "title": (
                                f"Review {column}"
                                if column
                                else "Review validation issue"
                            ),
                            "description": message,
                            "automatic": False,
                            "affected_columns": (
                                [column]
                                if column
                                else []
                            ),
                        }
                    )

        return results

    @staticmethod
    def _datatype_recommendations(
        datatypes: dict[str, Any],
    ) -> list[dict[str, Any]]:
        results: list[dict[str, Any]] = []

        identifier_columns: list[str] = []
        categorical_columns: list[str] = []
        numeric_columns: list[str] = []

        for column, metadata in datatypes.items():
            category = str(
                metadata.get(
                    "category",
                    "",
                )
            )

            if category == "identifier":
                identifier_columns.append(
                    column
                )

            elif category in {
                "categorical",
                "binary_categorical",
            }:
                categorical_columns.append(
                    column
                )

            elif category in {
                "continuous_numeric",
                "discrete_numeric",
                "numeric",
            }:
                numeric_columns.append(
                    column
                )

        if identifier_columns:
            results.append(
                {
                    "id": "exclude_identifiers",
                    "category": "feature_preparation",
                    "priority": "medium",
                    "title": "Exclude identifier columns from modelling",
                    "description": (
                        "Identifier columns usually identify records rather "
                        "than explain patterns and should normally be excluded "
                        "from statistical or machine-learning features."
                    ),
                    "automatic": False,
                    "affected_columns": sorted(
                        identifier_columns
                    ),
                }
            )

        if categorical_columns:
            results.append(
                {
                    "id": "encode_categorical_columns",
                    "category": "feature_preparation",
                    "priority": "medium",
                    "title": "Prepare categorical columns",
                    "description": (
                        "Categorical columns may require encoding for "
                        "machine-learning workflows. The correct method depends "
                        "on category meaning, cardinality, and model choice."
                    ),
                    "automatic": False,
                    "affected_columns": sorted(
                        categorical_columns
                    ),
                }
            )

        if numeric_columns:
            results.append(
                {
                    "id": "review_numeric_scaling",
                    "category": "feature_preparation",
                    "priority": "low",
                    "title": "Review numeric scaling requirements",
                    "description": (
                        "Some models benefit from standardized or normalized "
                        "numeric features, while tree-based models often do not. "
                        "Apply scaling only when required by the selected model."
                    ),
                    "automatic": False,
                    "affected_columns": sorted(
                        numeric_columns
                    ),
                }
            )

        return results