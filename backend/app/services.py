import csv
import io
import math
import re
from typing import Any

from fastapi import HTTPException

from .catalog import INVESTIGATIONS, RESEARCH_SOURCES
from .schemas import RankingWeights

MAX_CSV_BYTES = 10 * 1024 * 1024
MAX_CSV_ROWS = 50_000
MAX_CSV_COLUMNS = 200
MAX_CORRELATION_PAIRS = 250
STOP_WORDS = {
    "a", "an", "and", "are", "about", "can", "does", "for", "from",
    "how", "in", "is", "it", "of", "on", "or", "the", "to", "what",
    "which", "with",
}


def _tokens(value: str) -> list[str]:
    return [
        term
        for term in re.findall(r"[a-z0-9-]+", value.lower())
        if len(term) > 2 and term not in STOP_WORDS
    ]


def search_catalog(question: str) -> dict[str, Any]:
    terms = list(dict.fromkeys(_tokens(question)))
    if not terms:
        return {"mode": "metadata_search", "results": [], "message": "No searchable terms were found."}

    results: list[dict[str, Any]] = []
    for item in INVESTIGATIONS:
        text = " ".join(
            [
                item["title"],
                item["acronym"],
                item["summary"],
                item["objective"],
                item["category"],
                " ".join(item.get("fuelsAndMaterials") or []),
            ]
        ).lower()
        matched = [term for term in terms if term in text]
        if matched:
            results.append(
                {
                    "type": "investigation",
                    "id": item["accession"],
                    "title": f"{item['acronym']} - {item['title']}",
                    "excerpt": item["summary"],
                    "matched_terms": matched,
                    "url": item["sourceUrl"],
                }
            )

    for source in RESEARCH_SOURCES:
        text = f"{source['title']} {source['kind']} {source['relevance']}".lower()
        matched = [term for term in terms if term in text]
        if matched:
            results.append(
                {
                    "type": "source",
                    "id": source["id"],
                    "title": source["title"],
                    "excerpt": source["relevance"],
                    "matched_terms": matched,
                    "url": source["url"],
                }
            )

    results.sort(key=lambda result: (-len(result["matched_terms"]), result["id"]))
    return {
        "mode": "metadata_search",
        "results": results[:10],
        "message": "Keyword retrieval over curated metadata only; this is not an LLM-generated answer or full-document search.",
    }


def _criterion_scores(item: dict[str, Any]) -> dict[str, int | None]:
    safety_scores = {"direct": 5, "supporting": 3, "adjacent": 1, "none": None}
    gravity_scores = {"microgravity": 5, "mixed": 4, "ground": 2, "unknown": None}
    relevance = item["safetyRelationship"]
    return {
        "fireSafety": safety_scores[relevance],
        "microgravity": None if relevance == "none" else gravity_scores[item["gravityContext"]],
        "datasetAvailability": None,
        "mlSuitability": None,
        "missionApplicability": {"direct": 4, "supporting": 2, "adjacent": None, "none": None}[relevance],
    }


def calculate_ranking(weights: RankingWeights) -> list[dict[str, Any]]:
    weight_values = weights.model_dump()
    if not math.isclose(sum(weight_values.values()), 100, abs_tol=0.001):
        raise HTTPException(status_code=422, detail="Ranking weights must total 100%.")

    rankings = []
    for item in INVESTIGATIONS:
        scores = _criterion_scores(item)
        applicable_weight = sum(weight_values[key] for key, score in scores.items() if score is not None)
        weighted_score = sum(
            score * weight_values[key]
            for key, score in scores.items()
            if score is not None
        )
        rankings.append(
            {
                "accession": item["accession"],
                "acronym": item["acronym"],
                "score": (weighted_score / applicable_weight / 5 * 100) if applicable_weight else None,
                "evidence_coverage": applicable_weight,
                "criterion_scores": scores,
            }
        )
    rankings.sort(
        key=lambda item: (
            -(item["score"] if item["score"] is not None else -1),
            -item["evidence_coverage"],
            item["accession"],
        )
    )
    return rankings


