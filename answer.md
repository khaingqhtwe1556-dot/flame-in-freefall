# NASA Space Apps Challenge — Submission Answers

**Project:** FLAMEGUARD SI
**Team / Owner:** Khaing Kyu Htwe (`khaingqhtwe1556-dot`)
**Submission prepared:** 2026-11-15

> Paste-ready answers for every field in the Project Submission form.
> Character-limited fields (Project Raw Summary) are marked with their limit.

---

## 1. Project Name

```
FLAMEGUARD SI — Space Safety Intelligence for Microgravity Combustion
```

---

## 2. Project Raw Summary  (50–200 words suggested; field limit 1500 chars)

```
FLAMEGUARD SI turns NASA Physical Sciences Informatics combustion metadata into a
source-linked space-safety intelligence explorer. A hand-curated catalog of 26
microgravity and spacecraft-fire investigations powers a React/TypeScript front end: a
metadata explorer, an explainable ranking model that refuses to score unknown evidence
as zero, a synchronized Earth-vs-microgravity concept lab, a spacecraft emergency
scenario simulator, and a flame image analyzer. A companion FastAPI service adds
exploratory CSV analysis, Random Forest and Isolation Forest runs, and OpenCV image
processing for user-supplied files — each explicitly labelled a demonstration, never a
validated model. Every screen separates NASA-sourced facts from project interpretation,
cites the original PSI accession, and reports evidence coverage instead of hiding gaps.
No raw NASA data files were downloaded: FLAMEGUARD SI is an evidence-discovery and
teaching aid that makes explicit where NASA validation is still missing.
```

*(181 words / ~1,070 characters)*

---

## 3. Project Links

### 3.1 Project Demonstration — video (29.5 s, under the 30 s limit)

**Primary link — player page on the live deployment (public, no login, plays inline):**
```
http://152.42.160.210:44444/demo.html
```

**Platform-hosted backup — GitHub raw file (public, no login):**
```
https://raw.githubusercontent.com/khaingqhtwe1556-dot/flame-in-freefall/feat/space-apps-submission/frontend/public/FLAMEGUARD-SI-demo-30s.webm
```

**Direct file on the deployment (correct `video/webm` MIME, plays inline):**
```
http://152.42.160.210:44444/FLAMEGUARD-SI-demo-30s.webm
```

> Runtime **29.52 s**, 1280×720, VP9, silent — under the 30 s rule.
> Storyboard: **0–7 s** mission-control overview (catalog stats) → **7–19 s** 3D flame
> lab, flame forming while gravity/oxygen/airflow sliders move → **19–29.5 s** "Earth vs
> microgravity", the same flame rendered at both gravities with visibly different shape.
> A full-length 2 min 30 s recording is also kept at
> `exports/FLAMEGUARD-SI-demo.webm` (too long for the 30 s rule — link the trimmed cut).
>
> **Optional upgrade:** if you prefer a YouTube/Drive link (some reviewers prefer a
> familiar host), upload `FLAMEGUARD-SI-demo-30s.webm` to an unlisted YouTube video or a
> Drive/Dropbox link with public view permissions and paste that URL here instead.

### 3.2 Project — live application

```
http://152.42.160.210:44444/
```

> Publicly reachable, no password or registration. Front end + FastAPI API behind one
> origin (`/api/*` is reverse-proxied, so no CORS/login needed).

### 3.3 Project — source code

```
https://github.com/khaingqhtwe1556-dot/flame-in-freefall
```

> Public repository. Front end in `frontend/` (React + TypeScript + Vite), FastAPI
> service in `backend/`, shared hand-curated catalog in `data/`.
> The submission branch (`feat/space-apps-submission`) holds this `answer.md`, the
> 29.5 s demo cut, and the demo player page; `main` holds the application itself.

---

## 4. Project Details

### 4.1 What does it do, and how does it work?

FLAMEGUARD SI is a local-first research-exploration tool that turns reviewed NASA
Physical Sciences Informatics (PSI) combustion metadata into an explorable, source-linked
safety-intelligence workspace.

