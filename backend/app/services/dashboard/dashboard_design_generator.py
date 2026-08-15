from __future__ import annotations

from copy import deepcopy
from typing import Any
from uuid import uuid4

from app.services.dashboard.dashboard_template_service import (
    DashboardTemplateService,
)
from app.services.dashboard.dashboard_theme_service import (
    DashboardThemeService,
)


class DashboardDesignGenerator:
    """
    Generates a batch of six dashboard designs
    from existing dashboard analysis content.

    Each generated design uses:
    - a different layout/template
    - a theme
    - selected KPI widgets
    - selected chart widgets
    - slicers
    - an insight widget

    The generator does not recalculate analytics.
    It composes already-generated dashboard content.
    """

    DESIGNS_PER_BATCH = 6

    @classmethod
    def generate(
        cls,
        *,
        dataset_name: str,
        dashboard: dict[str, Any],
        batch_number: int = 1,
    ) -> dict[str, Any]:
        templates = (
            DashboardTemplateService
            .get_templates(
                 batch_number=batch_number
            )
        )

        if len(templates) < cls.DESIGNS_PER_BATCH:
            raise RuntimeError(
                "At least six dashboard templates are required."
            )

        designs: list[
            dict[str, Any]
        ] = []

        starting_design_number = (
            (batch_number - 1)
            * cls.DESIGNS_PER_BATCH
        )

        for index in range(
            cls.DESIGNS_PER_BATCH
        ):
            template = deepcopy(
                templates[index]
            )

            design_number = (
                starting_design_number
                + index
                + 1
            )

            design = (
                cls._build_design(
                    dataset_name=dataset_name,
                    dashboard=dashboard,
                    template=template,
                    design_number=design_number,
                    batch_number=batch_number,
                )
            )

            designs.append(
                design
            )

        return {
            "batch_number": (
                batch_number
            ),
            "designs": designs,
        }

    @classmethod
    def _build_design(
        cls,
        *,
        dataset_name: str,
        dashboard: dict[str, Any],
        template: dict[str, Any],
        design_number: int,
        batch_number: int,
    ) -> dict[str, Any]:
        theme_name = str(
            template[
                "theme"
            ]
        )

        theme = (
            DashboardThemeService
            .get_theme(
                theme_name
            )
        )

        widgets: list[
            dict[str, Any]
        ] = []

        slicers: list[
            dict[str, Any]
        ] = []

        layout = template.get(
            "layout",
            {},
        )

        # -----------------------------------------
        # KPI widgets
        # -----------------------------------------

        widgets.extend(
            cls._build_kpi_widgets(
                kpis=dashboard.get(
                    "kpis",
                    [],
                ),
                positions=layout.get(
                    "kpis",
                    [],
                ),
                design_number=design_number,
            )
        )

        # -----------------------------------------
        # Chart widgets
        # -----------------------------------------

        widgets.extend(
            cls._build_chart_widgets(
                charts=dashboard.get(
                    "charts",
                    [],
                ),
                positions=layout.get(
                    "charts",
                    [],
                ),
                design_number=design_number,
                variation_index=(
                    design_number - 1
                ),
            )
        )

        # -----------------------------------------
        # Insight widget
        # -----------------------------------------

        widgets.extend(
            cls._build_insight_widgets(
                insights=dashboard.get(
                    "insights",
                    [],
                ),
                positions=layout.get(
                    "insights",
                    [],
                ),
                design_number=design_number,
            )
        )

        # -----------------------------------------
        # Slicers
        # -----------------------------------------

        slicers.extend(
            cls._build_slicers(
                filters=dashboard.get(
                    "filters",
                    [],
                ),
                layout_type=str(
                    template.get(
                        "slicer_layout",
                        "top",
                    )
                ),
            )
        )

        return {
            "design_id": (
                f"dashboard-{uuid4().hex}"
            ),

            "design_number": (
                design_number
            ),

            "name": str(
                template.get(
                    "name",
                    f"Dashboard {design_number}",
                )
            ),

            "template": str(
                template.get(
                    "template",
                    "executive",
                )
            ),

            "theme": theme,

            "title": (
                cls._build_title(
                    dataset_name=dataset_name,
                    template_name=str(
                        template.get(
                            "name",
                            "",
                        )
                    ),
                )
            ),

            "subtitle": (
                cls._build_subtitle(
                    template_name=str(
                        template.get(
                            "name",
                            "",
                        )
                    )
                )
            ),

            "canvas_columns": 12,

            "widgets": widgets,

            "slicers": slicers,

            # Internal metadata is intentionally
            # not returned because the schema
            # should remain presentation-focused.
        }

    @staticmethod
    def _build_kpi_widgets(
        *,
        kpis: list[
            dict[str, Any]
        ],
        positions: list[
            dict[str, Any]
        ],
        design_number: int,
    ) -> list[
        dict[str, Any]
    ]:
        widgets: list[
            dict[str, Any]
        ] = []

        if (
            not isinstance(
                kpis,
                list,
            )
            or not isinstance(
                positions,
                list,
            )
        ):
            return widgets

        maximum = min(
            len(kpis),
            len(positions),
        )

        for index in range(
            maximum
        ):
            kpi = kpis[
                index
            ]

            position = positions[
                index
            ]

            if not isinstance(
                kpi,
                dict,
            ):
                continue

            widgets.append(
                {
                    "id": (
                        f"design-{design_number}"
                        f"-kpi-{index + 1}"
                    ),

                    "widget_type": "kpi",

                    "title": str(
                        kpi.get(
                            "title",
                            "Metric",
                        )
                    ),

                    "subtitle": (
                        str(
                            kpi[
                                "subtitle"
                            ]
                        )
                        if kpi.get(
                            "subtitle"
                        )
                        is not None
                        else None
                    ),

                    "position": (
                        deepcopy(
                            position
                        )
                    ),

                    "columns": (
                        [
                            str(
                                kpi[
                                    "column"
                                ]
                            )
                        ]
                        if kpi.get(
                            "column"
                        )
                        is not None
                        else []
                    ),

                    "metric": (
                        str(
                            kpi[
                                "metric"
                            ]
                        )
                        if kpi.get(
                            "metric"
                        )
                        is not None
                        else None
                    ),

                    "value": str(
                        kpi.get(
                            "value",
                            "",
                        )
                    ),

                    "x_label": None,

                    "y_label": None,

                    "reason": None,

                    "data": {},
                }
            )

        return widgets

    @classmethod
    def _build_chart_widgets(
        cls,
        *,
        charts: list[
            dict[str, Any]
        ],
        positions: list[
            dict[str, Any]
        ],
        design_number: int,
        variation_index: int,
    ) -> list[
        dict[str, Any]
    ]:
        widgets: list[
            dict[str, Any]
        ] = []

        if (
            not isinstance(
                charts,
                list,
            )
            or not isinstance(
                positions,
                list,
            )
            or not charts
        ):
            return widgets

        ordered_charts = (
            cls._rotate_charts(
                charts=charts,
                offset=variation_index,
            )
        )

        maximum = min(
            len(
                ordered_charts
            ),
            len(
                positions
            ),
        )

        for index in range(
            maximum
        ):
            chart = (
                ordered_charts[
                    index
                ]
            )

            position = (
                positions[
                    index
                ]
            )

            if not isinstance(
                chart,
                dict,
            ):
                continue

            chart_type = (
                cls._normalize_widget_type(
                    str(
                        chart.get(
                            "chart_type",
                            "",
                        )
                    )
                )
            )

            if chart_type is None:
                continue

            widgets.append(
                {
                    "id": (
                        f"design-{design_number}"
                        f"-chart-{index + 1}"
                    ),

                    "widget_type": (
                        chart_type
                    ),

                    "title": str(
                        chart.get(
                            "title",
                            "Visualization",
                        )
                    ),

                    "subtitle": None,

                    "position": (
                        deepcopy(
                            position
                        )
                    ),

                    "columns": [
                        str(
                            column
                        )
                        for column in (
                            chart.get(
                                "columns",
                                [],
                            )
                            or []
                        )
                    ],

                    "metric": None,

                    "value": None,

                    "x_label": (
                        str(
                            chart[
                                "x_label"
                            ]
                        )
                        if chart.get(
                            "x_label"
                        )
                        is not None
                        else None
                    ),

                    "y_label": (
                        str(
                            chart[
                                "y_label"
                            ]
                        )
                        if chart.get(
                            "y_label"
                        )
                        is not None
                        else None
                    ),

                    "reason": (
                        str(
                            chart[
                                "reason"
                            ]
                        )
                        if chart.get(
                            "reason"
                        )
                        is not None
                        else None
                    ),

                    "data": deepcopy(
                        chart.get(
                            "data",
                            {},
                        )
                    ),
                }
            )

        return widgets

    @staticmethod
    def _build_insight_widgets(
        *,
        insights: list[
            dict[str, Any]
        ],
        positions: list[
            dict[str, Any]
        ],
        design_number: int,
    ) -> list[
        dict[str, Any]
    ]:
        if (
            not insights
            or not positions
        ):
            return []

        useful_insights = [
            insight
            for insight in insights
            if isinstance(
                insight,
                dict,
            )
            and not (
                "__" in str(
                    insight.get(
                        "title",
                        "",
                    )
                )
            )
        ]

        if not useful_insights:
            return []

        position = deepcopy(
            positions[0]
        )

        insight_items = []

        for insight in (
            useful_insights[:4]
        ):
            insight_items.append(
                {
                    "title": str(
                        insight.get(
                            "title",
                            "",
                        )
                    ),

                    "value": (
                        str(
                            insight[
                                "value"
                            ]
                        )
                        if insight.get(
                            "value"
                        )
                        is not None
                        else None
                    ),

                    "description": str(
                        insight.get(
                            "description",
                            "",
                        )
                    ),

                    "category": str(
                        insight.get(
                            "category",
                            "general",
                        )
                    ),
                }
            )

        return [
            {
                "id": (
                    f"design-{design_number}"
                    "-insights"
                ),

                "widget_type": (
                    "insight"
                ),

                "title": (
                    "AI Insights"
                ),

                "subtitle": (
                    "Important findings from the dataset"
                ),

                "position": position,

                "columns": [],

                "metric": None,

                "value": None,

                "x_label": None,

                "y_label": None,

                "reason": None,

                "data": {
                    "items": (
                        insight_items
                    )
                },
            }
        ]

    @staticmethod
    def _build_slicers(
        *,
        filters: list[
            dict[str, Any]
        ],
        layout_type: str,
    ) -> list[
        dict[str, Any]
    ]:
        if not isinstance(
            filters,
            list,
        ):
            return []

        selected_filters = [
            filter_item
            for filter_item
            in filters[:4]
            if isinstance(
                filter_item,
                dict,
            )
        ]

        slicers: list[
            dict[str, Any]
        ] = []

        if (
            layout_type
            == "left"
        ):
            positions = [
                {
                    "x": 0,
                    "y": 0,
                    "w": 2,
                    "h": 2,
                },
                {
                    "x": 0,
                    "y": 2,
                    "w": 2,
                    "h": 2,
                },
                {
                    "x": 0,
                    "y": 4,
                    "w": 2,
                    "h": 2,
                },
                {
                    "x": 0,
                    "y": 6,
                    "w": 2,
                    "h": 2,
                },
            ]
        else:
            positions = [
                {
                    "x": 0,
                    "y": 0,
                    "w": 3,
                    "h": 1,
                },
                {
                    "x": 3,
                    "y": 0,
                    "w": 3,
                    "h": 1,
                },
                {
                    "x": 6,
                    "y": 0,
                    "w": 3,
                    "h": 1,
                },
                {
                    "x": 9,
                    "y": 0,
                    "w": 3,
                    "h": 1,
                },
            ]

        for index, filter_item in enumerate(
            selected_filters
        ):
            slicers.append(
                {
                    "id": (
                        "slicer-"
                        f"{index + 1}-"
                        f"{filter_item.get('id', index)}"
                    ),

                    "column": str(
                        filter_item.get(
                            "column",
                            "",
                        )
                    ),

                    "title": str(
                        filter_item.get(
                            "title",
                            "Filter",
                        )
                    ),

                    "filter_type": str(
                        filter_item.get(
                            "filter_type",
                            "categorical",
                        )
                    ),

                    "position": (
                        positions[
                            index
                        ]
                    ),

                    "options": deepcopy(
                        filter_item.get(
                            "options",
                            [],
                        )
                    ),

                    "minimum": (
                        float(
                            filter_item[
                                "minimum"
                            ]
                        )
                        if filter_item.get(
                            "minimum"
                        )
                        is not None
                        else None
                    ),

                    "maximum": (
                        float(
                            filter_item[
                                "maximum"
                            ]
                        )
                        if filter_item.get(
                            "maximum"
                        )
                        is not None
                        else None
                    ),
                }
            )

        return slicers

    @staticmethod
    def _rotate_charts(
        *,
        charts: list[
            dict[str, Any]
        ],
        offset: int,
    ) -> list[
        dict[str, Any]
    ]:
        if not charts:
            return []

        normalized_offset = (
            offset
            % len(charts)
        )

        return (
            charts[
                normalized_offset:
            ]
            +
            charts[
                :normalized_offset
            ]
        )

    @staticmethod
    def _normalize_widget_type(
        chart_type: str,
    ) -> str | None:
        mapping = {
            "bar": "bar",
            "pie": "donut",
            "histogram": (
                "histogram"
            ),
            "scatter": (
                "scatter"
            ),
            "line": "line",
            "area": "area",
            "box": "box",
        }

        return mapping.get(
            chart_type.lower()
        )

    @staticmethod
    def _build_title(
        *,
        dataset_name: str,
        template_name: str,
    ) -> str:
        clean_dataset_name = (
            dataset_name
            .replace(
                "_",
                " ",
            )
            .replace(
                "-",
                " ",
            )
            .strip()
            .title()
        )

        return (
            f"{clean_dataset_name} "
            f"{template_name}"
        )

    @staticmethod
    def _build_subtitle(
        *,
        template_name: str,
    ) -> str:
        subtitles = {
            "Executive Overview": (
                "Executive summary of the most important "
                "metrics and business patterns."
            ),

            "Classic BI": (
                "Traditional BI report with dedicated "
                "slicers and analytical visualizations."
            ),

            "Balanced Analytics": (
                "Balanced analytical view of distributions, "
                "relationships and headline metrics."
            ),

            "Business Story": (
                "Story-focused report designed to surface "
                "important patterns clearly."
            ),

            "KPI Performance": (
                "Performance-focused dashboard with strong "
                "emphasis on headline metrics."
            ),

            "Deep Dive": (
                "Detailed analytical report for deeper "
                "exploration of the dataset."
            ),
        }

        return subtitles.get(
            template_name,
            (
                "Automatically generated "
                "analytics dashboard."
            ),
        )