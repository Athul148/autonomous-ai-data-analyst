import pandas as pd


class StatisticsService:
    """
    Generates descriptive statistics for numeric columns.
    """

    @staticmethod
    def generate(dataframe: pd.DataFrame) -> dict:
        statistics = {}

        numeric_columns = dataframe.select_dtypes(
            include=["number"]
        ).columns

        for column in numeric_columns:

            series = dataframe[column].dropna()

            if series.empty:
                continue

            statistics[column] = {
                "count": int(series.count()),
                "mean": round(float(series.mean()), 2),
                "median": round(float(series.median()), 2),
                "mode": (
                    round(float(series.mode().iloc[0]), 2)
                    if not series.mode().empty
                    else None
                ),
                "std": round(float(series.std()), 2),
                "variance": round(float(series.var()), 2),
                "min": round(float(series.min()), 2),
                "q1": round(float(series.quantile(0.25)), 2),
                "q3": round(float(series.quantile(0.75)), 2),
                "max": round(float(series.max()), 2),
                "iqr": round(
                    float(
                        series.quantile(0.75)
                        - series.quantile(0.25)
                    ),
                    2,
                ),
                "skewness": round(float(series.skew()), 2),
                "kurtosis": round(float(series.kurtosis()), 2),
            }

        return statistics