**Data layer.** A single hand-curated catalog (`data/investigations.json`, 26 records;
`data/sources.json`, 10 NASA sources + 3 historical incidents) is shared by both apps —
the front end imports it directly, the API reads it at runtime. No NASA API sync, no
scraping at runtime, no raw experiment files: 0 verified downloadable datasets exist, and
the app says so on screen.

**Front end (React 19 / TypeScript / Vite / Tailwind v4 / Three.js).** Fifteen views:

| Area | What it does |
|---|---|
| Mission briefing | Source-linked first-visit orientation separating NASA context, project interpretation, and illustrative visuals |
| NASA data explorer | Search and filter the catalog; every record links to its PSI accession |
| Experiment ranking | Five weighted criteria with per-criterion explanations and an evidence-coverage percentage |
| Comparison | Up to three investigations side by side on cataloged fields |
| SI research assistant | Deterministic keyword retrieval over the curated metadata with NASA links — no LLM, no full-document search |
| Fire risk analytics | Client-side CSV preview; optional API calls for correlations, Random Forest, and Isolation Forest |
| 3D flame lab | Lazy-loaded Three.js flame with gravity / oxygen / airflow / fuel sliders |
| Earth vs microgravity | Two synchronized conceptual flame views sharing one control set |
| Emergency simulator | Fictional branching spacecraft-fire scenarios for training discussion |
| Habitat explorer | Clickable Moon/Mars concept model with source-linked context |
| Flame image analyzer | Browser-local red/orange pixel heuristic plus optional OpenCV path |
| Conceptual flame diagram | Original 2D educational view, kept alongside the 3D lab |
| Moon & Mars intelligence | Candidate research topics, labelled as project interpretation |
| Report generator | Markdown export, print-to-PDF, and optional SQLite persistence |

**Back end (FastAPI / SQLAlchemy 2 / pandas / scikit-learn / OpenCV).** Serves catalog
queries, the ranking endpoint, the assistant retrieval endpoint, CSV analytics, exploratory
model training, anomaly detection, image analysis, and report persistence in SQLite.

**The central design idea: evidence honesty.** Unknown evidence is `null` and is *excluded*
from the weighted average — it is reported as `evidence_coverage` (e.g. 65 %) instead of
being silently scored as 0, which would look like a bad result rather than a missing one.
Every API payload carries explicit `notice` / `limitation` / `provenance` strings, and the
UI never claims NASA validation, hazard probability, or flight certification.

### 4.2 What benefits does it have?

- **For researchers and students:** a fast way to move from "what did NASA study about
  smoke detection?" to a citable, source-linked shortlist, with the gaps made visible
  instead of papered over.
- **For safety reviewers and educators:** a single place to reason about *what is known*,
  *what is inferred*, and *what is still unknown* about combustion in low-gravity and
  oxygen-rich environments — the kind of separation of evidence layers that is usually
  lost in slides and summaries.
- **For anyone evaluating an ML dataset:** the ranking view shows coverage and evidence
  strength before any model is trained, and the CSV analytics path labels every output
  "user-uploaded CSV; NASA provenance not verified" and "exploratory analysis of
  user-provided data only".
- **Cost and access:** runs entirely on one modest VPS with no cloud data services, no
  LLM API keys, and no vendor lock-in.

### 4.3 What is the intended impact?

The project targets the gap between *NASA having done the science* and *that science being
findable and usable*. Combustion in microgravity and oxygen-rich spacecraft environments
underlies crew safety, vehicle design, and mission risk, yet the relevant metadata is
scattered across a PSI search interface that returns records and file inventories rather
than an explanation.

FLAMEGUARD SI aims to make that body of work legible to non-specialists while staying
honest about its limits: it is an evidence-discovery and educational instrument, not a
certified fire-safety system. By showing *how much* of each record is actually evidenced
(evidence coverage) and marking every claim as NASA-sourced or project-interpreted, it
models the behaviour we want from AI-assisted safety tooling — and it demonstrates that
such tooling can be built with no model at all.

The second intended impact is methodological: the app demonstrates that a useful
NASA-data product can be built from public metadata alone, with no downloads, no
fabricated numbers, and no claim of validation it has not earned.

### 4.4 What tools, coding languages, hardware, or software did you use?

