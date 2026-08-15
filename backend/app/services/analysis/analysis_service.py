import pandas as pd

from app.services.charts.chart_recommendation_service import (
    ChartRecommendationService,
)
from app.services.correlation.correlation_service import (
    CorrelationService,
)
from app.services.eda.datatype_service import (
    DatatypeService,
)
from app.services.eda.eda_service import (
    EDAService,
)
from app.services.validation.categorical_validation import (
    CategoricalValidation,
)
from app.services.validation.identifier_validation import (
    IdentifierValidation,
)
from app.services.validation.numeric_validation import (
    NumericValidation,
)


class AnalysisService:
    """
    Runs the complete analysis pipeline.
    """

    @staticmethod
    def analyze(
        dataframe: pd.DataFrame,
    ) -> dict:

        # EDA
        eda = EDAService.analyze(dataframe)

        # Datatypes
        datatypes = eda["datatypes"]

        # Validation
        validation = {
            "numeric": NumericValidation.validate(
                dataframe
            ),
            "categorical": CategoricalValidation.validate(
                dataframe,
                datatypes,
            ),
            "identifier": IdentifierValidation.validate(
                dataframe,
                datatypes,
            ),
        }

        # Correlation
        correlation = CorrelationService.analyze(
            dataframe=dataframe,
            datatype_result=datatypes,
            threshold=0.50,
        )

        # Chart Recommendations
        charts = ChartRecommendationService.recommend(
            datatypes,
            correlation,
        )

        return {
            "dataset": eda["dataset"],
            "statistics": eda["statistics"],
            "datatypes": datatypes,
            "quality": eda["quality"],
            "validation": validation,
            "correlation": correlation,
            "charts": charts,
        }