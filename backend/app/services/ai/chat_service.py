import json
from typing import Any

from pydantic import ValidationError

from app.schemas.ai_chat import (
    ChatHistoryMessage,
    StructuredChatAnswer,
)
from app.services.ai.gemini_service import (
    GeminiService,
)
from app.services.ai.report_context_service import (
    ReportContextService,
)


class ChatService:
    """
    Answers dataset questions using structured,
    validated AI responses with conversation context.
    """

    def __init__(self) -> None:
        self.gemini_service = GeminiService()

    def answer_question(
        self,
        *,
        dataset_name: str,
        question: str,
        analysis: dict[str, Any],
        history: list[ChatHistoryMessage] | None = None,
    ) -> StructuredChatAnswer:
        context = ReportContextService.build(
            dataset_name=dataset_name,
            analysis=analysis,
        )

        prompt = self._build_prompt(
            question=question,
            context=context,
            history=history or [],
        )

        response = self.gemini_service.generate(
            prompt
        )

        if not response or not response.strip():
            raise RuntimeError(
                "Gemini returned an empty chat response."
            )

        parsed_response = self._parse_json(
            response
        )

        try:
            return StructuredChatAnswer.model_validate(
                parsed_response
            )
        except ValidationError as exc:
            raise RuntimeError(
                "Gemini returned an invalid chat response structure."
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
                "Gemini chat response must be a JSON object."
            )

        return parsed

    @staticmethod
    def _serialize_history(
        history: list[ChatHistoryMessage],
    ) -> list[dict[str, str]]:
        serialized: list[dict[str, str]] = []

        for message in history[-20:]:
            serialized.append(
                {
                    "role": message.role,
                    "content": message.content.strip(),
                }
            )

        return serialized

    @staticmethod
    def _build_prompt(
        *,
        question: str,
        context: dict[str, Any],
        history: list[ChatHistoryMessage],
    ) -> str:
        context_json = json.dumps(
            context,
            indent=2,
            ensure_ascii=False,
            default=str,
        )

        history_json = json.dumps(
            ChatService._serialize_history(
                history
            ),
            indent=2,
            ensure_ascii=False,
        )

        return f"""
You are an AI data analyst answering questions
about an uploaded dataset.

Return ONLY valid JSON.
Do not use markdown.
Do not wrap the response in code fences.
Do not include commentary before or after the JSON.

# DATASET ANALYSIS CONTEXT

{context_json}

# CONVERSATION HISTORY

{history_json}

# CURRENT USER QUESTION

{question}

Return exactly this JSON structure:

{{
  "headline": "A direct, clear answer to the question.",
  "summary": "A short 1-3 sentence explanation.",
  "insights": [
    {{
      "title": "Insight title",
      "value": "Optional short value such as +0.574, 57%, or 440,832",
      "description": "Short evidence-based explanation."
    }}
  ],
  "takeaway": "Optional practical next step or final takeaway."
}}

Rules:

- Answer only from the supplied dataset analysis context
  and conversation history.
- Use conversation history only to resolve references,
  follow-up questions, comparisons, and previously discussed
  items.
- Do not treat previous assistant statements as new factual
  evidence unless they are supported by the supplied dataset
  analysis context.
- Never invent values, trends, categories, or relationships.
- Resolve references such as "it", "that", "the first one",
  "the second one", or "compare them" from the conversation
  history when possible.
- If a reference cannot be resolved safely, ask for
  clarification through the structured answer instead of
  guessing.
- Keep the response focused on the user's exact question.
- For simple factual questions, return zero or one insight.
- For summary or comparison questions, return 2 to 4 insights.
- Keep every insight concise.
- Use null for value when no metric is needed.
- Use null for takeaway when no next step is useful.
- Do not generate a full report unless explicitly requested.
- Do not repeat the whole dataset analysis.
- Correlation does not imply causation.
- Describe correlations using neutral wording such as
  "is statistically associated with".
- Do not use the words "risk", "impact", "driver",
  "predictor", "likely", or "tend to" based only
  on correlation.
- Do not assume missing values occur in the same row.
- Do not recommend deleting rows without row-level evidence.
- Correlation strength must follow:
  absolute value below 0.30 = weak,
  0.30 to below 0.50 = moderate,
  0.50 to below 0.70 = moderately strong,
  0.70 and above = strong.
- Make the headline understandable at first glance.
- Avoid markdown symbols and long paragraphs.
""".strip()