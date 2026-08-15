import json
import math
from pathlib import Path
from typing import Literal

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
)
from app.models.user import User
from app.repositories.dataset_profile_repository import (
    DatasetProfileRepository,
)
from app.repositories.dataset_repository import (
    DatasetRepository,
)
from app.schemas.dataset_profile_schema import (
    DatasetProfileResponse,
)
from app.schemas.dataset_sample_schema import (
    DatasetSampleResponse,
)
from app.schemas.dataset_schema import (
    DatasetResponse,
)
from app.services.dataset.upload_service import (
    UploadService,
)
from app.services.profiling.profile_query_service import (
    ProfileQueryService,
)
from app.utils.dataset_loader import (
    DatasetLoader,
)


router = APIRouter(
    prefix="/datasets",
    tags=["Datasets"],
)


def get_upload_service(
    db: Session = Depends(get_db),
) -> UploadService:
    return UploadService(db)


def get_profile_service(
    db: Session = Depends(get_db),
) -> ProfileQueryService:
    repository = DatasetProfileRepository(
        db
    )

    return ProfileQueryService(
        repository
    )


def get_user_dataset(
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
        or dataset.user_id
        != current_user.id
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Dataset not found.",
        )

    return dataset


@router.post(
    "/upload",
    response_model=DatasetResponse,
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(
        get_current_user
    ),
    service: UploadService = Depends(
        get_upload_service
    ),
) -> DatasetResponse:
    return service.upload(
        file=file,
        current_user=current_user,
    )


@router.get(
    "",
    response_model=list[
        DatasetResponse
    ],
)
def list_datasets(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> list[DatasetResponse]:
    repository = DatasetRepository(db)

    datasets = repository.get_all_by_user(
        current_user.id
    )

    return [
        DatasetResponse.model_validate(
            dataset
        )
        for dataset in datasets
    ]


@router.get(
    "/{dataset_id}",
    response_model=DatasetResponse,
)
def get_dataset(
    dataset_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> DatasetResponse:
    dataset = get_user_dataset(
        dataset_id=dataset_id,
        current_user=current_user,
        db=db,
    )

    return DatasetResponse.model_validate(
        dataset
    )


@router.delete(
    "/{dataset_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
)
def delete_dataset(
    dataset_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> None:
    dataset = get_user_dataset(
        dataset_id=dataset_id,
        current_user=current_user,
        db=db,
    )

    storage_path = Path(
        dataset.storage_path
    )

    repository = DatasetRepository(db)

    try:
        repository.delete(
            dataset
        )
    except Exception as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Unable to delete dataset."
            ),
        ) from exc

    try:
        if storage_path.exists():
            storage_path.unlink()
    except OSError:
        pass


@router.get(
    "/{dataset_id}/profile",
    response_model=(
        DatasetProfileResponse
    ),
)
def get_dataset_profile(
    dataset_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
    service: ProfileQueryService = Depends(
        get_profile_service
    ),
) -> DatasetProfileResponse:
    get_user_dataset(
        dataset_id=dataset_id,
        current_user=current_user,
        db=db,
    )

    return service.get_profile(
        dataset_id
    )


@router.get(
    "/{dataset_id}/sample",
    response_model=(
        DatasetSampleResponse
    ),
)
def get_dataset_sample(
    dataset_id: int,
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=25,
        ge=1,
        le=100,
    ),
    search: str | None = Query(
        default=None
    ),
    sort_by: str | None = Query(
        default=None
    ),
    sort_order: Literal[
        "asc",
        "desc",
    ] = Query(
        default="asc"
    ),
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> DatasetSampleResponse:
    dataset = get_user_dataset(
        dataset_id=dataset_id,
        current_user=current_user,
        db=db,
    )

    try:
        dataframe = DatasetLoader.load(
            dataset.storage_path
        )
    except (
        FileNotFoundError,
        ValueError,
    ) as exc:
        raise HTTPException(
            status_code=(
                status
                .HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail=str(exc),
        ) from exc

    if search and search.strip():
        search_value = (
            search.strip()
        )

        matching_cells = (
            dataframe
            .astype("string")
            .apply(
                lambda column: (
                    column.str.contains(
                        search_value,
                        case=False,
                        na=False,
                        regex=False,
                    )
                )
            )
        )

        dataframe = dataframe[
            matching_cells.any(axis=1)
        ]

    if sort_by:
        if (
            sort_by
            not in dataframe.columns
        ):
            raise HTTPException(
                status_code=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
                detail=(
                    "Invalid sort column: "
                    f"{sort_by}"
                ),
            )

        dataframe = (
            dataframe.sort_values(
                by=sort_by,
                ascending=(
                    sort_order == "asc"
                ),
                na_position="last",
            )
        )

    total_rows = len(
        dataframe
    )

    total_pages = (
        math.ceil(
            total_rows / page_size
        )
        if total_rows > 0
        else 0
    )

    if (
        total_pages > 0
        and page > total_pages
    ):
        raise HTTPException(
            status_code=(
                status
                .HTTP_400_BAD_REQUEST
            ),
            detail=(
                f"Page {page} exceeds "
                f"total pages "
                f"({total_pages})."
            ),
        )

    start = (
        page - 1
    ) * page_size

    end = start + page_size

    sample = dataframe.iloc[
        start:end
    ]

    rows = json.loads(
        sample.to_json(
            orient="records",
            date_format="iso",
        )
    )

    return DatasetSampleResponse(
        page=page,
        page_size=page_size,
        total_rows=total_rows,
        total_pages=total_pages,
        columns=[
            str(column)
            for column
            in dataframe.columns
        ],
        rows=rows,
    )