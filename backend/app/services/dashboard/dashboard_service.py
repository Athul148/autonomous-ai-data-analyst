from __future__ import annotations

from typing import Any

import pandas as pd

from app.services.dashboard.dashboard_chart_service import (
    DashboardChartService,
)
from app.services.dashboard.kpi_service import (
    KPIService,
)


class DashboardService:
    """
    Builds the complete automatically generated
    analytical dashboard.

    The service combines:

    - KPI cards
    - selected visualizations
    - important analytical insights
    - useful dashboard filters

    Existing analysis and visualization services
    are reused instead of recalculating analytics.
    """

    MAX_INSIGHTS = 5
    MAX_FILTERS = 4

    @staticmethod
    def build(
        *,
        dataframe: pd.DataFrame,
        context: dict[str, Any],
    ) -> dict[str, Any]:

        dataset = context.get(
            "dataset",
            {},
        )

        dataset_name = str(
            dataset.get(
                "name",
                "Dataset",
            )
        )

        # -------------------------------------------------
        # KPI cards
        # -------------------------------------------------

        kpis = KPIService.build(
            context=context,
        )

        # -------------------------------------------------
        # Dashboard charts
        # -------------------------------------------------

        built_charts = (
            DashboardChartService.build(
                dataframe=dataframe,
                context=context,
            )
        )

        charts = (
            DashboardService
            ._prepare_dashboard_charts(
                built_charts
            )
        )

        # -------------------------------------------------
        # Insights
        # -------------------------------------------------

        insights = (
            DashboardService
            ._build_insights(
                context=context,
            )
        )

        # -------------------------------------------------
        # Filters
        # -------------------------------------------------

        filters = (
            DashboardService
            ._build_filters(
                context=context,
            )
        )

        return {
            "title": (
                f"{dataset_name} Dashboard"
            ),
            "description": (
                "Automatically generated analytical "
                "dashboard based on the most useful "
                "dataset metrics, distributions, "
                "relationships, and filters."
            ),
            "kpis": kpis,
            "charts": charts,
            "insights": insights,
            "filters": filters,
        }

    @staticmethod
    def _prepare_dashboard_charts(
        charts: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """
        Converts ChartBuilderService output into
        DashboardChart schema format.
        """

        dashboard_charts: list[
            dict[str, Any]
        ] = []

        for chart in charts:
            if not isinstance(
                chart,
                dict,
            ):
                continue

            chart_type = str(
                chart.get(
                    "type",
                    "",
                )
            )

            if chart_type not in {
                "bar",
                "pie",
                "histogram",
                "scatter",
                "line",
                "area",
                "box",
                "heatmap",
            }:
                continue

            columns: list[str] = []

            x_label = chart.get(
                "x_label"
            )

            y_label = chart.get(
                "y_label"
            )

            if x_label:
                columns.append(
                    str(x_label)
                )

            if (
                y_label
                and str(y_label).lower()
                not in {
                    "count",
                    "frequency",
                }
                and str(y_label)
                not in columns
            ):
                columns.append(
                    str(y_label)
                )

            dashboard_charts.append(
                {
                    "id": str(
                        chart.get(
                            "id",
                            (
                                "dashboard-chart-"
                                f"{len(dashboard_charts)}"
                            ),
                        )
                    ),

                    "title": str(
                        chart.get(
                            "title",
                            "Visualization",
                        )
                    ),

                    "chart_type": chart_type,

                    "columns": columns,

                    "x_label": (
                        str(x_label)
                        if x_label is not None
                        else None
                    ),

                    "y_label": (
                        str(y_label)
                        if y_label is not None
                        else None
                    ),

                    "reason": str(
                        chart.get(
                            "reason",
                            "",
                        )
                    ),

                    "data": chart.get(
                        "data",
                        {},
                    ),
                }
            )

        return dashboard_charts

    @staticmethod
    def _build_insights(
        *,
        context: dict[str, Any],
    ) -> list[dict[str, Any]]:

        insights: list[
            dict[str, Any]
        ] = []

        quality = context.get(
            "quality",
            {},
        )

        correlation = context.get(
            "correlation",
            {},
        )

        statistics = context.get(
            "statistics",
            {},
        )

        # -------------------------------------------------
        # Quality insight
        # -------------------------------------------------

        if isinstance(
            quality,
            dict,
        ):
            quality_score = quality.get(
                "quality_score"
            )

            missing_values = quality.get(
                "missing_values",
                0,
            )

            duplicate_rows = quality.get(
                "duplicate_rows",
                0,
            )

            if quality_score is not None:
                insights.append(
                    {
                        "id": "quality-summary",

                        "title": "Data Quality",

                        "description": (
                            "Overall dataset quality "
                            f"score is {quality_score}. "
                            f"Missing values: "
                            f"{missing_values}. "
                            f"Duplicate rows: "
                            f"{duplicate_rows}."
                        ),

                        "value": (
                            f"{quality_score}%"
                        ),

                        "category": "quality",
                    }
                )

        # -------------------------------------------------
        # Relationship insights
        # -------------------------------------------------

        if isinstance(
            correlation,
            dict,
        ):
            relations = correlation.get(
                "strong_correlations",
                [],
            )

            if isinstance(
                relations,
                list,
            ):
                for relation in relations:
                    if (
                        len(insights)
                        >= DashboardService.MAX_INSIGHTS
                    ):
                        break

                    if not isinstance(
                        relation,
                        dict,
                    ):
                        continue

                    feature_1 = relation.get(
                        "feature_1"
                    )

                    feature_2 = relation.get(
                        "feature_2"
                    )

                    coefficient = relation.get(
                        "correlation"
                    )

                    if coefficient is None:
                        coefficient = relation.get(
                            "value"
                        )

                    strength = relation.get(
                        "strength"
                    )

                    direction = relation.get(
                        "direction"
                    )

                    if (
                        feature_1 is None
                        or feature_2 is None
                    ):
                        continue

                    value_text = (
                        DashboardService
                        ._format_correlation(
                            coefficient
                        )
                    )

                    description_parts = []

                    if strength:
                        description_parts.append(
                            str(strength)
                        )

                    if direction:
                        description_parts.append(
                            str(direction)
                        )

                    description_parts.append(
                        "correlation detected."
                    )

                    insights.append(
                        {
                            "id": (
                                "relationship-"
                                f"{len(insights)}"
                            ),

                            "title": (
                                f"{feature_1} "
                                f"and {feature_2}"
                            ),

                            "description": (
                                " ".join(
                                    description_parts
                                )
                            ),

                            "value": value_text,

                            "category": (
                                "relationship"
                            ),
                        }
                    )

        # -------------------------------------------------
        # Statistical fallback insights
        # -------------------------------------------------

        if (
            len(insights)
            < DashboardService.MAX_INSIGHTS
            and isinstance(
                statistics,
                dict,
            )
        ):
            for column, stats in (
                statistics.items()
            ):
                if (
                    len(insights)
                    >= DashboardService.MAX_INSIGHTS
                ):
                    break

                if not isinstance(
                    stats,
                    dict,
                ):
                    continue

                mean = stats.get(
                    "mean"
                )

                if (
                    mean is None
                    or not DashboardService
                    ._is_number(
                        mean
                    )
                ):
                    continue

                # Avoid identifier statistics.
                if DashboardService._looks_like_identifier(
                    str(column)
                ):
                    continue

                insights.append(
                    {
                        "id": (
                            "statistics-"
                            f"{len(insights)}"
                        ),

                        "title": (
                            f"Average {column}"
                        ),

                        "description": (
                            f"The mean value of "
                            f"{column} is "
                            f"{DashboardService._format_number(mean)}."
                        ),

                        "value": (
                            DashboardService
                            ._format_number(
                                mean
                            )
                        ),

                        "category": (
                            "statistics"
                        ),
                    }
                )

        return insights[
            :DashboardService.MAX_INSIGHTS
        ]

    @staticmethod
    def _build_filters(
        *,
        context: dict[str, Any],
    ) -> list[dict[str, Any]]:

        datatypes = context.get(
            "datatypes",
            {},
        )

        statistics = context.get(
            "statistics",
            {},
        )

        if not isinstance(
            datatypes,
            dict,
        ):
            return []

        filters: list[
            dict[str, Any]
        ] = []

        # -------------------------------------------------
        # Reconstruct one-hot categorical groups
        # -------------------------------------------------

        one_hot_groups: dict[
            str,
            list[str],
        ] = {}

        for column, metadata in (
            datatypes.items()
        ):
            if not isinstance(
                metadata,
                dict,
            ):
                continue

            column_name = str(
                column
            )

            category = str(
                metadata.get(
                    "category",
                    "",
                )
            )

            if (
                "__" in column_name
                and category in {
                    "binary",
                    "binary_categorical",
                }
            ):
                base_name = (
                    column_name.split(
                        "__",
                        1,
                    )[0]
                )

                one_hot_groups.setdefault(
                    base_name,
                    [],
                ).append(
                    column_name
                )

        for (
            group_name,
            columns,
        ) in one_hot_groups.items():

            if (
                len(columns) < 2
                or len(filters)
                >= DashboardService.MAX_FILTERS
            ):
                continue

            options = []

            for column in columns:
                label = (
                    column.split(
                        "__",
                        1,
                    )[1]
                )

                options.append(
                    {
                        "label": label,
                        "value": label,
                    }
                )

            filters.append(
                {
                    "id": (
                        "filter-"
                        f"{DashboardService._slug(group_name)}"
                    ),

                    "column": group_name,

                    "title": group_name,

                    "filter_type": (
                        "categorical"
                    ),

                    "options": options,

                    "minimum": None,

                    "maximum": None,
                }
            )

        # -------------------------------------------------
        # Numeric range filters
        # -------------------------------------------------

        for column, metadata in (
            datatypes.items()
        ):

            if (
                len(filters)
                >= DashboardService.MAX_FILTERS
            ):
                break

            if not isinstance(
                metadata,
                dict,
            ):
                continue

            category = str(
                metadata.get(
                    "category",
                    "",
                )
            )

            if category not in {
                "continuous_numeric",
                "discrete_numeric",
            }:
                continue

            column_name = str(
                column
            )

            if (
                "__" in column_name
                or DashboardService
                ._looks_like_identifier(
                    column_name
                )
            ):
                continue

            if not isinstance(
                statistics,
                dict,
            ):
                continue

            column_stats = (
                statistics.get(
                    column_name,
                    {},
                )
            )

            if not isinstance(
                column_stats,
                dict,
            ):
                continue

            minimum = column_stats.get(
                "min"
            )

            maximum = column_stats.get(
                "max"
            )

            if (
                not DashboardService
                ._is_number(
                    minimum
                )
                or not DashboardService
                ._is_number(
                    maximum
                )
            ):
                continue

            filters.append(
                {
                    "id": (
                        "filter-"
                        f"{DashboardService._slug(column_name)}"
                    ),

                    "column": column_name,

                    "title": column_name,

                    "filter_type": (
                        "numeric_range"
                    ),

                    "options": [],

                    "minimum": float(
                        minimum
                    ),

                    "maximum": float(
                        maximum
                    ),
                }
            )

        return filters[
            :DashboardService.MAX_FILTERS
        ]

    @staticmethod
    def _format_correlation(
        value: Any,
    ) -> str | None:

        if not DashboardService._is_number(
            value
        ):
            return None

        return (
            f"{float(value):+.3f}"
        )

    @staticmethod
    def _format_number(
        value: Any,
    ) -> str:

        if not DashboardService._is_number(
            value
        ):
            return str(
                value
            )

        numeric = float(
            value
        )

        if numeric.is_integer():
            return (
                f"{int(numeric):,}"
            )

        return (
            f"{numeric:,.2f}"
        )

    @staticmethod
    def _slug(
        value: str,
    ) -> str:

        return (
            value.lower()
            .replace(
                "__",
                "-",
            )
            .replace(
                "_",
                "-",
            )
            .replace(
                " ",
                "-",
            )
        )

    @staticmethod
    def _looks_like_identifier(
        column: str,
    ) -> bool:

        normalized = (
            column.lower()
            .replace(
                "_",
                "",
            )
            .replace(
                "-",
                "",
            )
            .replace(
                " ",
                "",
            )
        )

        return (
            normalized == "id"
            or normalized.endswith(
                "id"
            )
            or normalized in {
                "index",
                "rowindex",
            }
        )

    @staticmethod
    def _is_number(
        value: Any,
    ) -> bool:

        return (
            isinstance(
                value,
                (
                    int,
                    float,
                ),
            )
            and not isinstance(
                value,
                bool,
            )
        )