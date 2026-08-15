from google import genai

from app.core.config import settings


class GeminiService:
    """
    Handles communication with Gemini AI.
    """

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

    def generate(
        self,
        prompt: str,
    ) -> str:
        """
        Generate AI response.
        """

        response = self.client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
        )

        return response.text