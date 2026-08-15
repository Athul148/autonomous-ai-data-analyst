from io import BytesIO
from urllib.parse import quote

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.repositories.dataset_repository import (
    DatasetRepository,
)
from app.repositories.report_repository import (
    ReportRepository,
)
from app.schemas.report import (
    ReportCreate,
    ReportListItem,
    ReportResponse,
)
from app.services.reports.pdf_service import (
    ReportPDFService,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.post(
    "",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_report(
    payload: ReportCreate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset_repository = DatasetRepository(
        db
    )

    dataset = dataset_repository.get_by_id(
        payload.dataset_id
    )

    if (
        dataset is None
        or dataset.user_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found.",
        )

    repository = ReportRepository(db)

    return repository.create(
        user_id=current_user.id,
        dataset_id=payload.dataset_id,
        title=payload.title.strip(),
        report_data=payload.report_data,
    )


@router.get(
    "",
    response_model=list[ReportListItem],
)
def list_reports(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    repository = ReportRepository(db)

    reports = repository.list_by_user(
        current_user.id
    )

    return [
        ReportListItem(
            id=report.id,
            dataset_id=report.dataset_id,
            title=report.title,
            dataset_name=report.dataset.name,
            created_at=report.created_at,
            updated_at=report.updated_at,
        )
        for report in reports
    ]


@router.get(
    "/dataset/{dataset_id}",
    response_model=list[ReportListItem],
)
def list_dataset_reports(
    dataset_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    dataset_repository = DatasetRepository(
        db
    )

    dataset = dataset_repository.get_by_id(
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

    repository = ReportRepository(db)

    reports = repository.list_by_dataset(
        user_id=current_user.id,
        dataset_id=dataset_id,
    )

    return [
        ReportListItem(
            id=report.id,
            dataset_id=report.dataset_id,
            title=report.title,
            dataset_name=report.dataset.name,
            created_at=report.created_at,
            updated_at=report.updated_at,
        )
        for report in reports
    ]


@router.get("/{report_id}/pdf")
def download_report_pdf(
    report_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    repository = ReportRepository(db)

    report = repository.get_by_id(
        report_id
    )

    if (
        report is None
        or report.user_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    try:
        pdf_bytes = ReportPDFService.generate(
            title=report.title,
            dataset_name=report.dataset.name,
            report_data=report.report_data,
            created_at=report.created_at.isoformat(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate report PDF.",
        ) from exc

    safe_filename = (
        report.title
        .strip()
        .replace("/", "-")
        .replace("\\", "-")
    )

    encoded_filename = quote(
        f"{safe_filename}.pdf"
    )

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                "attachment; "
                f"filename*=UTF-8''{encoded_filename}"
            )
        },
    )


@router.get(
    "/{report_id}",
    response_model=ReportResponse,
)
def get_report(
    report_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    repository = ReportRepository(db)

    report = repository.get_by_id(
        report_id
    )

    if (
        report is None
        or report.user_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    return report


@router.delete(
    "/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_report(
    report_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    repository = ReportRepository(db)

    report = repository.get_by_id(
        report_id
    )

    if (
        report is None
        or report.user_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    repository.delete(report)