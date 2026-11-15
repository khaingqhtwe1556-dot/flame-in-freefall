from datetime import timezone
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .catalog import HISTORICAL_INCIDENTS, INVESTIGATION_BY_ID, INVESTIGATIONS, RESEARCH_SOURCES
from .database import Base, engine, get_db
from .image_analysis import analyze_image
from .models import GeneratedReport
from .schemas import (
    AssistantRequest,
    CompareRequest,
    CsvAnalysisRequest,
    ImageAnalysisRequest,
    AnomalyRequest,
    RankingRequest,
    ReportCreate,
    ReportDetail,
    ReportGenerateRequest,
    ReportSummary,
    TrainingRequest,
)
from .ml import detect_anomalies, train_random_forest
from .services import analyze_csv, calculate_ranking, search_catalog

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FLAMEGUARD SI API",
    description="Source-aware research metadata and user-provided CSV analysis. No NASA measurement files are bundled.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def _report_summary(report: GeneratedReport) -> dict[str, Any]:
    created_at = report.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return {
        "id": report.id,
        "title": report.title,
        "research_question": report.research_question,
        "source_urls": report.source_urls,
        "created_at": created_at.isoformat(),
    }


def _save_report(
    db: Session,
    title: str,
    question: str,
    markdown: str,
    source_urls: list[str],
) -> GeneratedReport:
    report = GeneratedReport(
        title=title,
        research_question=question,
        markdown=markdown,
        source_urls=source_urls,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "flameguard-si-api"}


@app.get("/api/dashboard/overview")
def dashboard_overview() -> dict[str, int]:
    return {
        "investigation_records": len(INVESTIGATIONS),
        "listed_file_entries": sum(item["listedFileEntries"] for item in INVESTIGATIONS),
        "verified_downloadable_datasets": 0,
        "research_sources": len(RESEARCH_SOURCES),
        "historical_incidents": len(HISTORICAL_INCIDENTS),
    }


