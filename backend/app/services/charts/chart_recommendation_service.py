from app.services.charts.chart_rules import (
    ChartRules,
)


class ChartRecommendationService:
    """
    Recommends charts based on datatype,
    encoded categorical groups,
    and detected correlations.
    """

    @staticmethod
    def recommend(
        datatype_result: dict,
        correlation_result: dict,
    ) -> list[dict]:
        recommendations: list[dict] = []

        # -------------------------------------------------
        # Detect one-hot encoded categorical groups
        # -------------------------------------------------

        one_hot_groups = (
            ChartRecommendationService
            ._find_one_hot_groups(
                datatype_result
            )
        )

        grouped_columns = {
            column
            for columns
            in one_hot_groups.values()
            for column in columns
        }

        # -------------------------------------------------
        # Normal single-column recommendations
        # -------------------------------------------------

        for column, metadata in (
            datatype_result.items()
        ):
            # One-hot columns will be rendered together,
            # so don't create individual charts for them.
            if column in grouped_columns:
                continue

            category = metadata.get(
                "category"
            )

            rule = (
                ChartRules
                .SINGLE_COLUMN_RULES
                .get(category)
            )

            if rule is None:
                continue

            if rule["chart"] is None:
                continue

            recommendations.append(
                {
                    "type": "single_column",
                    "column": column,
                    "chart": rule["chart"],
                    "reason": rule["reason"],
                }
            )

        # -------------------------------------------------
        # Group one-hot encoded categorical columns
        # -------------------------------------------------

        for (
            group_name,
            columns,
        ) in one_hot_groups.items():
            recommendations.append(
                {
                    "type": "one_hot_group",
                    "group_name": group_name,
                    "columns": columns,
                    "chart": (
                        "grouped_one_hot_bar"
                    ),
                    "reason": (
                        "One-hot encoded columns "
                        "were combined into their "
                        "original categorical "
                        "distribution."
                    ),
                }
            )

        # -------------------------------------------------
        # Relationship recommendations
        # -------------------------------------------------

        for relation in correlation_result.get(
            "strong_correlations",
            [],
        ):
            feature_1 = str(
                relation["feature_1"]
            )

            feature_2 = str(
                relation["feature_2"]
            )

            # Skip relationships between dummy columns
            # created from the same original feature.
            if (
                ChartRecommendationService
                ._is_same_one_hot_group(
                    feature_1,
                    feature_2,
                )
            ):
                continue

            recommendations.append(
                {
                    "type": "relationship",
                    "columns": [
                        feature_1,
                        feature_2,
                    ],
                    "chart": "scatter_plot",
                    "reason": (
                        f"{relation['strength']} "
                        f"{relation['direction']} "
                        "correlation detected."
                    ),
                }
            )

        return recommendations

    @staticmethod
    def _find_one_hot_groups(
        datatype_result: dict,
    ) -> dict[str, list[str]]:
        """
        Detects encoded column groups such as:

        Gender__Female
        Gender__Male

        Contract Length__Annual
        Contract Length__Monthly
        Contract Length__Quarterly
        """

        groups: dict[
            str,
            list[str],
        ] = {}

        for column, metadata in (
            datatype_result.items()
        ):
            column_name = str(column)

            if "__" not in column_name:
                continue

            category = metadata.get(
                "category"
            )

            if category not in {
                "binary",
                "binary_categorical",
            }:
                continue

            base_name = (
                column_name.split(
                    "__",
                    1,
                )[0]
            )

            groups.setdefault(
                base_name,
                [],
            ).append(
                column_name
            )

        # Only treat it as a categorical group
        # when two or more encoded columns exist.
        return {
            group_name: columns
            for group_name, columns
            in groups.items()
            if len(columns) >= 2
        }

    @staticmethod
    def _is_same_one_hot_group(
        feature_1: str,
        feature_2: str,
    ) -> bool:
        """
        Returns True when two encoded columns
        originate from the same categorical feature.
        """

        if (
            "__" not in feature_1
            or "__" not in feature_2
        ):
            return False

        base_1 = feature_1.split(
            "__",
            1,
        )[0]

        base_2 = feature_2.split(
            "__",
            1,
        )[0]

        return base_1 == base_2