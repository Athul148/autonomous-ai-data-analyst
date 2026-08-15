import json


class PromptBuilder:
    """
    Builds prompts for Gemini AI.
    """

    @staticmethod
    def build(analysis: dict) -> str:

        prompt = f"""
You are a Senior Data Scientist.

Analyze the following dataset.

=========================
DATASET
=========================

{json.dumps(analysis["dataset"], indent=2)}

=========================
QUALITY
=========================

{json.dumps(analysis["quality"], indent=2)}

=========================
VALIDATION
=========================

{json.dumps(analysis["validation"], indent=2)}

=========================
CORRELATION
=========================

{json.dumps(analysis["correlation"], indent=2)}

=========================
CHART RECOMMENDATIONS
=========================

{json.dumps(analysis["charts"], indent=2)}

Generate the following sections:

1. Executive Summary

2. Business Insights

3. Data Quality Issues

4. Cleaning Recommendations

5. Recommended Visualizations

6. Suggested Next Analysis

Respond in clear professional English.
"""

        return prompt