from app.services.analysis.analysis_service import AnalysisService
from app.services.ai.insight_service import InsightService
from app.utils.dataset_loader import DatasetLoader

df = DatasetLoader.load(
    r"uploads\user_1\6924768b-b66c-42b8-8b0f-e02428ad965f.csv"
)

analysis = AnalysisService.analyze(df)

service = InsightService()

report = service.generate_insights(analysis)

print(report)