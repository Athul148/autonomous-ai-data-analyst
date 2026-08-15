from typing import Any


class ReportContextService:
    """
    Prepares structured dataset analysis results
    for AI report generation.
    """

    @staticmethod
    def build(
        dataset_name: str,
        analysis: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "dataset": {
                "name": dataset_name,
            },
            "overview": analysis.get(
                "overview",
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