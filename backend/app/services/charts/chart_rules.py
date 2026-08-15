class ChartRules:
    """
    Contains chart recommendation rules.
    """

    SINGLE_COLUMN_RULES = {
        "continuous_numeric": {
            "chart": "histogram",
            "reason": "Continuous numeric distribution."
        },
        "discrete_numeric": {
            "chart": "bar_chart",
            "reason": "Discrete numeric values."
        },
        "categorical": {
            "chart": "bar_chart",
            "reason": "Compare category frequencies."
        },
        "binary": {
            "chart": "pie_chart",
            "reason": "Binary category comparison."
        },
        "binary_categorical": {
            "chart": "pie_chart",
            "reason": "Binary category comparison."
        },
        "datetime": {
            "chart": "line_chart",
            "reason": "Time-series visualization."
        },
        "identifier": {
            "chart": None,
            "reason": "Identifiers should not be visualized."
        },
        "text": {
            "chart": None,
            "reason": "Free text is not directly visualized."
        }
    }