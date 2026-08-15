from __future__ import annotations

from typing import Any


class KPIService:
    """
    Selects useful dashboard KPI cards
    from existing dataset analysis.

    The service is intentionally conservative:
    it only returns metrics that can be derived
    reliably from the supplied analysis.
    """

    MAX_KPIS = 4

    @staticmethod
    def build(
        *,
        context: dict[str, Any],
    ) -> list[dict[str, Any]]:
        kpis: list[dict[str, Any]] = []

        overview = context.get(
            "overview",
            {},
        )

        statistics = context.get(
            "statistics",
            {},
        )

        datatypes = context.get(
            "datatypes",
            {},
        )

        # -------------------------------------------------
        # Always include row count when available
        # -------------------------------------------------

        rows = KPIService._get_overview_value(
            overview,
            [
                "rows",
                "row_count",
                "total_rows",
            ],
        )

        if rows is not None:
            kpis.append(
                {
                    "id": "records",
                    "title": "Total Records",
                    "value": KPIService._format_number(
                        rows
                    ),
                    "subtitle": "Rows in dataset",
                    "column": None,
                    "metric": "rows",
                }
            )

        # -------------------------------------------------
        # Dataset column count
        # -------------------------------------------------

        columns = KPIService._get_overview_value(
            overview,
            [
                "columns",
                "column_count",
                "total_columns",
            ],
        )

        if (
            columns is not None
            and len(kpis) < KPIService.MAX_KPIS
        ):
            kpis.append(
                {
                    "id": "columns",
                    "title": "Total Columns",
                    "value": KPIService._format_number(
                        columns
                    ),
                    "subtitle": "Features available",
                    "column": None,
                    "metric": "columns",
                }
            )

        # -------------------------------------------------
        # Prefer meaningful binary outcome percentages
        # -------------------------------------------------

        binary_kpi = KPIService._find_binary_kpi(
            statistics=statistics,
            datatypes=datatypes,
        )

        if (
            binary_kpi is not None
            and len(kpis) < KPIService.MAX_KPIS
        ):
            kpis.append(
                binary_kpi
            )

        # -------------------------------------------------
        # Add useful continuous numeric averages
        # -------------------------------------------------

        numeric_kpis = (
            KPIService
            ._find_numeric_kpis(
                statistics=statistics,
                datatypes=datatypes,
            )
        )

        for numeric_kpi in numeric_kpis:
            if (
                len(kpis)
                >= KPIService.MAX_KPIS
            ):
                break

            kpis.append(
                numeric_kpi
            )

        return kpis[:KPIService.MAX_KPIS]

    @staticmethod
    def _find_binary_kpi(
        *,
        statistics: dict[str, Any],
        datatypes: dict[str, Any],
    ) -> dict[str, Any] | None:
        preferred_names = {
            "churn",
            "target",
            "outcome",
            "label",
            "converted",
            "conversion",
            "fraud",
            "default",
            "clicked",
            "purchased",
            "approved",
        }

        candidates: list[
            tuple[int, str, dict[str, Any]]
        ] = []

        for column, metadata in (
            datatypes.items()
        ):
            category = str(
                metadata.get(
                    "category",
                    "",
                )
            )

            if category not in {
                "binary",
                "binary_categorical",
            }:
                continue

            column_name = str(column)

            # Ignore one-hot encoded features.
            if "__" in column_name:
                continue

            stats = statistics.get(
                column_name,
                {},
            )

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
                or not KPIService
                ._is_number(mean)
            ):
                continue

            numeric_mean = float(
                mean
            )

            if not (
                0
                <= numeric_mean
                <= 1
            ):
                continue

            normalized_name = (
                column_name
                .strip()
                .lower()
                .replace(" ", "_")
            )

            score = (
                0
                if normalized_name
                in preferred_names
                else 1
            )

            candidates.append(
                (
                    score,
                    column_name,
                    stats,
                )
            )

        if not candidates:
            return None

        candidates.sort(
            key=lambda item: (
                item[0],
                item[1],
            )
        )

        _, column, stats = candidates[
            0
        ]

        percentage = (
            float(
                stats["mean"]
            )
            * 100
        )

        title = (
            f"{KPIService._humanize(column)} Rate"
        )

        return {
            "id": (
                "binary-rate-"
                f"{KPIService._slug(column)}"
            ),
            "title": title,
            "value": (
                f"{percentage:.1f}%"
            ),
            "subtitle": (
                f"Share where {column} = 1"
            ),
            "column": column,
            "metric": "mean",
        }

    @staticmethod
    def _find_numeric_kpis(
        *,
        statistics: dict[str, Any],
        datatypes: dict[str, Any],
    ) -> list[dict[str, Any]]:
        candidates: list[
            tuple[int, str, dict[str, Any]]
        ] = []

        preferred_keywords = [
            "revenue",
            "sales",
            "spend",
            "amount",
            "price",
            "cost",
            "income",
            "profit",
            "score",
            "calls",
            "orders",
            "usage",
            "frequency",
            "tenure",
            "delay",
        ]

        for column, metadata in (
            datatypes.items()
        ):
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

            # Don't show identifier-like fields.
            if KPIService._looks_like_identifier(
                column_name
            ):
                continue

            stats = statistics.get(
                column_name,
                {},
            )

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
                or not KPIService
                ._is_number(mean)
            ):
                continue

            normalized = (
                column_name.lower()
            )

            score = len(
                preferred_keywords
            )

            for index, keyword in enumerate(
                preferred_keywords
            ):
                if keyword in normalized:
                    score = index
                    break

            candidates.append(
                (
                    score,
                    column_name,
                    stats,
                )
            )

        candidates.sort(
            key=lambda item: (
                item[0],
                item[1],
            )
        )

        results: list[
            dict[str, Any]
        ] = []

        for _, column, stats in candidates:
            mean = float(
                stats["mean"]
            )

            results.append(
                {
                    "id": (
                        "average-"
                        f"{KPIService._slug(column)}"
                    ),
                    "title": (
                        f"Average "
                        f"{KPIService._humanize(column)}"
                    ),
                    "value": (
                        KPIService
                        ._format_metric_value(
                            mean
                        )
                    ),
                    "subtitle": (
                        f"Mean {column}"
                    ),
                    "column": column,
                    "metric": "mean",
                }
            )

        return results

    @staticmethod
    def _get_overview_value(
        overview: dict[str, Any],
        keys: list[str],
    ) -> Any:
        for key in keys:
            if key in overview:
                return overview[
                    key
                ]

        return None

    @staticmethod
    def _looks_like_identifier(
        column: str,
    ) -> bool:
        normalized = (
            column.lower()
            .replace(" ", "")
            .replace("_", "")
            .replace("-", "")
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
    def _humanize(
        value: str,
    ) -> str:
        return (
            value
            .replace("__", " ")
            .replace("_", " ")
            .strip()
        )

    @staticmethod
    def _slug(
        value: str,
    ) -> str:
        return (
            value.lower()
            .replace(" ", "-")
            .replace("_", "-")
            .replace("__", "-")
        )

    @staticmethod
    def _format_number(
        value: Any,
    ) -> str:
        if KPIService._is_number(
            value
        ):
            numeric_value = float(
                value
            )

            if numeric_value.is_integer():
                return (
                    f"{int(numeric_value):,}"
                )

            return (
                f"{numeric_value:,.2f}"
            )

        return str(
            value
        )

    @staticmethod
    def _format_metric_value(
        value: float,
    ) -> str:
        absolute = abs(
            value
        )

        if absolute >= 1000:
            return (
                f"{value:,.0f}"
            )

        if absolute >= 100:
            return (
                f"{value:,.2f}"
            )

        if absolute >= 10:
            return (
                f"{value:.2f}"
            )

        return (
            f"{value:.2f}"
        )

    @staticmethod
    def _is_number(
        value: Any,
    ) -> bool:
        return (
            isinstance(
                value,
                (int, float),
            )
            and not isinstance(
                value,
                bool,
            )
        )