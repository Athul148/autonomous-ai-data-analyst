from pydantic import BaseModel, Field


class ReportSummary(BaseModel):
    headline: str
    description: str


class ReportMetrics(BaseModel):
    rows: int
    columns: int
    quality_score: float
    missing_values: int
    duplicate_rows: int


class ReportFinding(BaseModel):
    title: str
    value: str
    direction: str | None = None
    strength: str | None = None
    description: str


class ReportRecommendation(BaseModel):
    priority: int
    title: str
    description: str


class ReportSection(BaseModel):
    title: str
    items: list[str] = Field(
        default_factory=list
    )


class StructuredAIReport(BaseModel):
    summary: ReportSummary
    metrics: ReportMetrics
    key_findings: list[ReportFinding]
    recommendations: list[ReportRecommendation]
    data_quality: ReportSection
    statistical_insights: ReportSection
    relationships: ReportSection
    distribution_insights: ReportSection
    data_preparation: ReportSection
    conclusion: str


class AIReportResponse(BaseModel):
    dataset_id: int
    dataset_name: str
    report: StructuredAIReport