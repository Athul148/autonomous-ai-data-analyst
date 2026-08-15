from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy.orm import Session
from app.services.cleaning.cleaning_plan_service import (
    CleaningPlanService,
)
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.dashboard_filter import (
    DashboardFilterRequest,
)

from app.services.dashboard.dashboard_filter_service import (
    DashboardFilterService,
)
from app.services.dashboard.dashboard_design_generator import (
    DashboardDesignGenerator,
)
from app.services.dashboard.dashboard_context_service import (
    DashboardContextService,
)
from app.services.dashboard.dashboard_service import (
    DashboardService,
)
from app.services.dashboard.dashboard_context_service import (
    DashboardContextService,
)
from app.services.dashboard.kpi_service import (
    KPIService,
)
from app.repositories.dataset_repository import (
    DatasetRepository,
)
from app.schemas.ai_chat import (
    AIChatRequest,
    AIChatResponse,
)
from app.schemas.cleaning import (
    CleaningPreviewRequest,
    CleaningPreviewResponse,
    CleaningResponse,
)
from app.schemas.cleaning import (
    AutomaticCleaningPlanResponse,
    AutomaticCleaningRequest,
    AutomaticCleaningResult,
    CleaningPlanRequest,
    CleaningPlanResult,
    CleaningPreviewRequest,
    CleaningPreviewResponse,
    CleaningResponse,
    SaveAutomaticCleanedDatasetRequest,
    SaveAutomaticCleanedDatasetResponse,
    SaveCleanedDatasetRequest,
    SaveCleanedDatasetResponse,
)
from app.services.ai.chat_service import (
    ChatService,
)
from app.services.ai.insight_service import (
    InsightService,
)
from app.services.cleaning.cleaned_dataset_service import (
    CleanedDatasetService,
)
from app.services.ai.report_service import (
    ReportService,
)
from app.services.cleaning.automatic_cleaning_service import (
    AutomaticCleaningService,
)
from app.services.analysis.analysis_service import (
    AnalysisService,
)
from app.services.charts.chart_recommendation_service import (
    ChartRecommendationService,
)
from app.services.cleaning.cleaning_preview_service import (
    CleaningPreviewService,
)
from app.services.cleaning.cleaning_service import (
    CleaningService,
)
from app.services.correlation.correlation_service import (
    CorrelationService,
)
from app.services.eda.datatype_service import (
    DatatypeService,
)
from app.services.eda.distribution_service import (
    DistributionService,
)
from app.services.visualization.chart_builder_service import (
    ChartBuilderService,
)
from app.utils.dataset_loader import (
    DatasetLoader,
)


router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"],
)


def get_owned_dataset(
    dataset_id: int,
    current_user: User,
    db: Session,
):
    repository = DatasetRepository(db)

    dataset = repository.get_by_id(
        dataset_id
    )

    if (
        dataset is None
        or dataset.user_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found.",
        )

    return dataset


def load_analysis(
    dataset_id: int,
    current_user: User,
    db: Session,
):
    dataset = get_owned_dataset(
        dataset_id,
        current_user,
        db,
    )

    dataframe = DatasetLoader.load(
        dataset.storage_path
    )

    analysis = AnalysisService.analyze(
        dataframe
    )

    return dataset, analysis


