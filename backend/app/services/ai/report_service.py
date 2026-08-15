import json
from typing import Any

from pydantic import ValidationError

from app.schemas.ai_report import StructuredAIReport
from app.services.ai.gemini_service import (
    GeminiService,
)
from app.services.ai.report_context_service import (
    ReportContextService,
)


class ReportService:
    """
    Generates and validates a structured
    AI-powered dataset report.
    """

    def __init__(self) -> None:
        self.gemini_service = GeminiService()

    def generate_report(
        self,
        dataset_name: str,
        analysis: dict[str, Any],
    ) -> StructuredAIReport:
        context = ReportContextService.build(
            dataset_name=dataset_name,
            analysis=analysis,
        )

        prompt = self._build_prompt(context)

        response = self.gemini_service.generate(
            prompt
        )

        if not response or not response.strip():
            raise RuntimeError(
                "Gemini returned an empty AI report."
            )

        parsed_response = self._parse_json(
            response
        )

        try:
            return StructuredAIReport.model_validate(
                parsed_response
            )
        except ValidationError as exc:
            raise RuntimeError(
                "Gemini returned an invalid report structure."
            ) from exc

    @staticmethod
    def _parse_json(
        response: str,
    ) -> dict[str, Any]:
        cleaned_response = response.strip()

        if cleaned_response.startswith("```json"):
            cleaned_response = (
                cleaned_response[7:]
                .removesuffix("```")
                .strip()
            )
        elif cleaned_response.startswith("```"):
            cleaned_response = (
                cleaned_response[3:]
                .removesuffix("```")
                .strip()
            )

        try:
            parsed = json.loads(
                cleaned_response
            )
        except json.JSONDecodeError as exc:
            raise RuntimeError(
                "Gemini returned invalid JSON."
            ) from exc

        if not isinstance(parsed, dict):
            raise RuntimeError(
                "Gemini report must be a JSON object."
            )

        return parsed

    @staticmethod
    def _build_prompt(
        context: dict[str, Any],
    ) -> str:
        context_json = json.dumps(
            context,
            indent=2,
            ensure_ascii=False,
            default=str,
        )

        return f"""
You are a senior data analyst.

Generate a concise, professional, structured report
from the supplied dataset analysis.

Return ONLY valid JSON.
Do not use markdown.
Do not wrap the response in code fences.
Do not include commentary before or after the JSON.

DATASET ANALYSIS
================

{context_json}

Return exactly this JSON structure:

{{
  "summary": {{
    "headline": "One clear sentence describing the most important finding.",
    "description": "A concise 2-4 sentence overall interpretation."
  }},
  "metrics": {{
    "rows": 0,
    "columns": 0,
    "quality_score": 0,
    "missing_values": 0,
    "duplicate_rows": 0
  }},
  "key_findings": [
    {{
      "title": "Finding title",
      "value": "Short metric or value",
      "direction": "positive, negative, neutral, or null",
      "strength": "weak, moderate, moderately strong, strong, or null",
      "description": "Short evidence-based explanation."
    }}
  ],
  "recommendations": [
    {{
      "priority": 1,
      "title": "Recommendation title",
      "description": "Evidence-based next analytical step."
    }}
  ],
  "data_quality": {{
    "title": "Data Quality",
    "items": [
      "Short quality finding"
    ]
  }},
  "statistical_insights": {{
    "title": "Statistical Insights",
    "items": [
      "Short statistical observation"
    ]
  }},
  "relationships": {{
    "title": "Relationships",
    "items": [
      "Short correlation or relationship observation"
    ]
  }},
  "distribution_insights": {{
    "title": "Distribution Insights",
    "items": [
      "Short distribution observation"
    ]
  }},
  "data_preparation": {{
    "title": "Data Preparation",
    "items": [
      "Short preparation recommendation"
    ]
  }},
  "conclusion": "A concise final assessment."
}}

Rules:

- Use only supplied analysis values.
- Never invent metrics.
- Keep the summary understandable at first glance.
- Include 3 to 5 key findings.
- Include 3 to 5 ranked recommendations.
- Keep each item concise.
- Use string values for finding metrics, such as "+0.574".
- Use null when direction or strength does not apply.
- Correlation does not imply causation.
- Never use the words "risk", "impact", "driver", or
  "predictor" for correlations unless predictive analysis
  was explicitly performed.
- Use neutral finding titles such as "Association",
  "Relationship", or "Correlation".
- Never call correlations proven causes or business effects.
- Do not assume missing values occur in the same row.
- Never recommend deleting or removing rows unless row-level
  analysis explicitly supports that action.
- For missing values, recommend inspection and suitable
  field-specific handling without assuming deletion.
- Do not present scaling or standardization as mandatory.
  Describe it as model-dependent when relevant.
- Correlation strength must follow these rules:
  absolute value below 0.30 = weak,
  0.30 to below 0.50 = moderate,
  0.50 to below 0.70 = moderately strong,
  0.70 and above = strong.
- Recommendations must be directly connected to the
  supplied findings and framed as further investigation.
- Avoid repetition between sections.
""".strip()