**Front end:** React 19, TypeScript 7, Vite 8, Tailwind CSS 4 (`@tailwindcss/vite`),
react-router 7, Three.js 0.187 with `@react-three/fiber`, Recharts, Framer Motion,
lucide-react, Oxlint (linting), Vitest (16 unit tests).

**Back end:** Python 3.12, FastAPI 0.163, Pydantic v2, SQLAlchemy 2.1, pandas, NumPy,
scikit-learn 1.9 (Random Forest, Isolation Forest, GroupShuffleSplit), OpenCV
(`opencv-python-headless`) for image analysis, Uvicorn, SQLite for report persistence.

**Tooling and deployment:** Git + GitHub (public repo), pnpm 12.18 (via Corepack),
Node 24.16, `systemctl --user` services on Ubuntu 24.04, a small dependency-free Node
static server with an `/api` reverse proxy, and headless Chromium for end-to-end UI
verification. **No special hardware** — a single x86-64 VPS; everything is CPU-only and
no GPU is used or required.

**Quality gates (all green at submission time):** `oxlint src` → 0 warnings / 0 errors;
`vitest run` → 16 tests passed; `tsc -b && vite build` → clean; Python
`unittest discover -s tests` → 10 tests passed.

### 4.5 How is your project creative?

1. **Epistemic honesty as a product feature.** Most NASA-data demos quietly fill gaps.
   FLAMEGUARD SI makes uncertainty a first-class citizen: `null` scores, an
   evidence-coverage percentage on every ranked record, `notice` / `limitation` /
   `provenance` on every API response, and UI that separates "NASA context" from
   "PROJECT INTERPRETATION" in the briefing itself. A judge can audit the app's honesty
   directly from the screen.
2. **AI without a model.** The "SI research assistant" is deliberately *not* an LLM — it is
   deterministic keyword retrieval over the curated catalog with stop-words and matched-term
   reporting. It cannot hallucinate a citation, and the app says so in the answer payload.
3. **Gravity as a first-class control.** Instead of a static diagram, gravity, oxygen
   fraction, airflow, and fuel are live parameters driving procedurally-generated flame
   geometry, with a synchronized Earth-vs-microgravity view that makes the low-gravity
   flame shape difference the centrepiece of the 30-second demo.
4. **Exploratory ML with guardrails.** Random Forest and Isolation Forest run against
   user-supplied CSVs with grouped train/test splits, but every result ships with a
   machine-readable limitation string and the sample data's provenance is never inferred.
5. **Honest image analysis.** A red/orange pixel heuristic — not a trained model — with
   the false-positive conditions (lighting, background, camera) stated in the UI.

### 4.6 What factors did your team consider?

- **Data integrity first.** The catalog was hand-curated from the reviewed PSI metadata
  and the NASA source list; nothing was auto-generated from an API. Raw experiment files
  were never downloaded, so the app states "0 verified downloadable datasets" instead of
  implying data access it does not have.
- **No overclaiming.** NASA branding is not used, and no output implies NASA validation,
  hazard probability, or flight certification. The emergency simulator is explicitly
  fictional, and the 3D scenes are labelled project-created concepts, not physics.
- **Graceful degradation.** The front end is fully usable with the API stopped; only CSV
  analytics, the OpenCV path, and report persistence need the service. A single origin
  (`/api` proxied) removes CORS and login friction for judges.
- **Performance and accessibility.** All pages are lazy-loaded and code-split, the app is
  keyboard-navigable with ARIA roles, and it respects `prefers-reduced-motion`.
- **Reproducibility.** One public repo, pinned dependency manifests, an explicit
  lint → test → build gate on both sides, and a database path that can be overridden with
  `FLAMEGUARD_DATABASE_URL`.
- **Deadline-safe scope.** The submission demo was cut to 29.5 s to satisfy the 30 s rule
  while keeping the strongest visual sequence.

---

## 5. Use of Super Intelligence (SI)

Select every option that matches the statements below (do **not** select any image,
video, or audio-generation option — none were used).

**SI was used for:**

- **Writing and refactoring code** for both applications — most of the React/TypeScript
  front end and the FastAPI service was drafted with AI coding assistants (OpenCode /
  Claude Code) under human review. The assistant proposed the implementations; the
  developer reviewed, ran, and corrected them, and every change is covered by the
  lint/test/build gates described above.
