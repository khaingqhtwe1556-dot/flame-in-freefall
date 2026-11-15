import json
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[2]


def _read_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as file:
        return json.load(file)


INVESTIGATIONS: list[dict[str, Any]] = _read_json(PROJECT_ROOT / "data" / "investigations.json")
SOURCE_CATALOG: dict[str, Any] = _read_json(PROJECT_ROOT / "data" / "sources.json")
RESEARCH_SOURCES: list[dict[str, Any]] = SOURCE_CATALOG["researchSources"]
HISTORICAL_INCIDENTS: list[dict[str, Any]] = SOURCE_CATALOG["historicalIncidents"]

if len({item["accession"] for item in INVESTIGATIONS}) != len(INVESTIGATIONS):
    raise ValueError("Investigation catalog contains duplicate accession identifiers.")
if len({source["id"] for source in RESEARCH_SOURCES}) != len(RESEARCH_SOURCES):
    raise ValueError("Research source catalog contains duplicate identifiers.")

INVESTIGATION_BY_ID = {item["accession"]: item for item in INVESTIGATIONS}
