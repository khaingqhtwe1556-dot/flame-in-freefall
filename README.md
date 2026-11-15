# FLAMEGUARD SI

**Turning Microgravity Combustion Research into Space Safety Intelligence.**

FLAMEGUARD SI is a local-first space-science experience for exploring source-linked NASA combustion metadata and interactive, explicitly illustrative fire-science concepts. It is an evidence discovery and educational tool, not a flight-safety system.

## Run locally

Requirements: Node.js 20.19+, Corepack, and Python 3.10+.

Start the optional FastAPI backend in one terminal:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

In a second terminal, start the frontend:

```bash
cd frontend
corepack pnpm install
corepack pnpm dev --host 0.0.0.0
```

Open the URL Vite prints (normally `http://localhost:5173/`). The Vite development server proxies `/api` requests to `http://127.0.0.1:8000`. The frontend runs without the backend; local API actions, including OpenCV image processing, require both servers. FastAPI's interactive docs are at `http://127.0.0.1:8000/docs`.

The backend uses SQLite at `backend/data/flameguard.db` by default. Override with the `FLAMEGUARD_DATABASE_URL` environment variable if needed.

## Application areas

- **Mission briefing:** a short, source-linked visitor orientation that separates NASA context, project interpretation, and illustrative visuals.
- **Mission overview:** catalog-derived counts, research themes, source links, and evidence caveats.
- **NASA data explorer:** search/filter investigation metadata and inspect source-linked records.
- **Experiment ranking:** configurable, explainable criteria; unknown data/ML evidence remains unscored.
- **Comparison:** compare up to three investigations using cataloged fields.
- **SI research assistant:** local keyword retrieval over curated metadata, with NASA source links. It does not use an LLM or search full documents.
- **Fire risk analytics:** client-side CSV preview/statistics/charting; explicit local API actions compute correlations, train exploratory Random Forest models, or run Isolation Forest anomaly detection on user-provided files.
- **3D flame lab:** lazy-loaded Three.js flame visualization with interactive camera controls, parameter sliders, and pause/reset. Shapes are illustrative, not physical predictions.
- **Earth vs microgravity:** synchronized side-by-side conceptual flame views with shared controls.
- **Emergency simulator:** fictional branching scenarios for educational interaction; not an operational response procedure or certified training.
- **Habitat explorer:** clickable, rotatable Moon/Mars concept model with source-linked context. It is not an official habitat design.
- **Flame image analyzer:** browser-local, color-threshold image and image-sequence analysis with annotations, plus optional OpenCV processing through the local FastAPI service. It uses no trained AI model and does not infer fire risk.
- **Conceptual flame diagram:** the original 2D educational view remains available alongside the 3D lab.
- **Moon & Mars intelligence:** candidate research topics and records, labeled as project interpretations rather than validated mission recommendations.
- **Report generator:** export Markdown, print/save as PDF, and optionally persist reports in local SQLite.

## Checks

Frontend:

```bash
cd frontend
corepack pnpm lint
corepack pnpm test
corepack pnpm build
```

Backend (from `backend/` with its virtual environment active):

```bash
python -m unittest discover -s tests -v
```

## First-visit usability walkthrough

Ask a new visitor to:

1. Start the mission briefing and point out which statements link to NASA sources versus project interpretation.
2. Change a gravity/oxygen/airflow control and explain what changed in the concept visualization—and what the controls do not measure.
3. Open an investigation source from the explorer.
4. Load the generated analyzer sample and identify why it is not NASA imagery or a fire-risk result.

Note unclear labels, missed links, or misunderstandings before presenting the experience; do not treat successful interaction as scientific validation.

## Data integrity and limitations

- `data/investigations.json` and `data/sources.json` are the shared catalog used by the frontend and API.
- The investigation catalog contains 26 PSI search records and file-list entry counts from the reviewed metadata. A listed file is not proof of a downloadable or analyzed dataset.
- Raw PSI experiment files have not been downloaded or analyzed. Verified downloadable datasets currently: **0**.
- The assistant retrieves curated metadata only; linked NASA sources remain authoritative.
- Ranking values are produced by a project-defined rubric. They are not NASA scores, hazard probabilities, or validated mission recommendations.
- CSV files are user-provided. Their NASA provenance, units, experimental runs, and scientific meaning are not inferred.
- ML results use an explicit target and train/test split (with optional group-based splitting). They are exploratory demonstrations, not validated combustion models or hazard predictions.
- The lab illustration is not measured NASA data or a validated combustion simulation.
- The 3D flame and habitat scenes are project-created concepts. Controls change illustrative graphics; neither scene solves combustion physics or represents an official NASA design.
- The microgravity liquid-droplet view uses an original, conceptual layered-sphere treatment inspired by the visualization description in [Hekimovraiz/FIRE-X](https://github.com/Hekimovraiz/FIRE-X). FLAMEGUARD uses orange layers, imports no FIRE-X code or experiment database, and does not present its colors as experimental measurements.
- Emergency simulator choices and outcomes are fictional, project-authored scenarios, not validated spacecraft procedures or performance measures.
- Image analysis is a red/orange pixel heuristic. It is not an AI model; lighting, background, and camera conditions can create false matches. Browser-only analysis stays in the browser. If explicitly requested, the selected image is sent only to the user's local FastAPI service for OpenCV processing; it is not sent to NASA or an external server.
- No NASA API synchronization, LLM provider, vector database, flight-certified model, or operational safety recommendation is configured.

## Research reference

See [`Data resources.md`](Data%20resources.md) for the source-grounded research guide. The PSI file inventories were reviewed as metadata only; raw data files were not downloaded.

## AI assistance acknowledgement

Parts of this project's code, documentation, and UI copy were drafted with AI coding
assistants (OpenCode / Claude Code) under human review. Every change was verified by the
lint, test, and build commands listed above. No AI image, video, or audio generator was
used: all visual assets are original SVGs and procedurally generated Three.js geometry,
and the demo recording is a screen capture of the running application. The application
itself ships no LLM, chatbot, foundation model, or vector database — the in-app research
assistant is deterministic keyword retrieval over the curated catalog.