- **Drafting documentation and copy** — the README, the data-integrity rules, the
  source-grounded research guide (`Data resources.md`), and the submission text in this
  file were drafted with AI assistance and then reviewed against the source material.

**SI was NOT used for:**

- **Images.** Every visual asset is original work: SVG icons authored in `frontend/public/`,
  and the 3D flame / habitat scenes that are procedurally generated by Three.js
  geometry. No AI image generator produced any asset, so no SI watermark is required on
  any image.
- **Video.** The demo is a screen recording of the real running application, not
  AI-generated footage. It was cut to 29.5 s with FFmpeg (title card → flame lab →
  Earth vs microgravity). No SI watermark is required on the video.
- **Audio.** The demo contains no audio track. No AI-generated audio is present.
- **The application itself.** FLAMEGUARD SI ships **no** LLM, chatbot, foundation model,
  vector database, or image-generation model. The in-app "SI research assistant" is
  deterministic keyword retrieval over the curated metadata — it performs tokenization,
  stop-word removal, and substring matching, and it returns source links instead of
  generated text.

**Acknowledgement in the project (code/data descriptive text):** an "AI assistance"
note is recorded in the project README and in this submission's descriptive text, per
the challenge's requirement to acknowledge SI use for code and data.

---

## 6. NASA Data

