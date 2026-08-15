import numpy as np
import pandas as pd


class DistributionService:
    @staticmethod
    def analyze(
        dataframe: pd.DataFrame,
        column: str,
        bins: int = 20,
    ) -> dict:
        if column not in dataframe.columns:
            raise ValueError(
                f"Column '{column}' not found."
            )

        series = pd.to_numeric(
            dataframe[column],
            errors="coerce",
        ).dropna()

        if series.empty:
            raise ValueError(
                f"Column '{column}' has no numeric values."
            )

        counts, edges = np.histogram(
            series,
            bins=bins,
        )

        q1 = float(series.quantile(0.25))
        median = float(series.median())
        q3 = float(series.quantile(0.75))
        iqr = q3 - q1

        lower_bound = q1 - (1.5 * iqr)
        upper_bound = q3 + (1.5 * iqr)

        outliers = series[
            (series < lower_bound)
            | (series > upper_bound)
        ]

        sample_size = min(
            5000,
            len(series),
        )

        sampled_values = (
            series.sample(
                n=sample_size,
                random_state=42,
            )
            .round(4)
            .tolist()
        )

        return {
            "column": column,
            "count": int(series.count()),
            "missing": int(
                dataframe[column].isna().sum()
            ),
            "histogram": {
                "counts": (
                    counts
                    .astype(int)
                    .tolist()
                ),
                "bin_edges": [
                    round(float(value), 4)
                    for value in edges
                ],
            },
            "box_plot": {
                "min": round(
                    float(series.min()),
                    4,
                ),
                "q1": round(q1, 4),
                "median": round(
                    median,
                    4,
                ),
                "q3": round(q3, 4),
                "max": round(
                    float(series.max()),
                    4,
                ),
                "lower_bound": round(
                    lower_bound,
                    4,
                ),
                "upper_bound": round(
                    upper_bound,
                    4,
                ),
            },
            "values": sampled_values,
            "outlier_count": int(
                outliers.count()
            ),
            "outlier_percentage": round(
                (
                    outliers.count()
                    / series.count()
                )
                * 100,
                2,
            ),
        }