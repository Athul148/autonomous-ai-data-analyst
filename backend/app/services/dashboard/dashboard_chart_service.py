from __future__ import annotations

from typing import Any

import pandas as pd

from app.services.visualization.chart_builder_service import (
    ChartBuilderService,
)


class DashboardChartService:
    """
    Selects useful chart recommendations for
    the dashboard and builds frontend-ready
    chart data using ChartBuilderService.
    """

    MAX_CHARTS = 6

    @staticmethod
    def build(
        *,
        dataframe: pd.DataFrame,
        context: dict[str, Any],
    ) -> list[dict[str, Any]]:
        recommendations = context.get(
            "charts",
            [],
        )

        if not isinstance(
            recommendations,
            list,
        ):
            return []

        selected = (
            DashboardChartService
            ._select_recommendations(
                recommendations
            )
        )

        charts = ChartBuilderService.build(
            dataframe=dataframe,
            chart_recommendations=selected,
        )

        return charts[
            :DashboardChartService.MAX_CHARTS
        ]

    @staticmethod
    def _select_recommendations(
        recommendations: list[
            dict[str, Any]
        ],
    ) -> list[dict[str, Any]]:
        """
        Prioritizes useful dashboard charts while
        avoiding excessive or repetitive visuals.
        """

        relationship_charts = []
        grouped_charts = []
        categorical_charts = []
        distribution_charts = []
        other_charts = []

        seen_columns: set[str] = set()

        for recommendation in recommendations:
            if not isinstance(
                recommendation,
                dict,
            ):
                continue

            recommendation_type = str(
                recommendation.get(
                    "type",
                    "",
                )
            ).lower()

            chart_type = str(
                recommendation.get(
                    "chart",
                    "",
                )
            ).lower()

            column = recommendation.get(
                "column"
            )

            columns = recommendation.get(
                "columns",
                [],
            )

            # -----------------------------------------
            # Relationship charts
            # -----------------------------------------

            if recommendation_type == "relationship":
                if (
                    not isinstance(
                        columns,
                        list,
                    )
                    or len(columns) < 2
                ):
                    continue

                key = (
                    f"{columns[0]}::"
                    f"{columns[1]}"
                )

                if key in seen_columns:
                    continue

                seen_columns.add(key)

                relationship_charts.append(
                    recommendation
                )

                continue

            # -----------------------------------------
            # Grouped one-hot categorical charts
            # -----------------------------------------

            if (
                recommendation_type
                == "one_hot_group"
                or chart_type
                == "grouped_one_hot_bar"
            ):
                group_name = str(
                    recommendation.get(
                        "group_name",
                        "",
                    )
                )

                key = (
                    f"group::{group_name}"
                )

                if key in seen_columns:
                    continue

                seen_columns.add(key)

                grouped_charts.append(
                    recommendation
                )

                continue

            # -----------------------------------------
            # Single-column charts
            # -----------------------------------------

            if column is not None:
                column_name = str(
                    column
                )

                if column_name in seen_columns:
                    continue

                seen_columns.add(
                    column_name
                )

                if chart_type in {
                    "pie",
                    "pie_chart",
                    "bar",
                    "bar_chart",
                    "count",
                    "count_plot",
                }:
                    categorical_charts.append(
                        recommendation
                    )

                    continue

                if chart_type in {
                    "histogram",
                    "box",
                    "box_plot",
                }:
                    distribution_charts.append(
                        recommendation
                    )

                    continue

            other_charts.append(
                recommendation
            )

        selected: list[
            dict[str, Any]
        ] = []

        # Prefer a balanced dashboard instead of
        # simply taking the first six recommendations.

        DashboardChartService._extend(
            target=selected,
            source=relationship_charts,
            limit=2,
        )

        DashboardChartService._extend(
            target=selected,
            source=grouped_charts,
            limit=2,
        )

        DashboardChartService._extend(
            target=selected,
            source=categorical_charts,
            limit=2,
        )

        DashboardChartService._extend(
            target=selected,
            source=distribution_charts,
            limit=2,
        )

        DashboardChartService._extend(
            target=selected,
            source=other_charts,
            limit=2,
        )

        return selected[
            :DashboardChartService.MAX_CHARTS
        ]

    @staticmethod
    def _extend(
        *,
        target: list[dict[str, Any]],
        source: list[dict[str, Any]],
        limit: int,
    ) -> None:
        remaining = (
            DashboardChartService.MAX_CHARTS
            - len(target)
        )

        if remaining <= 0:
            return

        target.extend(
            source[
                :min(
                    limit,
                    remaining,
                )
            ]
        )