All NASA data and resources used (the app's source catalog `data/sources.json`):

| # | Link Text | Link URL |
|---|---|---|
| 1 | NASA Physical Sciences Informatics — combustion search (primary investigation metadata + file inventories) | https://psi.nasa.gov/physci/repo/search?q=combustion |
| 2 | NASA Glenn — Combustion Science (program context, facilities, experiment families) | https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/ |
| 3 | NASA ScienceCasts — combustion on the ISS (introductory video; no transcript-level claims indexed) | https://www.youtube.com/watch?v=W1oXykoz9zg |
| 4 | NASA Researcher's Guide to Combustion Science (October 2015 technical guide) | https://www.nasa.gov/missions/station/a-researchers-guide-to-combustion-science/ |
| 5 | NASA Researcher's Guide to Combustion Science — PDF edition | https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf |
| 6 | NASA Safety & Mission Assurance — Apollo 1 AS-204 (cabin fire, oxygen-rich environment) | https://sma.nasa.gov/sma-disciplines/accllp/apollo-1 |
| 7 | NASA Safety & Mission Assurance — Apollo 13 SM-109 / LM-7 (oxygen-system reliability, mission contingency) | https://sma.nasa.gov/sma-disciplines/accllp/apollo-13 |
| 8 | NASA History — Fire Aboard Space Station Mir (1997 solid-fuel oxygen-generator fire) | https://www.nasa.gov/history/25-years-ago-fire-aboard-space-station-mir/ |
| 9 | NASA Spinoff — Fireman's Air Tanks (breathing-air equipment / human factors) | https://spinoff.nasa.gov/node/9582 |
| 10 | NASA Spinoff — Fire Detector (particle-detection and alarm technology transfer) | https://spinoff.nasa.gov/node/9407 |
| 11 | NASA Spinoff — New Technology for the Fire Attire (Project FIRES protective materials) | https://spinoff.nasa.gov/node/9918 |

**How the NASA data is used:** the PSI combustion search supplied the 26 investigation
records (accession, title, acronym, objective, summary, category, gravity context,
safety relationship, fuels/materials, formats, listed file-entry counts) that form the
catalog; the NASA Glenn overview, the 2015 Researcher's Guide, the Apollo 1 / Apollo 13
and Mir incident histories, and the three Spinoff articles supplied the program context,
facility knowledge, and historical fire-safety lessons shown in the overview, briefing,
and assistant views. **No raw NASA measurement files were downloaded or analyzed** —
the catalog is metadata-level, and the app reports 0 verified downloadable datasets.

---

## 7. Space Agency Partner & Other Data

All other data, resources, code, and tools used:

| # | Link Text | Link URL |
|---|---|---|
| 1 | FLAMEGUARD SI — project source code (this submission's code) | https://github.com/khaingqhtwe1556-dot/flame-in-freefall |
| 2 | FIRE-X — visualization description inspiration for the microgravity droplet treatment (no code or data copied) | https://github.com/Hekimovraiz/FIRE-X |
| 3 | React — front-end UI library | https://react.dev |
| 4 | Vite — front-end build tool and dev server | https://vite.dev |
| 5 | TypeScript — front-end language | https://www.typescriptlang.org |
| 6 | Tailwind CSS — styling framework | https://tailwindcss.com |
| 7 | Three.js — WebGL 3D engine for the flame and habitat scenes | https://threejs.org |
| 8 | @react-three/fiber — React renderer for Three.js | https://github.com/pmndrs/react-three-fiber |
| 9 | react-router — client-side routing | https://reactrouter.com |
| 10 | Recharts — charting for analytics and theme views | https://recharts.org |
| 11 | Framer Motion — UI animation | https://www.framer.com/motion/ |
| 12 | lucide-react — icon set (all icons are open-source SVGs) | https://lucide.dev |
| 13 | Oxlint — front-end linter | https://oxc.rs |
| 14 | Vitest — front-end test runner | https://vitest.dev |
| 15 | FastAPI — API framework | https://fastapi.tiangolo.com |
| 16 | Uvicorn — ASGI server | https://www.uvicorn.org |
| 17 | Pydantic — request/response validation | https://docs.pydantic.dev |
| 18 | SQLAlchemy — database ORM | https://www.sqlalchemy.org |
| 19 | pandas — CSV tabular analysis | https://pandas.pydata.org |
| 20 | NumPy — numerical computing | https://numpy.org |
| 21 | scikit-learn — Random Forest / Isolation Forest / model splits | https://scikit-learn.org |
| 22 | OpenCV (opencv-python-headless) — image analysis and annotation | https://opencv.org |
| 23 | SQLite — local report storage | https://www.sqlite.org |
| 24 | FFmpeg — trimming the demo video to the 30 s limit | https://ffmpeg.org |
| 25 | Ubuntu 24.04 / systemd — server operating system and service management | https://ubuntu.com |
| 26 | Node.js 24 + pnpm 12 (Corepack) — front-end toolchain | https://nodejs.org |

> **Attribution notes.** The FIRE-X repository was used only as *inspiration* for the
> layered-sphere treatment used in the microgravity droplet view; no FIRE-X code or
> experiment database was imported, and the visualization's colors are not presented as
> experimental measurements. All original artwork (the FLAMEGUARD/flameguard SVG icons,
> the flame and habitat scene geometry, and the dashboard layout) was authored for this
> project. No copyrighted music, images, or text were used. Google Fonts (Inter, Space
> Grotesk, Orbitron, all SIL Open Font License) are loaded by the web page.

---

## 8. Pre-submission checklist

- [x] Project Name filled in
- [x] Project Raw Summary written (181 words, under 1500 characters)
- [x] Demonstration uploaded to a public, no-login link — **29.52 s** (< 30 s) video, or ≤ 7 slides
- [x] Public project link — live site (no password/registration) + public code repository
- [x] Project Details completed for all six questions
- [x] SI-use options selected accurately, with images/video/audio usage declared as none
- [x] NASA Data: 11 links listed (PSI, Glenn, ScienceCasts, Researcher's Guide + PDF, Apollo 1, Apollo 13, Mir, 3× Spinoff)
- [x] Space Agency Partner & Other Data: 26 links listed (own code, FIRE-X, every open-source library and tool)
- [x] "All work is original" — external resources listed above; no copyrighted material used
- [x] Terms and Conditions agreed to
- [ ] Click **Save Progress**, then **Submit for Judging** before the local deadline

### Last-minute checks

1. Open the demonstration link in a **private/incognito window** to confirm it loads with
   no login prompt.
2. Open `http://152.42.160.210:44444/` in an incognito window and click through at least
   the explorer, ranking, 3D flame lab, and Earth-vs-microgravity views.
3. Confirm the services are running before submitting:
   `systemctl --user status flameguard-web flameguard-backend`
4. Submit, then download the participation certificate from the account profile page.
