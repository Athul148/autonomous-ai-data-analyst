from typing import Any


class DashboardContextService:
    """
    Prepares structured analysis data for
    automatic dashboard generation.

    This service does not recalculate analytics.
    It only organizes existing analysis outputs.
    """

    @staticmethod
    def build(
        *,
        dataset_name: str,
        analysis: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "dataset": {
                "name": dataset_name,
                **analysis.get(
                    "dataset",
                    {},
                ),
            },

            # Keep overview as an alias so dashboard
            # services can read general dataset metrics
            # such as rows and columns consistently.
            "overview": analysis.get(
                "dataset",
                {},
            ),

            "datatypes": analysis.get(
                "datatypes",
                {},
            ),

            "statistics": analysis.get(
                "statistics",
                {},
            ),

            "quality": analysis.get(
                "quality",
                {},
            ),

            "validation": analysis.get(
                "validation",
                {},
            ),

            "correlation": analysis.get(
                "correlation",
                {},
            ),

            "charts": analysis.get(
                "charts",
                [],
            ),
        }