@router.get("/{dataset_id}/statistics")
def get_statistics(
    dataset_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    _, analysis = load_analysis(
        dataset_id,
        current_user,
        db,
    )

    return analysis["statistics"]


@router.get("/{dataset_id}/quality")
def get_quality(
    dataset_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    _, analysis = load_analysis(
        dataset_id,
        current_user,
        db,
    )

    return analysis["quality"]


@router.get("/{dataset_id}/validation")
def get_validation(
    dataset_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    _, analysis = load_analysis(
        dataset_id,
        current_user,
        db,
    )

    return analysis["validation"]


@router.get("/{dataset_id}/correlation")
def get_correlation(
    dataset_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset = get_owned_dataset(
        dataset_id,
        current_user,
        db,
    )

    dataframe = DatasetLoader.load(
        dataset.storage_path
    )

    datatypes = DatatypeService.classify(
        dataframe
    )

    return CorrelationService.analyze(
        dataframe=dataframe,
        datatype_result=datatypes,
        threshold=0.50,
    )


@router.get("/{dataset_id}/charts")
def get_chart_recommendations(
    dataset_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset = get_owned_dataset(
        dataset_id,
        current_user,
        db,
    )

    dataframe = DatasetLoader.load(
        dataset.storage_path
    )

    datatypes = DatatypeService.classify(
        dataframe
    )

    correlation = CorrelationService.analyze(
        dataframe=dataframe,
        datatype_result=datatypes,
        threshold=0.50,
    )

    return ChartRecommendationService.recommend(
        datatypes,
        correlation,
    )


@router.get(
    "/{dataset_id}/cleaning",
    response_model=CleaningResponse,
)
def get_cleaning_recommendations(
    dataset_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset = get_owned_dataset(
        dataset_id,
        current_user,
        db,
    )

    dataframe = DatasetLoader.load(
        dataset.storage_path
    )

    analysis = AnalysisService.analyze(
        dataframe
    )

    cleaning_result = (
        CleaningService.recommend(
            analysis=analysis,
            dataframe=dataframe,
        )
    )

    return CleaningResponse(
        dataset_id=dataset.id,
        dataset_name=dataset.name,
        summary=cleaning_result[
            "summary"
        ],
        recommendations=cleaning_result[
            "recommendations"
        ],
    )


@router.post(
    "/{dataset_id}/cleaning/preview",
    response_model=CleaningPreviewResponse,
)
def preview_cleaning_action(
    dataset_id: int,
    payload: CleaningPreviewRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset = get_owned_dataset(
        dataset_id,
        current_user,
        db,
    )

    dataframe = DatasetLoader.load(
        dataset.storage_path
    )

    try:
        preview_result = (
            CleaningPreviewService.preview(
                dataframe=dataframe,
                action=payload.action,
                columns=payload.columns,
            )
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return CleaningPreviewResponse(
        dataset_id=dataset.id,
        dataset_name=dataset.name,
        action=payload.action,
        columns=payload.columns,
        summary=preview_result[
            "summary"
        ],
        before_sample=preview_result[
            "before_sample"
        ],
        after_sample=preview_result[
            "after_sample"
        ],
        warnings=preview_result[
            "warnings"
        ],
    )

@router.post(
    "/{dataset_id}/cleaning/execute",
    response_model=CleaningPlanResult,
)
def execute_cleaning_plan(
    dataset_id: int,
    payload: CleaningPlanRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset = get_owned_dataset(
        dataset_id,
        current_user,
        db,
    )

    dataframe = DatasetLoader.load(
        dataset.storage_path
    )

    actions = [
        action.model_dump()
        for action in payload.actions
    ]

    result = CleaningPlanService.execute(
        dataframe=dataframe,
        actions=actions,
    )

    return CleaningPlanResult(
        dataset_id=dataset.id,
        dataset_name=dataset.name,
        before=result["before"],
        after=result["after"],
        total_actions=result[
            "total_actions"
        ],
        applied_actions=result[
            "applied_actions"
        ],
        skipped_actions=result[
            "skipped_actions"
        ],
        failed_actions=result[
            "failed_actions"
        ],
        resolved_issues=result[
            "resolved_issues"
        ],
        remaining_issues=result[
            "remaining_issues"
        ],
        actions=result["actions"],
        cleaned_sample=result[
            "cleaned_sample"
        ],
        warnings=result["warnings"],
    )
@router.post(
    "/{dataset_id}/cleaning/save",
    response_model=SaveCleanedDatasetResponse,
    status_code=status.HTTP_201_CREATED,
)
def save_cleaned_dataset(
    dataset_id: int,
    payload: SaveCleanedDatasetRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    source_dataset = get_owned_dataset(
        dataset_id,
        current_user,
        db,
    )

    dataframe = DatasetLoader.load(
        source_dataset.storage_path
    )

    actions = [
        action.model_dump()
        for action in payload.actions
    ]

    try:
        save_result = (
            CleanedDatasetService.save(
                db=db,
                source_dataset=source_dataset,
                user_id=current_user.id,
                name=payload.name,
                actions=actions,
                dataframe=dataframe,
            )
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save the cleaned dataset.",
        ) from exc

    cleaned_dataset = save_result[
        "dataset"
    ]

    result = save_result[
        "result"
    ]

    return SaveCleanedDatasetResponse(
        dataset_id=cleaned_dataset.id,
        dataset_name=cleaned_dataset.name,
        source_dataset_id=source_dataset.id,
        rows=cleaned_dataset.rows,
        columns=cleaned_dataset.columns,
        applied_actions=result[
            "applied_actions"
        ],
        skipped_actions=result[
            "skipped_actions"
        ],
        failed_actions=result[
            "failed_actions"
        ],
        message=(
            "Cleaned dataset saved successfully."
        ),
    )
@router.post(
    "/{dataset_id}/cleaning/automatic-plan",
    response_model=AutomaticCleaningPlanResponse,
)
def generate_automatic_cleaning_plan(
    dataset_id: int,
    payload: AutomaticCleaningRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset = get_owned_dataset(
        dataset_id,
        current_user,
        db,
    )

    dataframe = DatasetLoader.load(
        dataset.storage_path
    )

    plan = AutomaticCleaningService.build_plan(
        dataframe=dataframe,
        prepare_for_ml=payload.prepare_for_ml,
    )

    return AutomaticCleaningPlanResponse(
        dataset_id=dataset.id,
        dataset_name=dataset.name,
        prepare_for_ml=payload.prepare_for_ml,
        decisions=plan["decisions"],
        total_decisions=plan[
            "total_decisions"
        ],
    )

@router.post(
    "/{dataset_id}/cleaning/automatic-execute",
    response_model=AutomaticCleaningResult,
)
def execute_automatic_cleaning(
    dataset_id: int,
    payload: AutomaticCleaningRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset = get_owned_dataset(
        dataset_id,
        current_user,
        db,
    )

    dataframe = DatasetLoader.load(
        dataset.storage_path
    )

    plan = AutomaticCleaningService.build_plan(
        dataframe=dataframe,
        prepare_for_ml=payload.prepare_for_ml,
    )

    actions = [
        {
            "action": decision["action"],
            "columns": decision["columns"],
        }
        for decision in plan["decisions"]
    ]

    result = CleaningPlanService.execute(
        dataframe=dataframe,
        actions=actions,
    )

    return AutomaticCleaningResult(
        dataset_id=dataset.id,
        dataset_name=dataset.name,
        prepare_for_ml=payload.prepare_for_ml,
        before=result["before"],
        after=result["after"],
        applied_actions=result[
            "applied_actions"
        ],
        skipped_actions=result[
            "skipped_actions"
        ],
        failed_actions=result[
            "failed_actions"
        ],
        resolved_issues=result[
            "resolved_issues"
        ],
        remaining_issues=result[
            "remaining_issues"
        ],
        actions=result["actions"],
        decisions=plan["decisions"],
        cleaned_sample=result[
            "cleaned_sample"
        ],
        warnings=result["warnings"],
    )

@router.post(
    "/{dataset_id}/cleaning/automatic-save",
    response_model=SaveAutomaticCleanedDatasetResponse,
    status_code=status.HTTP_201_CREATED,
)
def save_automatic_cleaned_dataset(
    dataset_id: int,
    payload: SaveAutomaticCleanedDatasetRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    source_dataset = get_owned_dataset(
        dataset_id,
        current_user,
        db,
    )

    dataframe = DatasetLoader.load(
        source_dataset.storage_path
    )

    plan = AutomaticCleaningService.build_plan(
        dataframe=dataframe,
        prepare_for_ml=payload.prepare_for_ml,
    )

    actions = [
        {
            "action": decision["action"],
            "columns": decision["columns"],
        }
        for decision in plan["decisions"]
    ]

    if not actions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No automatic cleaning actions "
                "were required for this dataset."
            ),
        )

    try:
        save_result = (
            CleanedDatasetService.save(
                db=db,
                source_dataset=source_dataset,
                user_id=current_user.id,
                name=payload.name,
                actions=actions,
                dataframe=dataframe,
            )
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to save the automatically "
                "cleaned dataset."
            ),
        ) from exc

    cleaned_dataset = save_result[
        "dataset"
    ]

    result = save_result[
        "result"
    ]

    return SaveAutomaticCleanedDatasetResponse(
        dataset_id=cleaned_dataset.id,
        dataset_name=cleaned_dataset.name,
        source_dataset_id=source_dataset.id,
        prepare_for_ml=payload.prepare_for_ml,
        rows=cleaned_dataset.rows,
        columns=cleaned_dataset.columns,
        applied_actions=result[
            "applied_actions"
        ],
        skipped_actions=result[
            "skipped_actions"
        ],
        failed_actions=result[
            "failed_actions"
        ],
        message=(
            "Automatically cleaned dataset "
            "saved successfully."
        ),
    )

@router.get("/{dataset_id}/visualizations")
def get_visualizations(
    dataset_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset = get_owned_dataset(
        dataset_id,
        current_user,
        db,
    )

    dataframe = DatasetLoader.load(
        dataset.storage_path
    )

    datatypes = DatatypeService.classify(
        dataframe
    )

    correlation = CorrelationService.analyze(
        dataframe=dataframe,
        datatype_result=datatypes,
        threshold=0.50,
    )

    recommendations = (
        ChartRecommendationService.recommend(
            datatypes,
            correlation,
        )
    )

    charts = ChartBuilderService.build(
        dataframe=dataframe,
        chart_recommendations=recommendations,
    )

    return {
        "dataset_id": dataset.id,
        "total_charts": len(charts),
        "charts": charts,
    }


@router.get("/{dataset_id}/distribution")
def get_column_distribution(
    dataset_id: int,
    column: str = Query(
        ...,
        min_length=1,
    ),
    bins: int = Query(
        default=20,
        ge=5,
        le=100,
    ),
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset = get_owned_dataset(
        dataset_id,
        current_user,
        db,
    )

    dataframe = DatasetLoader.load(
        dataset.storage_path
    )

    try:
        return DistributionService.analyze(
            dataframe=dataframe,
            column=column,
            bins=bins,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.post("/{dataset_id}/insights")
def generate_dataset_insights(
    dataset_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset, analysis = load_analysis(
        dataset_id,
        current_user,
        db,
    )

    report = (
        InsightService()
        .generate_insights(analysis)
    )

    return {
        "dataset_id": dataset.id,
        "dataset_name": dataset.name,
        "report": report,
    }


@router.post("/{dataset_id}/report")
def generate_ai_report(
    dataset_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset, analysis = load_analysis(
        dataset_id,
        current_user,
        db,
    )

    try:
        report = (
            ReportService()
            .generate_report(
                dataset_name=dataset.name,
                analysis=analysis,
            )
        )

    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate AI report.",
        ) from exc

    return {
        "dataset_id": dataset.id,
        "dataset_name": dataset.name,
        "report": report.model_dump(),
    }


@router.post(
    "/{dataset_id}/chat",
    response_model=AIChatResponse,
)
def ask_dataset_question(
    dataset_id: int,
    payload: AIChatRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset, analysis = load_analysis(
        dataset_id,
        current_user,
        db,
    )

    try:
        answer = (
            ChatService()
            .answer_question(
                dataset_name=dataset.name,
                question=payload.question,
                analysis=analysis,
                history=payload.history,
            )
        )

    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to answer the dataset question."
            ),
        ) from exc

    return AIChatResponse(
        dataset_id=dataset.id,
        dataset_name=dataset.name,
        question=payload.question,
        answer=answer,
    )

@router.post("/{dataset_id}/dashboard/filter")
def filter_dashboard(
    dataset_id: int,
    payload: DashboardFilterRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset = get_owned_dataset(
        dataset_id,
        current_user,
        db,
    )

    dataframe = DatasetLoader.load(
        dataset.storage_path
    )

    try:
        filtered_dataframe = (
            DashboardFilterService.apply(
                dataframe=dataframe,
                request=payload,
            )
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    if filtered_dataframe.empty:
        raise HTTPException(
            status_code=400,
            detail=(
                "The selected dashboard filters "
                "returned no matching rows."
            ),
        )

    analysis = AnalysisService.analyze(
        filtered_dataframe
    )

    context = DashboardContextService.build(
        dataset_name=dataset.name,
        analysis=analysis,
    )

    dashboard = DashboardService.build(
        dataframe=filtered_dataframe,
        context=context,
    )

    return {
        "dataset_id": dataset.id,
        "dataset_name": dataset.name,
        "filtered_rows": int(
            len(filtered_dataframe)
        ),
        "dashboard": dashboard,
    }

@router.get("/{dataset_id}/dashboard-designs")
def get_dashboard_designs(
    dataset_id: int,
    batch_number: int = 1,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    if batch_number < 1:
        raise HTTPException(
            status_code=400,
            detail="Batch number must be at least 1.",
        )

    dataset = get_owned_dataset(
        dataset_id,
        current_user,
        db,
    )

    dataframe = DatasetLoader.load(
        dataset.storage_path
    )

    analysis = AnalysisService.analyze(
        dataframe
    )

    context = DashboardContextService.build(
        dataset_name=dataset.name,
        analysis=analysis,
    )

    dashboard = DashboardService.build(
        dataframe=dataframe,
        context=context,
    )

    batch = DashboardDesignGenerator.generate(
        dataset_name=dataset.name,
        dashboard=dashboard,
        batch_number=batch_number,
    )

    return {
        "dataset_id": dataset.id,
        "dataset_name": dataset.name,
        "batch": batch,
    }

@router.get("/{dataset_id}/dashboard")
def get_dashboard(
    dataset_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset = get_owned_dataset(
        dataset_id,
        current_user,
        db,
    )

    dataframe = DatasetLoader.load(
        dataset.storage_path
    )

    analysis = AnalysisService.analyze(
        dataframe
    )

    context = DashboardContextService.build(
        dataset_name=dataset.name,
        analysis=analysis,
    )

    dashboard = DashboardService.build(
        dataframe=dataframe,
        context=context,
    )

    return {
        "dataset_id": dataset.id,
        "dataset_name": dataset.name,
        "dashboard": dashboard,
    }

@router.get("/{dataset_id}/dashboard/kpis")
def get_dashboard_kpis(
    dataset_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset, analysis = load_analysis(
        dataset_id,
        current_user,
        db,
    )

    context = DashboardContextService.build(
        dataset_name=dataset.name,
        analysis=analysis,
    )

    kpis = KPIService.build(
        context=context,
    )

    return {
        "dataset_id": dataset.id,
        "dataset_name": dataset.name,
        "total_kpis": len(kpis),
        "kpis": kpis,
    }