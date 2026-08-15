from io import BytesIO
from typing import Any

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    ParagraphStyle,
    getSampleStyleSheet,
)
from reportlab.lib.units import mm
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


class ReportPDFService:
    """
    Generates a professional PDF from a saved
    structured AI report.
    """

    @staticmethod
    def generate(
        *,
        title: str,
        dataset_name: str,
        report_data: dict[str, Any],
        created_at: str,
    ) -> bytes:
        buffer = BytesIO()

        document = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=18 * mm,
            leftMargin=18 * mm,
            topMargin=18 * mm,
            bottomMargin=18 * mm,
            title=title,
            author="Autonomous AI Data Analyst",
        )

        styles = ReportPDFService._build_styles()
        story: list[Any] = []

        ReportPDFService._add_header(
            story=story,
            title=title,
            dataset_name=dataset_name,
            created_at=created_at,
            styles=styles,
        )

        ReportPDFService._add_summary(
            story=story,
            report_data=report_data,
            styles=styles,
        )

        ReportPDFService._add_metrics(
            story=story,
            report_data=report_data,
            styles=styles,
        )

        ReportPDFService._add_findings(
            story=story,
            report_data=report_data,
            styles=styles,
        )

        ReportPDFService._add_recommendations(
            story=story,
            report_data=report_data,
            styles=styles,
        )

        ReportPDFService._add_detail_sections(
            story=story,
            report_data=report_data,
            styles=styles,
        )

        ReportPDFService._add_conclusion(
            story=story,
            report_data=report_data,
            styles=styles,
        )

        document.build(
            story,
            onFirstPage=ReportPDFService._add_page_number,
            onLaterPages=ReportPDFService._add_page_number,
        )

        pdf_bytes = buffer.getvalue()
        buffer.close()

        return pdf_bytes

    @staticmethod
    def _build_styles() -> dict[str, ParagraphStyle]:
        base = getSampleStyleSheet()

        return {
            "title": ParagraphStyle(
                "ReportTitle",
                parent=base["Title"],
                fontName="Helvetica-Bold",
                fontSize=22,
                leading=27,
                textColor=colors.HexColor("#0F172A"),
                spaceAfter=8,
            ),
            "subtitle": ParagraphStyle(
                "ReportSubtitle",
                parent=base["Normal"],
                fontName="Helvetica",
                fontSize=9,
                leading=13,
                textColor=colors.HexColor("#64748B"),
                spaceAfter=4,
            ),
            "section": ParagraphStyle(
                "SectionTitle",
                parent=base["Heading2"],
                fontName="Helvetica-Bold",
                fontSize=14,
                leading=18,
                textColor=colors.HexColor("#1E3A8A"),
                spaceBefore=12,
                spaceAfter=8,
            ),
            "headline": ParagraphStyle(
                "SummaryHeadline",
                parent=base["Heading1"],
                fontName="Helvetica-Bold",
                fontSize=17,
                leading=22,
                textColor=colors.HexColor("#0F172A"),
                spaceAfter=8,
            ),
            "body": ParagraphStyle(
                "Body",
                parent=base["BodyText"],
                fontName="Helvetica",
                fontSize=9.5,
                leading=14,
                textColor=colors.HexColor("#334155"),
                alignment=TA_LEFT,
                spaceAfter=7,
            ),
            "card_title": ParagraphStyle(
                "CardTitle",
                parent=base["BodyText"],
                fontName="Helvetica-Bold",
                fontSize=9,
                leading=12,
                textColor=colors.HexColor("#475569"),
            ),
            "card_value": ParagraphStyle(
                "CardValue",
                parent=base["BodyText"],
                fontName="Helvetica-Bold",
                fontSize=16,
                leading=20,
                textColor=colors.HexColor("#0F172A"),
            ),
            "small": ParagraphStyle(
                "Small",
                parent=base["BodyText"],
                fontName="Helvetica",
                fontSize=8,
                leading=11,
                textColor=colors.HexColor("#64748B"),
            ),
            "bullet": ParagraphStyle(
                "Bullet",
                parent=base["BodyText"],
                fontName="Helvetica",
                fontSize=9.5,
                leading=14,
                leftIndent=12,
                firstLineIndent=-8,
                textColor=colors.HexColor("#334155"),
                spaceAfter=5,
            ),
        }

    @staticmethod
    def _add_header(
        *,
        story: list[Any],
        title: str,
        dataset_name: str,
        created_at: str,
        styles: dict[str, ParagraphStyle],
    ) -> None:
        story.append(
            Paragraph(
                ReportPDFService._escape(title),
                styles["title"],
            )
        )

        story.append(
            Paragraph(
                (
                    f"<b>Dataset:</b> "
                    f"{ReportPDFService._escape(dataset_name)}"
                ),
                styles["subtitle"],
            )
        )

        story.append(
            Paragraph(
                (
                    f"<b>Saved:</b> "
                    f"{ReportPDFService._escape(created_at)}"
                ),
                styles["subtitle"],
            )
        )

        story.append(Spacer(1, 8))

    @staticmethod
    def _add_summary(
        *,
        story: list[Any],
        report_data: dict[str, Any],
        styles: dict[str, ParagraphStyle],
    ) -> None:
        summary = report_data.get(
            "summary",
            {},
        )

        story.append(
            Paragraph(
                "Executive Summary",
                styles["section"],
            )
        )

        story.append(
            Paragraph(
                ReportPDFService._escape(
                    str(
                        summary.get(
                            "headline",
                            "Dataset analysis summary",
                        )
                    )
                ),
                styles["headline"],
            )
        )

        story.append(
            Paragraph(
                ReportPDFService._escape(
                    str(
                        summary.get(
                            "description",
                            "No summary was provided.",
                        )
                    )
                ),
                styles["body"],
            )
        )

    @staticmethod
    def _add_metrics(
        *,
        story: list[Any],
        report_data: dict[str, Any],
        styles: dict[str, ParagraphStyle],
    ) -> None:
        metrics = report_data.get(
            "metrics",
            {},
        )

        story.append(
            Paragraph(
                "Dataset Metrics",
                styles["section"],
            )
        )

        metric_items = [
            (
                "Records",
                ReportPDFService._format_number(
                    metrics.get("rows", 0)
                ),
            ),
            (
                "Columns",
                ReportPDFService._format_number(
                    metrics.get("columns", 0)
                ),
            ),
            (
                "Quality Score",
                f'{metrics.get("quality_score", 0)}%',
            ),
            (
                "Missing Values",
                ReportPDFService._format_number(
                    metrics.get(
                        "missing_values",
                        0,
                    )
                ),
            ),
            (
                "Duplicate Rows",
                ReportPDFService._format_number(
                    metrics.get(
                        "duplicate_rows",
                        0,
                    )
                ),
            ),
        ]

        cells = []

        for label, value in metric_items:
            cells.append(
                [
                    Paragraph(
                        ReportPDFService._escape(
                            label
                        ),
                        styles["card_title"],
                    ),
                    Paragraph(
                        ReportPDFService._escape(
                            value
                        ),
                        styles["card_value"],
                    ),
                ]
            )

        table = Table(
            [cells[:3], cells[3:]],
            colWidths=[
                54 * mm,
                54 * mm,
                54 * mm,
            ],
            hAlign="LEFT",
        )

        table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, -1),
                        colors.HexColor(
                            "#F8FAFC"
                        ),
                    ),
                    (
                        "BOX",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.HexColor(
                            "#CBD5E1"
                        ),
                    ),
                    (
                        "INNERGRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.HexColor(
                            "#E2E8F0"
                        ),
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "TOP",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        8,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        8,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        8,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        8,
                    ),
                ]
            )
        )

        story.append(table)
        story.append(Spacer(1, 8))

    @staticmethod
    def _add_findings(
        *,
        story: list[Any],
        report_data: dict[str, Any],
        styles: dict[str, ParagraphStyle],
    ) -> None:
        findings = report_data.get(
            "key_findings",
            [],
        )

        story.append(
            Paragraph(
                "Key Findings",
                styles["section"],
            )
        )

        if not findings:
            story.append(
                Paragraph(
                    "No key findings were provided.",
                    styles["body"],
                )
            )
            return

        for finding in findings:
            title = ReportPDFService._escape(
                str(
                    finding.get(
                        "title",
                        "Finding",
                    )
                )
            )

            value = ReportPDFService._escape(
                str(
                    finding.get(
                        "value",
                        "",
                    )
                )
            )

            description = (
                ReportPDFService._escape(
                    str(
                        finding.get(
                            "description",
                            "",
                        )
                    )
                )
            )

            story.append(
                KeepTogether(
                    [
                        Paragraph(
                            f"<b>{title}</b> - {value}",
                            styles["body"],
                        ),
                        Paragraph(
                            description,
                            styles["body"],
                        ),
                    ]
                )
            )

    @staticmethod
    def _add_recommendations(
        *,
        story: list[Any],
        report_data: dict[str, Any],
        styles: dict[str, ParagraphStyle],
    ) -> None:
        recommendations = report_data.get(
            "recommendations",
            [],
        )

        story.append(
            Paragraph(
                "Recommended Priorities",
                styles["section"],
            )
        )

        sorted_recommendations = sorted(
            recommendations,
            key=lambda item: item.get(
                "priority",
                999,
            ),
        )

        if not sorted_recommendations:
            story.append(
                Paragraph(
                    "No recommendations were provided.",
                    styles["body"],
                )
            )
            return

        for recommendation in sorted_recommendations:
            priority = recommendation.get(
                "priority",
                "",
            )

            title = ReportPDFService._escape(
                str(
                    recommendation.get(
                        "title",
                        "Recommendation",
                    )
                )
            )

            description = (
                ReportPDFService._escape(
                    str(
                        recommendation.get(
                            "description",
                            "",
                        )
                    )
                )
            )

            story.append(
                Paragraph(
                    (
                        f"<b>{priority}. {title}</b><br/>"
                        f"{description}"
                    ),
                    styles["body"],
                )
            )

    @staticmethod
    def _add_detail_sections(
        *,
        story: list[Any],
        report_data: dict[str, Any],
        styles: dict[str, ParagraphStyle],
    ) -> None:
        sections = [
            "data_quality",
            "statistical_insights",
            "relationships",
            "distribution_insights",
            "data_preparation",
        ]

        for section_key in sections:
            section = report_data.get(
                section_key,
                {},
            )

            title = str(
                section.get(
                    "title",
                    section_key.replace(
                        "_",
                        " ",
                    ).title(),
                )
            )

            items = section.get(
                "items",
                [],
            )

            story.append(
                Paragraph(
                    ReportPDFService._escape(
                        title
                    ),
                    styles["section"],
                )
            )

            if not items:
                story.append(
                    Paragraph(
                        "No details were provided.",
                        styles["body"],
                    )
                )
                continue

            for item in items:
                story.append(
                    Paragraph(
                        (
                            "&#8226; "
                            f"{ReportPDFService._escape(str(item))}"
                        ),
                        styles["bullet"],
                    )
                )

    @staticmethod
    def _add_conclusion(
        *,
        story: list[Any],
        report_data: dict[str, Any],
        styles: dict[str, ParagraphStyle],
    ) -> None:
        story.append(
            Paragraph(
                "Conclusion",
                styles["section"],
            )
        )

        story.append(
            Paragraph(
                ReportPDFService._escape(
                    str(
                        report_data.get(
                            "conclusion",
                            "No conclusion was provided.",
                        )
                    )
                ),
                styles["body"],
            )
        )

    @staticmethod
    def _add_page_number(
        canvas,
        document,
    ) -> None:
        canvas.saveState()

        canvas.setFont(
            "Helvetica",
            8,
        )

        canvas.setFillColor(
            colors.HexColor("#64748B")
        )

        canvas.drawRightString(
            A4[0] - 18 * mm,
            10 * mm,
            f"Page {document.page}",
        )

        canvas.restoreState()

    @staticmethod
    def _format_number(
        value: Any,
    ) -> str:
        try:
            return f"{int(value):,}"
        except (
            TypeError,
            ValueError,
        ):
            return str(value)

    @staticmethod
    def _escape(
        value: str,
    ) -> str:
        return (
            value.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
        )