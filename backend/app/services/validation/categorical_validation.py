import pandas as pd


class CategoricalValidation:
    """
    Validates categorical columns.
    """

    @staticmethod
    def validate(
        dataframe: pd.DataFrame,
        datatype_result: dict[str, dict],
    ) -> list[dict]:

        issues = []

        for column, metadata in datatype_result.items():

            if metadata["category"] not in (
                "categorical",
                "binary_categorical",
            ):
                continue

            series = dataframe[column]

            column_issues = []

            # Missing values
            missing_count = int(series.isna().sum())

            if missing_count > 0:
                column_issues.append(
                    {
                        "type": "missing_categories",
                        "count": missing_count,
                        "message": (
                            f"{missing_count} missing category values detected."
                        ),
                    }
                )

            # Empty strings
            empty_count = int(
                series.astype("string")
                .str.strip()
                .eq("")
                .fillna(False)
                .sum()
            )

            if empty_count > 0:
                column_issues.append(
                    {
                        "type": "empty_categories",
                        "count": empty_count,
                        "message": (
                            f"{empty_count} empty category values detected."
                        ),
                    }
                )

            # Rare categories (<1%)
            value_counts = (
                series.dropna()
                .value_counts(normalize=True)
            )

            rare_categories = value_counts[
                value_counts < 0.01
            ].index.tolist()

            if rare_categories:
                column_issues.append(
                    {
                        "type": "rare_categories",
                        "count": len(rare_categories),
                        "message": (
                            f"{len(rare_categories)} rare categories detected."
                        ),
                        "categories": rare_categories,
                    }
                )

            if column_issues:
                issues.append(
                    {
                        "column": column,
                        "issues": column_issues,
                    }
                )

        return issues