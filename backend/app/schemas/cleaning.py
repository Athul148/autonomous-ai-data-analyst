from pydantic import BaseModel, Field

from typing import Any, Literal

from pydantic import BaseModel, Field

class CleaningRecommendation(BaseModel):
    id: str
    category: str
    priority: str
    title: str
    description: str
    automatic: bool
    affected_columns: list[str] = Field(
        default_factory=list
    )


class CleaningSummary(BaseModel):
    total_recommendations: int
    high_priority: int
    medium_priority: int
    low_priority: int
    automatic_actions: int


class CleaningResponse(BaseModel):
    dataset_id: int
    dataset_name: str
    summary: CleaningSummary
    recommendations: list[
        CleaningRecommendation
    ] = Field(default_factory=list)


class CleaningPreviewRequest(BaseModel):
    action: Literal[
        "drop_missing_rows",
        "fill_missing_mean",
        "fill_missing_median",
        "fill_missing_mode",
        "drop_duplicates",
        "drop_column",
        "standardize",
        "normalize",
    ]

    columns: list[str] = Field(
        default_factory=list
    )


class CleaningPreviewSummary(BaseModel):
    original_rows: int
    preview_rows: int
    original_columns: int
    preview_columns: int
    rows_removed: int
    columns_removed: int
    values_changed: int


class CleaningPreviewResponse(BaseModel):
    dataset_id: int
    dataset_name: str
    action: str
    columns: list[str]

    summary: CleaningPreviewSummary

    before_sample: list[
        dict[str, Any]
    ] = Field(default_factory=list)

    after_sample: list[
        dict[str, Any]
    ] = Field(default_factory=list)

    warnings: list[str] = Field(
        default_factory=list
    )

class CleaningPlanAction(BaseModel):
    action: Literal[
        "drop_empty_rows",
        "drop_missing_rows",
        "fill_missing_mean",
        "fill_missing_median",
        "fill_missing_mode",
        "drop_duplicates",
        "drop_column",
        "one_hot_encode",
        "frequency_encode",
        "standardize",
        "normalize",
    ]

    columns: list[str] = Field(
        default_factory=list
    )


class CleaningPlanRequest(BaseModel):
    actions: list[
        CleaningPlanAction
    ] = Field(
        min_length=1
    )


class CleaningActionResult(BaseModel):
    action: str
    columns: list[str]

    status: Literal[
        "applied",
        "skipped",
        "failed",
    ]

    message: str
    values_changed: int = 0
    rows_removed: int = 0
    columns_removed: int = 0

    warnings: list[str] = Field(
        default_factory=list
    )


class CleaningDatasetState(BaseModel):
    rows: int
    columns: int
    missing_values: int
    duplicate_rows: int


class CleaningPlanResult(BaseModel):
    dataset_id: int
    dataset_name: str

    before: CleaningDatasetState
    after: CleaningDatasetState

    total_actions: int
    applied_actions: int
    skipped_actions: int
    failed_actions: int

    resolved_issues: int
    remaining_issues: int

    actions: list[
        CleaningActionResult
    ] = Field(default_factory=list)

    cleaned_sample: list[
        dict[str, Any]
    ] = Field(default_factory=list)

    warnings: list[str] = Field(
        default_factory=list
    )

class SaveCleanedDatasetRequest(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=255,
    )

    actions: list[
        CleaningPlanAction
    ] = Field(
        min_length=1
    )


class SaveCleanedDatasetResponse(BaseModel):
    dataset_id: int
    dataset_name: str
    source_dataset_id: int

    rows: int
    columns: int

    applied_actions: int
    skipped_actions: int
    failed_actions: int

    message: str

class AutomaticCleaningRequest(BaseModel):
    prepare_for_ml: bool = False


class AutomaticCleaningDecision(BaseModel):
    issue: str
    action: str
    columns: list[str] = Field(
        default_factory=list
    )
    reason: str


class AutomaticCleaningPlanResponse(BaseModel):
    dataset_id: int
    dataset_name: str
    prepare_for_ml: bool

    decisions: list[
        AutomaticCleaningDecision
    ] = Field(default_factory=list)

    total_decisions: int


class AutomaticCleaningResult(BaseModel):
    dataset_id: int
    dataset_name: str
    prepare_for_ml: bool

    before: CleaningDatasetState
    after: CleaningDatasetState

    applied_actions: int
    skipped_actions: int
    failed_actions: int

    resolved_issues: int
    remaining_issues: int

    actions: list[
        CleaningActionResult
    ] = Field(default_factory=list)

    decisions: list[
        AutomaticCleaningDecision
    ] = Field(default_factory=list)

    cleaned_sample: list[
        dict[str, Any]
    ] = Field(default_factory=list)

    warnings: list[str] = Field(
        default_factory=list
    )

class SaveAutomaticCleanedDatasetRequest(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=255,
    )

    prepare_for_ml: bool = False


class SaveAutomaticCleanedDatasetResponse(BaseModel):
    dataset_id: int
    dataset_name: str
    source_dataset_id: int
    prepare_for_ml: bool

    rows: int
    columns: int

    applied_actions: int
    skipped_actions: int
    failed_actions: int

    message: str