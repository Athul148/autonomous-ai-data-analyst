from typing import Literal

from pydantic import BaseModel, Field


class ChatHistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(
        ...,
        min_length=1,
        max_length=4000,
    )


class AIChatRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=2000,
    )

    history: list[ChatHistoryMessage] = Field(
        default_factory=list,
        max_length=20,
    )


class ChatInsight(BaseModel):
    title: str
    value: str | None = None
    description: str


class StructuredChatAnswer(BaseModel):
    headline: str
    summary: str
    insights: list[ChatInsight] = Field(
        default_factory=list,
    )
    takeaway: str | None = None


class AIChatResponse(BaseModel):
    dataset_id: int
    dataset_name: str
    question: str
    answer: StructuredChatAnswer