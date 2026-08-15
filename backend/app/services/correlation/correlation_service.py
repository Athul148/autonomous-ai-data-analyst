import numpy as np
import pandas as pd


class CorrelationService:
    """
    Performs correlation analysis on valid numeric analytical columns.
    """

    @staticmethod
    def analyze(
        dataframe: pd.DataFrame,
        datatype_result: dict[str, dict],
        threshold: float = 0.70,
    ) -> dict:
        excluded_categories = {
            "identifier",
            "binary_categorical",
            "categorical",
            "text",
            "datetime",
        }

        valid_columns = [
            column
            for column, metadata in datatype_result.items()
            if metadata["category"] not in excluded_categories
            and column in dataframe.columns
        ]

        numeric_df = dataframe[valid_columns].select_dtypes(
            include=["number"]
        )

        if numeric_df.shape[1] < 2:
            return {
                "correlation_matrix": {},
                "strong_correlations": [],
            }

        correlation_matrix = numeric_df.corr(
            method="pearson"
        )

        correlation_matrix = correlation_matrix.replace(
            [np.inf, -np.inf],
            np.nan,
        ).fillna(0.0)

        correlation_matrix = correlation_matrix.round(3)

        strong_relationships = []
        columns = correlation_matrix.columns

        for i in range(len(columns)):
            for j in range(i + 1, len(columns)):
                correlation = float(
                    correlation_matrix.iloc[i, j]
                )

                if not np.isfinite(correlation):
                    continue

                if abs(correlation) >= threshold:
                    strong_relationships.append(
                        {
                            "feature_1": str(columns[i]),
                            "feature_2": str(columns[j]),
                            "correlation": round(
                                correlation,
                                3,
                            ),
                            "strength": (
                                CorrelationService
                                .get_strength(correlation)
                            ),
                            "direction": (
                                "positive"
                                if correlation > 0
                                else "negative"
                            ),
                        }
                    )

        matrix_result = {
            str(row): {
                str(column): round(
                    float(value),
                    3,
                )
                for column, value in values.items()
            }
            for row, values in correlation_matrix.to_dict(
                orient="index"
            ).items()
        }

        return {
            "correlation_matrix": matrix_result,
            "strong_correlations": strong_relationships,
        }

    @staticmethod
    def get_strength(
        correlation: float,
    ) -> str:
        value = abs(correlation)

        if value >= 0.90:
            return "very_strong"

        if value >= 0.70:
            return "strong"

        if value >= 0.50:
            return "moderate"

        return "weak"