@app.get("/api/investigations")
def list_investigations(
    q: str = Query(default="", max_length=200),
    category: str | None = None,
    gravity: str | None = None,
    limit: int = Query(default=100, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    query = q.strip().lower()
    filtered = [
        item
        for item in INVESTIGATIONS
        if (not query or query in " ".join([item["title"], item["acronym"], item["summary"], item["objective"]]).lower())
        and (not category or item["category"] == category)
        and (not gravity or item["gravityContext"] == gravity)
    ]
    return {"total": len(filtered), "items": filtered[offset : offset + limit]}


@app.get("/api/investigations/{accession}")
def get_investigation(accession: str) -> dict[str, Any]:
    item = INVESTIGATION_BY_ID.get(accession.upper())
    if item is None:
        raise HTTPException(status_code=404, detail="Investigation accession was not found.")
    return item


@app.post("/api/investigations/compare")
def compare_investigations(request: CompareRequest) -> dict[str, Any]:
    if len(set(request.accessions)) != len(request.accessions):
        raise HTTPException(status_code=422, detail="Investigation accessions must be unique.")
    missing = [accession for accession in request.accessions if accession.upper() not in INVESTIGATION_BY_ID]
    if missing:
        raise HTTPException(status_code=404, detail=f"Unknown investigation accessions: {', '.join(missing)}")
    return {
        "items": [INVESTIGATION_BY_ID[accession.upper()] for accession in request.accessions],
        "notice": "Comparison contains curated metadata only; unverified fields remain unknown.",
    }


@app.get("/api/datasets")
def list_datasets() -> dict[str, Any]:
    return {
        "total": len(INVESTIGATIONS),
        "items": [
            {
                "accession": item["accession"],
                "title": item["title"],
                "listed_file_entries": item["listedFileEntries"],
                "formats": item["formats"],
                "availability": "metadata-files-unverified",
                "verified_download": False,
            }
            for item in INVESTIGATIONS
        ],
        "notice": "These are investigation metadata records, not verified or downloadable datasets.",
    }


@app.get("/api/datasets/{accession}")
def get_dataset_metadata(accession: str) -> dict[str, Any]:
    item = INVESTIGATION_BY_ID.get(accession.upper())
    if item is None:
        raise HTTPException(status_code=404, detail="Dataset metadata record was not found.")
    return {
        "investigation": item,
        "listed_file_entries": item["listedFileEntries"],
        "formats": item["formats"],
        "availability": "metadata-files-unverified",
        "verified_download": False,
        "notice": "This endpoint returns PSI investigation metadata, not verified or downloadable files.",
    }


@app.get("/api/research/sources")
def list_research_sources() -> dict[str, Any]:
    return {"items": RESEARCH_SOURCES}


@app.get("/api/research/incidents")
def list_incidents() -> dict[str, Any]:
    return {"items": HISTORICAL_INCIDENTS}


@app.post("/api/rankings/calculate")
def ranking(request: RankingRequest) -> dict[str, Any]:
    return {
        "items": calculate_ranking(request.weights),
        "notice": "Project-defined metadata rubric; not NASA-validated. Unknown criteria are excluded and evidence coverage is shown.",
    }


@app.post("/api/assistant/ask")
def assistant(request: AssistantRequest) -> dict[str, Any]:
    return search_catalog(request.question)


@app.post("/api/analytics/analyze")
def analytics(request: CsvAnalysisRequest) -> dict[str, Any]:
    return analyze_csv(request.csv_text)


@app.post("/api/analytics/analyze-image")
def analytics_image(request: ImageAnalysisRequest) -> dict[str, Any]:
    return analyze_image(request.image_base64, request.file_name)


@app.post("/api/analytics/train")
def train_model(request: TrainingRequest) -> dict[str, Any]:
    return train_random_forest(
        request.csv_text,
        request.target_column,
        request.problem_type,
        request.group_column,
        request.test_size,
    )


@app.post("/api/analytics/anomalies")
def find_anomalies(request: AnomalyRequest) -> dict[str, Any]:
    return detect_anomalies(request.csv_text, request.contamination)


@app.post("/api/reports/generate", response_model=ReportDetail)
def generate_report(
    request: ReportGenerateRequest,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    if len(set(request.accessions)) != len(request.accessions):
        raise HTTPException(status_code=422, detail="Investigation accessions must be unique.")
    missing = [value for value in request.accessions if value.upper() not in INVESTIGATION_BY_ID]
    if missing:
        raise HTTPException(status_code=404, detail=f"Unknown investigation accessions: {', '.join(missing)}")

    selected = [INVESTIGATION_BY_ID[value.upper()] for value in request.accessions]
    lines = [
        f"# {request.title}",
        "",
        "## Research question",
        request.research_question or "Not specified.",
        "",
        "## Executive summary",
        f"This report summarizes {len(selected)} curated PSI investigation metadata record(s).",
        "",
        "## Selected metadata",
    ]
    source_urls = []
    for item in selected:
        lines.extend(
            [
                f"### {item['acronym']} ({item['accession']})",
                f"- {item['title']}",
                f"- Summary: {item['summary']}",
                f"- Cataloged objective: {item['objective']}",
                f"- Gravity context: {item['gravityContext']}",
                "- File availability: unverified",
                f"- Source: {item['sourceUrl']}",
                "",
            ]
        )
        source_urls.append(item["sourceUrl"])
    lines.extend(
        [
            "## Limitations",
            "- PSI file listings are metadata; downloads and measurements have not been verified or analyzed.",
            "- Ranking and mission relevance are project-defined and are not NASA-validated.",
            "",
            "## Supplied NASA research sources",
        ]
    )
    lines.extend(f"- [{source['title']}]({source['url']})" for source in RESEARCH_SOURCES)
    source_urls.extend(source["url"] for source in RESEARCH_SOURCES)
    saved = _save_report(db, request.title, request.research_question, "\n".join(lines), list(dict.fromkeys(source_urls)))
    return {**_report_summary(saved), "markdown": saved.markdown}


@app.post("/api/reports", response_model=ReportDetail)
def save_report(request: ReportCreate, db: Session = Depends(get_db)) -> dict[str, Any]:
    saved = _save_report(
        db,
        request.title,
        request.research_question,
        request.markdown,
        [str(url) for url in request.source_urls],
    )
    return {**_report_summary(saved), "markdown": saved.markdown}


@app.get("/api/reports", response_model=list[ReportSummary])
def list_reports(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    reports = db.scalars(select(GeneratedReport).order_by(GeneratedReport.created_at.desc())).all()
    return [_report_summary(report) for report in reports]


@app.get("/api/reports/{report_id}", response_model=ReportDetail)
def get_report(report_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    report = db.get(GeneratedReport, report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Generated report was not found.")
    return {**_report_summary(report), "markdown": report.markdown}


@app.get("/api/reports/{report_id}/download")
def download_report(report_id: str, db: Session = Depends(get_db)) -> Response:
    report = db.get(GeneratedReport, report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Generated report was not found.")
    return Response(
        content=report.markdown,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="flameguard-{report.id}.md"'},
    )