def analyze_csv(csv_text: str) -> dict[str, Any]:
    if len(csv_text.encode("utf-8")) > MAX_CSV_BYTES:
        raise HTTPException(status_code=413, detail="CSV exceeds the 10 MB limit.")
    try:
        reader = csv.reader(io.StringIO(csv_text, newline=""), strict=True)
        rows = [row for row in reader if any(cell.strip() for cell in row)]
    except csv.Error as error:
        raise HTTPException(status_code=422, detail=f"Invalid CSV: {error}") from error

    if len(rows) < 2:
        raise HTTPException(status_code=422, detail="CSV must include headers and at least one data row.")
    if len(rows) - 1 > MAX_CSV_ROWS:
        raise HTTPException(status_code=413, detail=f"CSV exceeds the {MAX_CSV_ROWS:,} row limit.")

    headers = [header.strip() for header in rows[0]]
    if len(headers) > MAX_CSV_COLUMNS:
        raise HTTPException(status_code=413, detail=f"CSV exceeds the {MAX_CSV_COLUMNS} column limit.")
    if any(not header for header in headers):
        raise HTTPException(status_code=422, detail="Every CSV column needs a header.")
    if len(set(headers)) != len(headers):
        raise HTTPException(status_code=422, detail="CSV column headers must be unique.")

    data_rows = rows[1:]
    for row_number, row in enumerate(data_rows, start=2):
        if len(row) != len(headers):
            raise HTTPException(
                status_code=422,
                detail=f"Row {row_number} has {len(row)} cells; expected {len(headers)}.",
            )

    summaries = []
    numeric_values: dict[str, list[float | None]] = {}
    for index, header in enumerate(headers):
        values: list[float | None] = []
        present_count = 0
        for row in data_rows:
            cell = row[index].strip()
            if not cell:
                values.append(None)
                continue
            present_count += 1
            try:
                value = float(cell)
            except ValueError:
                values.append(None)
            else:
                values.append(value if math.isfinite(value) else None)

        valid = [value for value in values if value is not None]
        if len(valid) < 2 or len(valid) < present_count * 0.8:
            continue
        numeric_values[header] = values
        summaries.append(
            {
                "name": header,
                "count": len(valid),
                "missing": len(data_rows) - len(valid),
                "mean": sum(valid) / len(valid),
                "min": min(valid),
                "max": max(valid),
            }
        )

    correlations: list[dict[str, Any]] = []
    names = list(numeric_values)
    pair_count = 0
    correlations_truncated = False
    for left_index, left in enumerate(names):
        for right in names[left_index + 1 :]:
            if pair_count >= MAX_CORRELATION_PAIRS:
                correlations_truncated = True
                break
            pairs = [
                (left_value, right_value)
                for left_value, right_value in zip(numeric_values[left], numeric_values[right])
                if left_value is not None and right_value is not None
            ]
            if len(pairs) < 2:
                correlation = None
            else:
                left_values, right_values = zip(*pairs)
                left_mean = sum(left_values) / len(left_values)
                right_mean = sum(right_values) / len(right_values)
                numerator = sum((x - left_mean) * (y - right_mean) for x, y in pairs)
                denominator = math.sqrt(
                    sum((x - left_mean) ** 2 for x in left_values)
                    * sum((y - right_mean) ** 2 for y in right_values)
                )
                correlation = numerator / denominator if denominator else None
            correlations.append(
                {"left": left, "right": right, "paired_count": len(pairs), "pearson_r": correlation}
            )
            pair_count += 1
        if correlations_truncated:
            break

    return {
        "provenance": "user-uploaded CSV; NASA provenance not verified",
        "row_count": len(data_rows),
        "column_count": len(headers),
        "headers": headers,
        "numeric_summaries": summaries,
        "pairwise_correlations": correlations,
        "correlations_truncated": correlations_truncated,
        "method_note": "Descriptive statistics only. No time, run, unit, target, or causal meaning is inferred.",
    }
