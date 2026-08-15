import pandas as pd
from pandas.api.types import (
    is_bool_dtype,
    is_datetime64_any_dtype,
    is_numeric_dtype,
)


class DatatypeService:
    """
    Classifies dataset columns by analytical role.
    """

    @staticmethod
    def classify(dataframe: pd.DataFrame) -> dict[str, dict]:
        result: dict[str, dict] = {}

        row_count = len(dataframe)

        for column in dataframe.columns:
            series = dataframe[column]
            non_null = series.dropna()
            unique_count = int(non_null.nunique())

            column_name = column.lower().strip()

            if is_bool_dtype(series):
                category = "boolean"

            elif is_datetime64_any_dtype(series):
                category = "datetime"

            elif DatatypeService._is_identifier(
                column_name=column_name,
                unique_count=unique_count,
                row_count=row_count,
            ):
                category = "identifier"

            elif is_numeric_dtype(series):
                if unique_count == 2:
                    category = "binary"

                elif unique_count <= 20:
                    category = "discrete_numeric"

                else:
                    category = "continuous_numeric"

            else:
                unique_ratio = (
                    unique_count / len(non_null)
                    if len(non_null) > 0
                    else 0
                )

                if unique_count == 2:
                    category = "binary_categorical"

                elif unique_count <= 50 or unique_ratio <= 0.05:
                    category = "categorical"

                else:
                    category = "text"

            result[column] = {
                "dtype": str(series.dtype),
                "category": category,
                "unique_count": unique_count,
                "missing_count": int(series.isna().sum()),
            }

        return result

    @staticmethod
    def _is_identifier(
        *,
        column_name: str,
        unique_count: int,
        row_count: int,
    ) -> bool:
        identifier_keywords = {
            "id",
            "customerid",
            "customer_id",
            "userid",
            "user_id",
            "transactionid",
            "transaction_id",
        }

        if column_name in identifier_keywords:
            return True

        if row_count == 0:
            return False

        unique_ratio = unique_count / row_count

        return (
            column_name.endswith("id")
            and unique_ratio >= 0.95
        )