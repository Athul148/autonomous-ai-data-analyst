from copy import deepcopy
from typing import Any


class DashboardTemplateService:
    """
    Provides completely different dashboard
    design families for successive batches.

    Each batch contains 6 dashboard designs.

    All layouts use a 12-column grid.
    """

    TEMPLATE_BATCHES: dict[
        int,
        list[dict[str, Any]],
    ] = {
        # =========================================================
        # BATCH 1
        # =========================================================
        1: [
            {
                "name": "Executive Overview",
                "template": "executive",
                "theme": "executive_dark",
                "slicer_layout": "top",
                "layout": {
                    "kpis": [
                        {"x": 0, "y": 0, "w": 3, "h": 2},
                        {"x": 3, "y": 0, "w": 3, "h": 2},
                        {"x": 6, "y": 0, "w": 3, "h": 2},
                        {"x": 9, "y": 0, "w": 3, "h": 2},
                    ],
                    "charts": [
                        {"x": 0, "y": 2, "w": 8, "h": 5},
                        {"x": 8, "y": 2, "w": 4, "h": 5},
                        {"x": 0, "y": 7, "w": 6, "h": 4},
                        {"x": 6, "y": 7, "w": 6, "h": 4},
                    ],
                    "insights": [
                        {"x": 0, "y": 11, "w": 12, "h": 2},
                    ],
                },
            },

            {
                "name": "Classic BI",
                "template": "sidebar_slicers",
                "theme": "powerbi_classic",
                "slicer_layout": "left",
                "layout": {
                    "kpis": [
                        {"x": 2, "y": 0, "w": 2, "h": 2},
                        {"x": 4, "y": 0, "w": 2, "h": 2},
                        {"x": 6, "y": 0, "w": 2, "h": 2},
                        {"x": 8, "y": 0, "w": 2, "h": 2},
                        {"x": 10, "y": 0, "w": 2, "h": 2},
                    ],
                    "charts": [
                        {"x": 2, "y": 2, "w": 6, "h": 5},
                        {"x": 8, "y": 2, "w": 4, "h": 5},
                        {"x": 2, "y": 7, "w": 5, "h": 4},
                        {"x": 7, "y": 7, "w": 5, "h": 4},
                    ],
                    "insights": [
                        {"x": 2, "y": 11, "w": 10, "h": 2},
                    ],
                },
            },

            {
                "name": "Balanced Analytics",
                "template": "balanced_grid",
                "theme": "analytics_blue",
                "slicer_layout": "top",
                "layout": {
                    "kpis": [
                        {"x": 0, "y": 0, "w": 4, "h": 2},
                        {"x": 4, "y": 0, "w": 4, "h": 2},
                        {"x": 8, "y": 0, "w": 4, "h": 2},
                    ],
                    "charts": [
                        {"x": 0, "y": 2, "w": 6, "h": 4},
                        {"x": 6, "y": 2, "w": 6, "h": 4},
                        {"x": 0, "y": 6, "w": 6, "h": 4},
                        {"x": 6, "y": 6, "w": 6, "h": 4},
                    ],
                    "insights": [
                        {"x": 0, "y": 10, "w": 12, "h": 2},
                    ],
                },
            },

            {
                "name": "Business Story",
                "template": "story",
                "theme": "modern_light",
                "slicer_layout": "left",
                "layout": {
                    "kpis": [
                        {"x": 2, "y": 0, "w": 3, "h": 2},
                        {"x": 5, "y": 0, "w": 3, "h": 2},
                        {"x": 8, "y": 0, "w": 4, "h": 2},
                    ],
                    "charts": [
                        {"x": 2, "y": 2, "w": 7, "h": 5},
                        {"x": 9, "y": 2, "w": 3, "h": 5},
                        {"x": 2, "y": 7, "w": 4, "h": 4},
                        {"x": 6, "y": 7, "w": 6, "h": 4},
                    ],
                    "insights": [
                        {"x": 2, "y": 11, "w": 10, "h": 2},
                    ],
                },
            },

            {
                "name": "KPI Performance",
                "template": "executive",
                "theme": "minimal_pro",
                "slicer_layout": "top",
                "layout": {
                    "kpis": [
                        {"x": 0, "y": 0, "w": 2, "h": 2},
                        {"x": 2, "y": 0, "w": 2, "h": 2},
                        {"x": 4, "y": 0, "w": 2, "h": 2},
                        {"x": 6, "y": 0, "w": 2, "h": 2},
                        {"x": 8, "y": 0, "w": 2, "h": 2},
                        {"x": 10, "y": 0, "w": 2, "h": 2},
                    ],
                    "charts": [
                        {"x": 0, "y": 2, "w": 5, "h": 4},
                        {"x": 5, "y": 2, "w": 7, "h": 4},
                        {"x": 0, "y": 6, "w": 7, "h": 5},
                        {"x": 7, "y": 6, "w": 5, "h": 5},
                    ],
                    "insights": [
                        {"x": 0, "y": 11, "w": 12, "h": 2},
                    ],
                },
            },

            {
                "name": "Deep Dive",
                "template": "analytical",
                "theme": "executive_dark",
                "slicer_layout": "top",
                "layout": {
                    "kpis": [
                        {"x": 0, "y": 0, "w": 3, "h": 2},
                        {"x": 3, "y": 0, "w": 3, "h": 2},
                        {"x": 6, "y": 0, "w": 3, "h": 2},
                        {"x": 9, "y": 0, "w": 3, "h": 2},
                    ],
                    "charts": [
                        {"x": 0, "y": 2, "w": 4, "h": 4},
                        {"x": 4, "y": 2, "w": 4, "h": 4},
                        {"x": 8, "y": 2, "w": 4, "h": 4},
                        {"x": 0, "y": 6, "w": 8, "h": 5},
                        {"x": 8, "y": 6, "w": 4, "h": 5},
                    ],
                    "insights": [
                        {"x": 0, "y": 11, "w": 12, "h": 2},
                    ],
                },
            },
        ],

        # =========================================================
        # BATCH 2
        # =========================================================
        2: [
            {
                "name": "Command Center",
                "template": "command_center",
                "theme": "analytics_blue",
                "slicer_layout": "left",
                "layout": {
                    "kpis": [
                        {"x": 2, "y": 0, "w": 2, "h": 2},
                        {"x": 4, "y": 0, "w": 2, "h": 2},
                        {"x": 6, "y": 0, "w": 2, "h": 2},
                        {"x": 8, "y": 0, "w": 2, "h": 2},
                        {"x": 10, "y": 0, "w": 2, "h": 2},
                    ],
                    "charts": [
                        {"x": 2, "y": 2, "w": 10, "h": 4},
                        {"x": 2, "y": 6, "w": 4, "h": 4},
                        {"x": 6, "y": 6, "w": 3, "h": 4},
                        {"x": 9, "y": 6, "w": 3, "h": 4},
                    ],
                    "insights": [
                        {"x": 2, "y": 10, "w": 10, "h": 2},
                    ],
                },
            },

            {
                "name": "Hero Analytics",
                "template": "hero_analytics",
                "theme": "modern_light",
                "slicer_layout": "top",
                "layout": {
                    "kpis": [
                        {"x": 0, "y": 0, "w": 4, "h": 2},
                        {"x": 4, "y": 0, "w": 4, "h": 2},
                        {"x": 8, "y": 0, "w": 4, "h": 2},
                    ],
                    "charts": [
                        {"x": 0, "y": 2, "w": 12, "h": 5},
                        {"x": 0, "y": 7, "w": 4, "h": 4},
                        {"x": 4, "y": 7, "w": 4, "h": 4},
                        {"x": 8, "y": 7, "w": 4, "h": 4},
                    ],
                    "insights": [
                        {"x": 0, "y": 11, "w": 12, "h": 2},
                    ],
                },
            },

            {
                "name": "Data Explorer",
                "template": "explorer",
                "theme": "powerbi_classic",
                "slicer_layout": "left",
                "layout": {
                    "kpis": [
                        {"x": 3, "y": 0, "w": 3, "h": 2},
                        {"x": 6, "y": 0, "w": 3, "h": 2},
                        {"x": 9, "y": 0, "w": 3, "h": 2},
                    ],
                    "charts": [
                        {"x": 3, "y": 2, "w": 5, "h": 4},
                        {"x": 8, "y": 2, "w": 4, "h": 4},
                        {"x": 3, "y": 6, "w": 4, "h": 5},
                        {"x": 7, "y": 6, "w": 5, "h": 5},
                    ],
                    "insights": [
                        {"x": 3, "y": 11, "w": 9, "h": 2},
                    ],
                },
            },

            {
                "name": "Performance Cockpit",
                "template": "performance_cockpit",
                "theme": "executive_dark",
                "slicer_layout": "top",
                "layout": {
                    "kpis": [
                        {"x": 0, "y": 0, "w": 2, "h": 2},
                        {"x": 2, "y": 0, "w": 2, "h": 2},
                        {"x": 4, "y": 0, "w": 2, "h": 2},
                        {"x": 6, "y": 0, "w": 2, "h": 2},
                        {"x": 8, "y": 0, "w": 2, "h": 2},
                        {"x": 10, "y": 0, "w": 2, "h": 2},
                    ],
                    "charts": [
                        {"x": 0, "y": 2, "w": 4, "h": 4},
                        {"x": 4, "y": 2, "w": 8, "h": 4},
                        {"x": 0, "y": 6, "w": 8, "h": 5},
                        {"x": 8, "y": 6, "w": 4, "h": 5},
                    ],
                    "insights": [
                        {"x": 0, "y": 11, "w": 12, "h": 2},
                    ],
                },
            },

            {
                "name": "Insight Board",
                "template": "insight_board",
                "theme": "minimal_pro",
                "slicer_layout": "top",
                "layout": {
                    "kpis": [
                        {"x": 0, "y": 0, "w": 3, "h": 2},
                        {"x": 3, "y": 0, "w": 3, "h": 2},
                        {"x": 6, "y": 0, "w": 3, "h": 2},
                        {"x": 9, "y": 0, "w": 3, "h": 2},
                    ],
                    "insights": [
                        {"x": 0, "y": 2, "w": 12, "h": 3},
                    ],
                    "charts": [
                        {"x": 0, "y": 5, "w": 5, "h": 4},
                        {"x": 5, "y": 5, "w": 7, "h": 4},
                        {"x": 0, "y": 9, "w": 6, "h": 4},
                        {"x": 6, "y": 9, "w": 6, "h": 4},
                    ],
                },
            },

            {
                "name": "Compact Intelligence",
                "template": "compact_intelligence",
                "theme": "analytics_blue",
                "slicer_layout": "top",
                "layout": {
                    "kpis": [
                        {"x": 0, "y": 0, "w": 3, "h": 2},
                        {"x": 3, "y": 0, "w": 3, "h": 2},
                        {"x": 6, "y": 0, "w": 3, "h": 2},
                        {"x": 9, "y": 0, "w": 3, "h": 2},
                    ],
                    "charts": [
                        {"x": 0, "y": 2, "w": 4, "h": 3},
                        {"x": 4, "y": 2, "w": 4, "h": 3},
                        {"x": 8, "y": 2, "w": 4, "h": 3},
                        {"x": 0, "y": 5, "w": 6, "h": 4},
                        {"x": 6, "y": 5, "w": 6, "h": 4},
                    ],
                    "insights": [
                        {"x": 0, "y": 9, "w": 12, "h": 2},
                    ],
                },
            },
        ],

        # =========================================================
        # BATCH 3
        # =========================================================
        3: [
            {
                "name": "Segmentation Studio",
                "template": "segmentation",
                "theme": "modern_light",
                "slicer_layout": "left",
                "layout": {
                    "kpis": [
                        {"x": 2, "y": 0, "w": 5, "h": 2},
                        {"x": 7, "y": 0, "w": 5, "h": 2},
                    ],
                    "charts": [
                        {"x": 2, "y": 2, "w": 5, "h": 4},
                        {"x": 7, "y": 2, "w": 5, "h": 4},
                        {"x": 2, "y": 6, "w": 3, "h": 5},
                        {"x": 5, "y": 6, "w": 7, "h": 5},
                    ],
                    "insights": [
                        {"x": 2, "y": 11, "w": 10, "h": 2},
                    ],
                },
            },

            {
                "name": "Comparison Dashboard",
                "template": "comparison",
                "theme": "powerbi_classic",
                "slicer_layout": "top",
                "layout": {
                    "kpis": [
                        {"x": 0, "y": 0, "w": 6, "h": 2},
                        {"x": 6, "y": 0, "w": 6, "h": 2},
                    ],
                    "charts": [
                        {"x": 0, "y": 2, "w": 6, "h": 5},
                        {"x": 6, "y": 2, "w": 6, "h": 5},
                        {"x": 0, "y": 7, "w": 6, "h": 4},
                        {"x": 6, "y": 7, "w": 6, "h": 4},
                    ],
                    "insights": [
                        {"x": 0, "y": 11, "w": 12, "h": 2},
                    ],
                },
            },

            {
                "name": "Metric Wall",
                "template": "metric_wall",
                "theme": "executive_dark",
                "slicer_layout": "top",
                "layout": {
                    "kpis": [
                        {"x": 0, "y": 0, "w": 2, "h": 2},
                        {"x": 2, "y": 0, "w": 2, "h": 2},
                        {"x": 4, "y": 0, "w": 2, "h": 2},
                        {"x": 6, "y": 0, "w": 2, "h": 2},
                        {"x": 8, "y": 0, "w": 2, "h": 2},
                        {"x": 10, "y": 0, "w": 2, "h": 2},
                    ],
                    "charts": [
                        {"x": 0, "y": 2, "w": 3, "h": 4},
                        {"x": 3, "y": 2, "w": 3, "h": 4},
                        {"x": 6, "y": 2, "w": 3, "h": 4},
                        {"x": 9, "y": 2, "w": 3, "h": 4},
                        {"x": 0, "y": 6, "w": 12, "h": 5},
                    ],
                    "insights": [
                        {"x": 0, "y": 11, "w": 12, "h": 2},
                    ],
                },
            },

            {
                "name": "Analytical Canvas",
                "template": "analytical_canvas",
                "theme": "analytics_blue",
                "slicer_layout": "left",
                "layout": {
                    "kpis": [
                        {"x": 2, "y": 0, "w": 3, "h": 2},
                        {"x": 5, "y": 0, "w": 3, "h": 2},
                        {"x": 8, "y": 0, "w": 4, "h": 2},
                    ],
                    "charts": [
                        {"x": 2, "y": 2, "w": 4, "h": 4},
                        {"x": 6, "y": 2, "w": 6, "h": 4},
                        {"x": 2, "y": 6, "w": 7, "h": 5},
                        {"x": 9, "y": 6, "w": 3, "h": 5},
                    ],
                    "insights": [
                        {"x": 2, "y": 11, "w": 10, "h": 2},
                    ],
                },
            },

            {
                "name": "Storyboard Report",
                "template": "storyboard",
                "theme": "modern_light",
                "slicer_layout": "top",
                "layout": {
                    "kpis": [
                        {"x": 0, "y": 0, "w": 4, "h": 2},
                        {"x": 4, "y": 0, "w": 4, "h": 2},
                        {"x": 8, "y": 0, "w": 4, "h": 2},
                    ],
                    "charts": [
                        {"x": 0, "y": 2, "w": 12, "h": 4},
                        {"x": 0, "y": 6, "w": 5, "h": 4},
                        {"x": 5, "y": 6, "w": 7, "h": 4},
                    ],
                    "insights": [
                        {"x": 0, "y": 10, "w": 12, "h": 3},
                    ],
                },
            },

            {
                "name": "Minimal Executive",
                "template": "minimal_executive",
                "theme": "minimal_pro",
                "slicer_layout": "top",
                "layout": {
                    "kpis": [
                        {"x": 0, "y": 0, "w": 4, "h": 2},
                        {"x": 4, "y": 0, "w": 4, "h": 2},
                        {"x": 8, "y": 0, "w": 4, "h": 2},
                    ],
                    "charts": [
                        {"x": 0, "y": 2, "w": 8, "h": 6},
                        {"x": 8, "y": 2, "w": 4, "h": 6},
                        {"x": 0, "y": 8, "w": 12, "h": 4},
                    ],
                    "insights": [
                        {"x": 0, "y": 12, "w": 12, "h": 2},
                    ],
                },
            },
        ],
    }

    @classmethod
    def get_templates(
        cls,
        batch_number: int = 1,
    ) -> list[dict[str, Any]]:
        """
        Return the six designs for a batch.

        Batches 1-3 are intentionally completely
        different dashboard families.
        """

        if batch_number < 1:
            raise ValueError(
                "Batch number must be at least 1."
            )

        if batch_number in cls.TEMPLATE_BATCHES:
            return deepcopy(
                cls.TEMPLATE_BATCHES[
                    batch_number
                ]
            )

        # For now, batches after 3 cycle through the
        # three family sets while design/chart ordering
        # can still change in the generator.
        cycle_batch = (
            ((batch_number - 1) % 3)
            + 1
        )

        return deepcopy(
            cls.TEMPLATE_BATCHES[
                cycle_batch
            ]
        )

    @classmethod
    def get_template(
        cls,
        index: int,
        batch_number: int = 1,
    ) -> dict[str, Any]:
        templates = cls.get_templates(
            batch_number=batch_number
        )

        if (
            index < 0
            or index >= len(templates)
        ):
            raise ValueError(
                "Invalid dashboard template index."
            )

        return deepcopy(
            templates[index]
        )

    @classmethod
    def total_templates(
        cls,
        batch_number: int = 1,
    ) -> int:
        return len(
            cls.get_templates(
                batch_number=batch_number
            )
        )