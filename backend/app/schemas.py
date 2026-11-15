from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


class RankingWeights(BaseModel):
    fireSafety: float = Field(ge=0, le=100)
    microgravity: float = Field(ge=0, le=100)
    datasetAvailability: float = Field(ge=0, le=100)
    mlSuitability: float = Field(ge=0, le=100)
    missionApplicability: float = Field(ge=0, le=100)


class RankingRequest(BaseModel):
    weights: RankingWeights


class CompareRequest(BaseModel):
    accessions: list[str] = Field(min_length=2, max_length=3)


class AssistantRequest(BaseModel):
    question: str = Field(min_length=2, max_length=500)


class CsvAnalysisRequest(BaseModel):
    csv_text: str = Field(min_length=1, max_length=10_500_000)


class ImageAnalysisRequest(BaseModel):
    image_base64: str = Field(min_length=8, max_length=16_777_216)
    file_name: str = Field(default="upload", max_length=200)


class TrainingRequest(CsvAnalysisRequest):
    target_column: str = Field(min_length=1, max_length=200)
    problem_type: Literal["classification", "regression"]
    group_column: str | None = Field(default=None, max_length=200)
    test_size: float = Field(default=0.2, ge=0.1, le=0.5)


class AnomalyRequest(CsvAnalysisRequest):
    contamination: float = Field(default=0.05, ge=0.01, le=0.2)


class ReportGenerateRequest(BaseModel):
    title: str = Field(default="FLAMEGUARD SI Research Brief", min_length=1, max_length=160)
    research_question: str = Field(default="", max_length=2_000)
    accessions: list[str] = Field(default_factory=list, max_length=50)


class ReportCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    research_question: str = Field(default="", max_length=2_000)
    markdown: str = Field(min_length=1, max_length=2_000_000)
    source_urls: list[HttpUrl] = Field(default_factory=list, max_length=100)


class ReportSummary(BaseModel):
    id: str
    title: str
    research_question: str
    source_urls: list[str]
    created_at: str


class ReportDetail(ReportSummary):
    markdown: str
