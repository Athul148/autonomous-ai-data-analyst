import pandas as pd


class NumericValidation:
    """
    Performs validation on numeric columns.

    Binary and one-hot encoded columns are excluded
    from IQR outlier detection because 0/1 values
    represent categories rather than continuous
    numeric measurements.
    """

    @staticmethod
    def validate(
        dataframe: pd.DataFrame,
    ) -> list[dict]:
        issues: list[dict] = []

        numeric_columns = (
            dataframe
            .select_dtypes(
                include=["number"]
            )
            .columns
        )

        for column in numeric_columns:
            series = (
                dataframe[column]
                .dropna()
            )

            if series.empty:
                continue

            column_issues: list[dict] = []

            # ---------------------------------------------
            # Detect whether this is a binary feature
            # ---------------------------------------------

            unique_values = set(
                pd.to_numeric(
                    series,
                    errors="coerce",
                )
                .dropna()
                .unique()
                .tolist()
            )

            is_binary = (
                len(unique_values) <= 2
                and unique_values.issubset(
                    {0, 1}
                )
            )

            # One-hot encoded columns follow:
            #
            # Gender__Male
            # Gender__Female
            # Contract Length__Annual
            #
            is_one_hot = (
                "__" in str(column)
                and is_binary
            )

            # ---------------------------------------------
            # Infinite values
            # ---------------------------------------------

            infinite_count = int(
                series.isin(
                    [
                        float("inf"),
                        float("-inf"),
                    ]
                ).sum()
            )

            if infinite_count > 0:
                column_issues.append(
                    {
                        "type": (
                            "infinite_values"
                        ),
                        "count": (
                            infinite_count
                        ),
                        "message": (
                            f"{infinite_count} "
                            "infinite values detected."
                        ),
                    }
                )

            # ---------------------------------------------
            # Negative values
            # ---------------------------------------------
            #
            # Keep the existing generic negative-value
            # detection for normal numeric columns.
            #
            # Binary / one-hot columns should only contain
            # 0 and 1, so this rule is unnecessary there.
            # ---------------------------------------------

            if not is_binary:
                negative_count = int(
                    (series < 0).sum()
                )

                if negative_count > 0:
                    column_issues.append(
                        {
                            "type": (
                                "negative_values"
                            ),
                            "count": (
                                negative_count
                            ),
                            "message": (
                                f"{negative_count} "
                                "negative values detected."
                            ),
                        }
                    )

            # ---------------------------------------------
            # IQR outlier detection
            # ---------------------------------------------
            #
            # IMPORTANT:
            #
            # Do not apply IQR outlier detection to
            # binary or one-hot categorical features.
            #
            # Example:
            #
            # Contract Length__Monthly
            #
            # values:
            #
            # 0
            # 0
            # 1
            # 0
            #
            # These are categories, not measurements.
            # ---------------------------------------------

            if (
                not is_binary
                and not is_one_hot
            ):
                q1 = series.quantile(
                    0.25
                )

                q3 = series.quantile(
                    0.75
                )

                iqr = q3 - q1

                # Only run the IQR rule when
                # there is actual spread.
                if (
                    pd.notna(iqr)
                    and iqr > 0
                ):
                    lower = (
                        q1
                        - (1.5 * iqr)
                    )

                    upper = (
                        q3
                        + (1.5 * iqr)
                    )

                    outlier_count = int(
                        (
                            (series < lower)
                            | (series > upper)
                        ).sum()
                    )

                    if outlier_count > 0:
                        column_issues.append(
                            {
                                "type": (
                                    "outliers"
                                ),
                                "count": (
                                    outlier_count
                                ),
                                "message": (
                                    f"{outlier_count} "
                                    "outliers detected "
                                    "using IQR."
                                ),
                            }
                        )

            # ---------------------------------------------
            # Domain-specific Age validation
            # ---------------------------------------------

            if (
                str(column).lower()
                == "age"
            ):
                invalid_age = int(
                    (series > 120).sum()
                )

                if invalid_age > 0:
                    column_issues.append(
                        {
                            "type": (
                                "invalid_age"
                            ),
                            "count": (
                                invalid_age
                            ),
                            "message": (
                                f"{invalid_age} "
                                "age values greater "
                                "than 120 detected."
                            ),
                        }
                    )

            # ---------------------------------------------
            # Store issues
            # ---------------------------------------------

            if column_issues:
                issues.append(
                    {
                        "column": (
                            str(column)
                        ),
                        "issues": (
                            column_issues
                        ),
                    }
                )

        return issues