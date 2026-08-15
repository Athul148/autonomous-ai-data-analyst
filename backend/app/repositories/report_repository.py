from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.report import Report


class ReportRepository:
    def __init__(
        self,
        db: Session,
    ) -> None:
        self.db = db

    def create(
        self,
        *,
        user_id: int,
        dataset_id: int,
        title: str,
        report_data: dict,
    ) -> Report:
        report = Report(
            user_id=user_id,
            dataset_id=dataset_id,
            title=title,
            report_data=report_data,
        )

        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)

        return report

    def get_by_id(
        self,
        report_id: int,
    ) -> Report | None:
        statement = (
            select(Report)
            .options(
                joinedload(Report.dataset)
            )
            .where(
                Report.id == report_id
            )
        )

        return self.db.scalar(statement)

    def list_by_user(
        self,
        user_id: int,
    ) -> list[Report]:
        statement = (
            select(Report)
            .options(
                joinedload(Report.dataset)
            )
            .where(
                Report.user_id == user_id
            )
            .order_by(
                Report.created_at.desc()
            )
        )

        return list(
            self.db.scalars(
                statement
            ).unique().all()
        )

    def list_by_dataset(
        self,
        *,
        user_id: int,
        dataset_id: int,
    ) -> list[Report]:
        statement = (
            select(Report)
            .options(
                joinedload(Report.dataset)
            )
            .where(
                Report.user_id == user_id,
                Report.dataset_id == dataset_id,
            )
            .order_by(
                Report.created_at.desc()
            )
        )

        return list(
            self.db.scalars(
                statement
            ).unique().all()
        )

    def delete(
        self,
        report: Report,
    ) -> None:
        self.db.delete(report)
        self.db.commit()