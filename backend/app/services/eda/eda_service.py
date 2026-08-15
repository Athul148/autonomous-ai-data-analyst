import pandas as pd

from app.services.eda.datatype_service import DatatypeService
from app.services.eda.quality_service import QualityService
from app.services.eda.statistics_service import StatisticsService


class EDAService:
    """
    Main service responsible for performing
    Exploratory Data Analysis (EDA).
    """

    @staticmethod
    def analyze(dataframe: pd.DataFrame) -> dict:
        """
        Run complete EDA pipeline.
        """

        statistics = StatisticsService.generate(
            dataframe
        )

        datatypes = DatatypeService.classify(
            dataframe
        )

        quality = QualityService.analyze(
            dataframe
        )

        return {
            "dataset": {
                "rows": len(dataframe),
                "columns": len(dataframe.columns),
                "memory_usage": quality["memory_usage"],
            },
            "statistics": statistics,
            "datatypes": datatypes,
            "quality": quality,
        }