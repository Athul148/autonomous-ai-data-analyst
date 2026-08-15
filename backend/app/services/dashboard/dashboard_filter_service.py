from __future__ import annotations

from typing import Any

import pandas as pd

from app.schemas.dashboard_filter import (
    CategoricalDashboardFilter,
    DashboardFilterRequest,
    NumericRangeDashboardFilter,
)


class DashboardFilterService:
    """
    Applies dashboard slicer selections to a dataframe.

    The original dataframe is never modified.
    """

    @classmethod
    def apply(
        cls,
        *,
        dataframe: pd.DataFrame,
        request: DashboardFilterRequest,
    ) -> pd.DataFrame:
        filtered = dataframe.copy()

        for filter_item in request.filters:
            if isinstance(
                filter_item,
                CategoricalDashboardFilter,
            ):
                filtered = cls._apply_categorical(
                    dataframe=filtered,
                    column=filter_item.column,
                    value=filter_item.value,
                )

            elif isinstance(
                filter_item,
                NumericRangeDashboardFilter,
            ):
                filtered = cls._apply_numeric_range(
                    dataframe=filtered,
                    column=filter_item.column,
                    minimum=filter_item.minimum,
                    maximum=filter_item.maximum,
                )

        return filtered


    @staticmethod
    def _apply_categorical(
        *,
        dataframe: pd.DataFrame,
        column: str,
        value: Any,
    ) -> pd.DataFrame:
        if column not in dataframe.columns:
            raise ValueError(
                f"Unknown filter column: {column}"
            )

        series = dataframe[column]

        if pd.isna(value):
            return dataframe[
                series.isna()
            ]

        # First try direct comparison.
        mask = series == value

        if mask.any():
            return dataframe[
                mask
            ]

        # Fallback for frontend values that arrive
        # as strings while dataframe values are
        # numeric / boolean.
        normalized_series = (
            series
            .astype(str)
            .str.strip()
            .str.casefold()
        )

        normalized_value = (
            str(value)
            .strip()
            .casefold()
        )

        return dataframe[
            normalized_series ==
            normalized_value
        ]


    @staticmethod
    def _apply_numeric_range(
        *,
        dataframe: pd.DataFrame,
        column: str,
        minimum: float | None,
        maximum: float | None,
    ) -> pd.DataFrame:
        if column not in dataframe.columns:
            raise ValueError(
                f"Unknown filter column: {column}"
            )

        numeric_series = pd.to_numeric(
            dataframe[column],
            errors="coerce",
        )

        mask = numeric_series.notna()

        if minimum is not None:
            mask &= (
                numeric_series >=
                minimum
            )

        if maximum is not None:
            mask &= (
                numeric_series <=
                maximum
            )

        return dataframe[
            mask
        ]