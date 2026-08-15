from __future__ import annotations

from typing import Any

import pandas as pd
from pandas.api.types import (
    is_datetime64_any_dtype,
)


class ChartBuilderService:
    """
    Builds frontend-ready chart specifications
    from chart recommendations.

    Returned dictionaries contain only
    JSON-serializable data.

    Plotly rendering is handled by the frontend.
    """

    MAX_CATEGORY_VALUES = 15
    MAX_SCATTER_POINTS = 3000
    MAX_LINE_POINTS = 3000
    MAX_DISTRIBUTION_VALUES = 5000

    @staticmethod
    def build(
        dataframe: pd.DataFrame,
        chart_recommendations: list[
            dict[str, Any]
        ],
    ) -> list[dict[str, Any]]:
        charts: list[
            dict[str, Any]
        ] = []

        for index, recommendation in enumerate(
            chart_recommendations
        ):
            chart_type = str(
                recommendation.get(
                    "chart",
                    "",
                )
            ).lower()

            recommendation_type = str(
                recommendation.get(
                    "type",
                    "",
                )
            ).lower()

            raw_column = (
                recommendation.get(
                    "column"
                )
            )

            column = (
                str(raw_column)
                if raw_column is not None
                else None
            )

            x_column: str | None = None
            y_column: str | None = None

            if (
                recommendation_type
                == "relationship"
            ):
                relationship_columns = (
                    recommendation.get(
                        "columns",
                        [],
                    )
                )

                if (
                    isinstance(
                        relationship_columns,
                        list,
                    )
                    and len(
                        relationship_columns
                    ) >= 2
                ):
                    x_column = str(
                        relationship_columns[
                            0
                        ]
                    )

                    y_column = str(
                        relationship_columns[
                            1
                        ]
                    )

            try:
                chart = (
                    ChartBuilderService
                    ._build_chart(
                        dataframe=dataframe,
                        chart_type=chart_type,
                        column=column,
                        x_column=x_column,
                        y_column=y_column,
                        recommendation=(
                            recommendation
                        ),
                        index=index,
                    )
                )

                if chart is None:
                    continue

                chart["reason"] = str(
                    recommendation.get(
                        "reason",
                        "",
                    )
                )

                charts.append(
                    chart
                )

            except (
                KeyError,
                TypeError,
                ValueError,
            ):
                continue

        return charts

    @staticmethod
    def _build_chart(
        *,
        dataframe: pd.DataFrame,
        chart_type: str,
        column: str | None,
        x_column: str | None,
        y_column: str | None,
        recommendation: dict[
            str,
            Any,
        ],
        index: int,
    ) -> dict[str, Any] | None:
        # -------------------------------------------------
        # Histogram
        # -------------------------------------------------

        if (
            chart_type == "histogram"
            and column
        ):
            return (
                ChartBuilderService
                ._histogram(
                    dataframe=dataframe,
                    column=column,
                    index=index,
                )
            )

        # -------------------------------------------------
        # Normal bar chart
        # -------------------------------------------------

        if (
            chart_type
            in {
                "bar",
                "bar_chart",
                "count",
                "count_plot",
            }
            and column
        ):
            return (
                ChartBuilderService
                ._bar(
                    dataframe=dataframe,
                    column=column,
                    index=index,
                )
            )

        # -------------------------------------------------
        # Pie
        # -------------------------------------------------

        if (
            chart_type
            in {
                "pie",
                "pie_chart",
            }
            and column
        ):
            return (
                ChartBuilderService
                ._pie(
                    dataframe=dataframe,
                    column=column,
                    index=index,
                )
            )

        # -------------------------------------------------
        # Grouped one-hot categorical bar
        # -------------------------------------------------

        if (
            chart_type
            == "grouped_one_hot_bar"
        ):
            columns = (
                recommendation.get(
                    "columns",
                    [],
                )
            )

            group_name = str(
                recommendation.get(
                    "group_name",
                    "Category",
                )
            )

            if isinstance(
                columns,
                list,
            ):
                return (
                    ChartBuilderService
                    ._grouped_one_hot_bar(
                        dataframe=dataframe,
                        columns=[
                            str(column_name)
                            for column_name
                            in columns
                        ],
                        group_name=(
                            group_name
                        ),
                        index=index,
                    )
                )

        # -------------------------------------------------
        # Box plot
        # -------------------------------------------------

        if (
            chart_type
            in {
                "box",
                "box_plot",
            }
            and column
        ):
            return (
                ChartBuilderService
                ._box(
                    dataframe=dataframe,
                    column=column,
                    index=index,
                )
            )

        # -------------------------------------------------
        # Line / area
        # -------------------------------------------------

        if chart_type in {
            "line",
            "line_chart",
            "area",
            "area_chart",
        }:
            resolved_x = (
                x_column
                or recommendation.get(
                    "x_column"
                )
            )

            resolved_y = (
                y_column
                or recommendation.get(
                    "y_column"
                )
            )

            if (
                resolved_x
                and resolved_y
            ):
                return (
                    ChartBuilderService
                    ._line(
                        dataframe=dataframe,
                        x_column=str(
                            resolved_x
                        ),
                        y_column=str(
                            resolved_y
                        ),
                        index=index,
                        area=(
                            chart_type
                            in {
                                "area",
                                "area_chart",
                            }
                        ),
                    )
                )

        # -------------------------------------------------
        # Scatter
        # -------------------------------------------------

        if chart_type in {
            "scatter",
            "scatter_plot",
        }:
            resolved_x = (
                x_column
                or recommendation.get(
                    "x_column"
                )
            )

            resolved_y = (
                y_column
                or recommendation.get(
                    "y_column"
                )
            )

            if (
                resolved_x
                and resolved_y
            ):
                return (
                    ChartBuilderService
                    ._scatter(
                        dataframe=dataframe,
                        x_column=str(
                            resolved_x
                        ),
                        y_column=str(
                            resolved_y
                        ),
                        index=index,
                    )
                )

        return None

    @staticmethod
    def _histogram(
        *,
        dataframe: pd.DataFrame,
        column: str,
        index: int,
    ) -> dict[str, Any] | None:
        if (
            column
            not in dataframe.columns
        ):
            return None

        series = pd.to_numeric(
            dataframe[column],
            errors="coerce",
        ).dropna()

        if series.empty:
            return None

        sample = (
            ChartBuilderService
            ._sample_series(
                series=series,
                limit=(
                    ChartBuilderService
                    .MAX_DISTRIBUTION_VALUES
                ),
            )
        )

        return {
            "id": (
                f"histogram-"
                f"{index}-"
                f"{column}"
            ),
            "type": "histogram",
            "title": (
                f"{column} Distribution"
            ),
            "x_label": column,
            "y_label": "Frequency",
            "data": {
                "values": [
                    (
                        ChartBuilderService
                        ._to_json_value(
                            value
                        )
                    )
                    for value
                    in sample.tolist()
                ],
            },
        }

    @staticmethod
    def _bar(
        *,
        dataframe: pd.DataFrame,
        column: str,
        index: int,
    ) -> dict[str, Any] | None:
        if (
            column
            not in dataframe.columns
        ):
            return None

        counts = (
            dataframe[column]
            .fillna("Missing")
            .astype(str)
            .value_counts()
            .head(
                ChartBuilderService
                .MAX_CATEGORY_VALUES
            )
        )

        if counts.empty:
            return None

        return {
            "id": (
                f"bar-"
                f"{index}-"
                f"{column}"
            ),
            "type": "bar",
            "title": (
                f"{column} Counts"
            ),
            "x_label": column,
            "y_label": "Count",
            "data": {
                "labels": [
                    str(value)
                    for value
                    in counts.index.tolist()
                ],
                "values": [
                    int(value)
                    for value
                    in counts.values
                ],
            },
        }

    @staticmethod
    def _pie(
        *,
        dataframe: pd.DataFrame,
        column: str,
        index: int,
    ) -> dict[str, Any] | None:
        bar_chart = (
            ChartBuilderService
            ._bar(
                dataframe=dataframe,
                column=column,
                index=index,
            )
        )

        if bar_chart is None:
            return None

        return {
            **bar_chart,
            "id": (
                f"pie-"
                f"{index}-"
                f"{column}"
            ),
            "type": "pie",
            "title": (
                f"{column} Composition"
            ),
        }

    @staticmethod
    def _grouped_one_hot_bar(
        *,
        dataframe: pd.DataFrame,
        columns: list[str],
        group_name: str,
        index: int,
    ) -> dict[str, Any] | None:
        """
        Converts one-hot encoded columns back
        into one meaningful categorical chart.

        Example:

        Gender__Female
        Gender__Male

        becomes:

        Female -> count
        Male   -> count
        """

        valid_columns = [
            column
            for column in columns
            if column
            in dataframe.columns
        ]

        if len(valid_columns) < 2:
            return None

        labels: list[str] = []
        values: list[int] = []

        for column in valid_columns:
            numeric_series = (
                pd.to_numeric(
                    dataframe[column],
                    errors="coerce",
                )
                .fillna(0)
            )

            count = int(
                (
                    numeric_series
                    == 1
                ).sum()
            )

            if "__" in column:
                label = (
                    column.split(
                        "__",
                        1,
                    )[1]
                )
            else:
                label = column

            labels.append(
                label
            )

            values.append(
                count
            )

        if not labels:
            return None

        return {
            "id": (
                f"bar-"
                f"{index}-"
                f"{group_name}"
            ),
            "type": "bar",
            "title": (
                f"{group_name} "
                "Distribution"
            ),
            "x_label": group_name,
            "y_label": "Count",
            "data": {
                "labels": labels,
                "values": values,
            },
        }

    @staticmethod
    def _box(
        *,
        dataframe: pd.DataFrame,
        column: str,
        index: int,
    ) -> dict[str, Any] | None:
        if (
            column
            not in dataframe.columns
        ):
            return None

        series = pd.to_numeric(
            dataframe[column],
            errors="coerce",
        ).dropna()

        if series.empty:
            return None

        sample = (
            ChartBuilderService
            ._sample_series(
                series=series,
                limit=(
                    ChartBuilderService
                    .MAX_DISTRIBUTION_VALUES
                ),
            )
        )

        return {
            "id": (
                f"box-"
                f"{index}-"
                f"{column}"
            ),
            "type": "box",
            "title": (
                f"{column} Box Plot"
            ),
            "x_label": column,
            "data": {
                "values": [
                    (
                        ChartBuilderService
                        ._to_json_value(
                            value
                        )
                    )
                    for value
                    in sample.tolist()
                ],
            },
        }

    @staticmethod
    def _scatter(
        *,
        dataframe: pd.DataFrame,
        x_column: str,
        y_column: str,
        index: int,
    ) -> dict[str, Any] | None:
        if (
            x_column
            not in dataframe.columns
            or y_column
            not in dataframe.columns
        ):
            return None

        data = dataframe[
            [
                x_column,
                y_column,
            ]
        ].copy()

        data[x_column] = (
            pd.to_numeric(
                data[x_column],
                errors="coerce",
            )
        )

        data[y_column] = (
            pd.to_numeric(
                data[y_column],
                errors="coerce",
            )
        )

        data = data.dropna()

        if data.empty:
            return None

        data = (
            ChartBuilderService
            ._sample_dataframe(
                dataframe=data,
                limit=(
                    ChartBuilderService
                    .MAX_SCATTER_POINTS
                ),
            )
        )

        return {
            "id": (
                f"scatter-"
                f"{index}-"
                f"{x_column}-"
                f"{y_column}"
            ),
            "type": "scatter",
            "title": (
                f"{x_column} "
                f"vs {y_column}"
            ),
            "x_label": x_column,
            "y_label": y_column,
            "data": {
                "x": [
                    (
                        ChartBuilderService
                        ._to_json_value(
                            value
                        )
                    )
                    for value
                    in data[
                        x_column
                    ].tolist()
                ],
                "y": [
                    (
                        ChartBuilderService
                        ._to_json_value(
                            value
                        )
                    )
                    for value
                    in data[
                        y_column
                    ].tolist()
                ],
            },
        }

    @staticmethod
    def _line(
        *,
        dataframe: pd.DataFrame,
        x_column: str,
        y_column: str,
        index: int,
        area: bool,
    ) -> dict[str, Any] | None:
        if (
            x_column
            not in dataframe.columns
            or y_column
            not in dataframe.columns
        ):
            return None

        data = dataframe[
            [
                x_column,
                y_column,
            ]
        ].copy()

        data[y_column] = (
            pd.to_numeric(
                data[y_column],
                errors="coerce",
            )
        )

        if not is_datetime64_any_dtype(
            data[x_column]
        ):
            parsed_dates = (
                pd.to_datetime(
                    data[x_column],
                    errors="coerce",
                )
            )

            if (
                parsed_dates
                .notna()
                .mean()
                >= 0.70
            ):
                data[x_column] = (
                    parsed_dates
                )

        data = data.dropna()

        if data.empty:
            return None

        data = data.sort_values(
            by=x_column
        )

        data = (
            ChartBuilderService
            ._sample_dataframe(
                dataframe=data,
                limit=(
                    ChartBuilderService
                    .MAX_LINE_POINTS
                ),
            )
        )

        chart_type = (
            "area"
            if area
            else "line"
        )

        return {
            "id": (
                f"{chart_type}-"
                f"{index}-"
                f"{x_column}-"
                f"{y_column}"
            ),
            "type": chart_type,
            "title": (
                f"{y_column} "
                f"by {x_column}"
            ),
            "x_label": x_column,
            "y_label": y_column,
            "data": {
                "x": [
                    (
                        ChartBuilderService
                        ._to_json_value(
                            value
                        )
                    )
                    for value
                    in data[
                        x_column
                    ].tolist()
                ],
                "y": [
                    (
                        ChartBuilderService
                        ._to_json_value(
                            value
                        )
                    )
                    for value
                    in data[
                        y_column
                    ].tolist()
                ],
            },
        }

    @staticmethod
    def _sample_series(
        *,
        series: pd.Series,
        limit: int,
    ) -> pd.Series:
        if len(series) <= limit:
            return series

        return series.sample(
            n=limit,
            random_state=42,
        )

    @staticmethod
    def _sample_dataframe(
        *,
        dataframe: pd.DataFrame,
        limit: int,
    ) -> pd.DataFrame:
        if (
            len(dataframe)
            <= limit
        ):
            return dataframe

        return dataframe.sample(
            n=limit,
            random_state=42,
        )

    @staticmethod
    def _to_json_value(
        value: Any,
    ) -> Any:
        if pd.isna(value):
            return None

        if isinstance(
            value,
            pd.Timestamp,
        ):
            return (
                value.isoformat()
            )

        if hasattr(
            value,
            "item",
        ):
            return value.item()

        return value