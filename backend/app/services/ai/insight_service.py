from app.services.ai.gemini_service import GeminiService
from app.services.ai.prompt_builder import PromptBuilder


class InsightService:
    """
    Generates AI-powered insights from structured analysis results.
    """

    def __init__(self) -> None:
        self.gemini_service = GeminiService()

    def generate_insights(
        self,
        analysis: dict,
    ) -> str:
        """
        Build the analysis prompt and generate the AI report.
        """
        prompt = PromptBuilder.build(analysis)

        response = self.gemini_service.generate(prompt)

        if not response or not response.strip():
            raise RuntimeError(
                "Gemini returned an empty insight report."
            )

        return response.strip()