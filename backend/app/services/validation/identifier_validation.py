import pandas as pd


class IdentifierValidation:
    """
    Validates identifier columns.
    """

    @staticmethod
    def validate(
        dataframe: pd.DataFrame,
        datatype_result: dict[str, dict],
    ) -> list[dict]:
        issues: list[dict] = []

        for column, metadata in datatype_result.items():
            if metadata["category"] != "identifier":
                continue

            series = dataframe[column]
            column_issues: list[dict] = []

            missing_count = int(series.isna().sum())

            if missing_count > 0:
                column_issues.append(
                    {
                        "type": "missing_identifiers",
                        "count": missing_count,
                        "message": (
                            f"{missing_count} missing identifier values detected."
                        ),
                    }
                )

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
                        "type": "empty_identifiers",
                        "count": empty_count,
                        "message": (
                            f"{empty_count} empty identifier values detected."
                        ),
                    }
                )

            duplicate_count = int(
                series.dropna().duplicated(keep=False).sum()
            )

            if duplicate_count > 0:
                column_issues.append(
                    {
                        "type": "duplicate_identifiers",
                        "count": duplicate_count,
                        "message": (
                            f"{duplicate_count} identifier values belong "
                            "to duplicated records."
                        ),
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