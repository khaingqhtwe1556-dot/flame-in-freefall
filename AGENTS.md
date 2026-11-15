# AGENTS.md — FLAMEGUARD SI

NASA microgravity-combustion metadata explorer. Two independent apps over one hand-curated catalog.
Read `README.md` (product + data-integrity rules) and `Data resources.md` (source evidence) before
changing anything scientific; this file only covers mechanics.

## Layout

- `data/investigations.json` (26 records) + `data/sources.json` — the **shared catalog**, single source of
  truth for both apps. Frontend imports it by relative path (`frontend/src/data/investigations.ts` →
  `../../../data/investigations.json`); backend reads it at runtime (`backend/app/catalog.py`,
  `PROJECT_ROOT/data`). Never copy the catalog into an app — edit the root JSON. `frontend/vite.config.ts`
  sets `server.fs.allow: ['../']` precisely so the out-of-root import resolves.
- `frontend/` — React 19, Vite 8, TS ~7, Tailwind v4 (via `@tailwindcss/vite`), react-router v7, oxlint, vitest.
- `backend/` — FastAPI, SQLAlchemy 2, pandas/sklearn, OpenCV. SQLite at `backend/data/flameguard.db`
  (override with `FLAMEGUARD_DATABASE_URL`).
- `exports/` — committed 16 MB demo recording, not a build artifact.

## Commands

Frontend, from `frontend/`. Use `corepack pnpm` (pnpm is pinned to 12.18.0 via `packageManager`):

```bash
corepack pnpm install
corepack pnpm dev --host 0.0.0.0     # http://localhost:5173
corepack pnpm lint                   # oxlint src; silent on success, read the exit code
corepack pnpm test                   # vitest run
corepack pnpm build                  # tsc -b && vite build
corepack pnpm vitest run src/data/ranking.test.ts   # single file
```

There is **no `typecheck` script** — `pnpm build` is the typecheck (`tsc -b` over the `tsconfig.app.json` /
`tsconfig.node.json` project references). Expect a >500 kB chunk-size warning from the 3D scenes; it is not a failure.

Backend, from `backend/` with the venv active (`.venv` exists; Python 3.12):

```bash
source .venv/bin/activate
python -m unittest discover -s tests -v                          # full suite
python -m unittest tests.test_services.CatalogServiceTests -v    # single class
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000      # docs at /docs
```

Must run from `backend/` so `app` is importable. No pytest, ruff, black, or mypy are configured — unittest only.
There is **no CI**; these local commands are the entire gate. Run frontend `lint` → `test` → `build` and the
backend suite before opening a PR.

## Wiring facts that are easy to get wrong

- The frontend works with the backend **stopped**. Only four features call the API: CSV analysis
  (`/api/analytics/analyze`), exploratory ML (`/api/analytics/train`, `/api/analytics/anomalies`), OpenCV image
  analysis (`/api/analytics/analyze-image`), and report persistence (`/api/reports*`). Explorer, ranking,
  comparison, assistant, and every 3D/visual page run off the local catalog.
- Vite proxies `/api` → `http://127.0.0.1:8000`. FastAPI CORS (`backend/app/main.py`) allows **only**
  `http://localhost:5173` and `http://127.0.0.1:5173` — change the dev port and you must update CORS.
- Ranking and keyword retrieval are implemented **twice** and must stay consistent:
  `frontend/src/data/ranking.ts` (client-side, powers RankingPage) vs `backend/app/services.py`
  (`calculate_ranking`, `search_catalog`). Same 0–5 criterion rubric, same "weights total 100%" validation.
  A change in one needs the mirror change in the other.
- Unknown evidence scores `null` and is **excluded** from the weighted average (reported as
  `evidence_coverage`), never scored as 0.
- All frontend API errors go through `readApiResponse` in `frontend/src/services/api.ts`, which surfaces the
  FastAPI `detail` string. Route new failures there rather than ad-hoc try/catch.
- Adding a page touches three places: the lazy route in `frontend/src/App.tsx`, the `navigation` array and
  `pageTitle()` in `frontend/src/components/AppShell.tsx`.
- UI colors come from CSS custom properties in `frontend/src/index.css` (`--bg`, `--panel`, `--orange`, …).
  Match those instead of hardcoded hex.

## TypeScript / lint conventions (enforced by `tsc -b`)

`erasableSyntaxOnly` (no enums, no parameter properties, no namespaces), `verbatimModuleSyntax` (use
`import type` for type-only imports), `noUnusedLocals`, `noUnusedParameters`. `tsconfig.app.json` sets
`types: ["vite/client"]` only — there are no test globals, so tests import `describe/expect/it` from `vitest`
explicitly.

## Testing quirks

- Vitest runs in the **node** environment: no jsdom, no @testing-library. Component tests render with
  `renderToStaticMarkup` from `react-dom/server` inside `MemoryRouter` (see
  `frontend/src/components/MissionBriefingModal.test.tsx`).
- Tests are colocated as `*.test.ts(x)` next to the source they cover.
- Backend tests cover services, ML, and OpenCV only — there are no HTTP-level/integration tests, so API wiring
  changes must be checked by running the server.

## Data integrity rules (this repo's whole point)

- The catalog is **hand-curated reviewed metadata**. Do not regenerate it from NASA APIs (none are configured)
  or add records that are not covered by `Data resources.md`.
- Never claim NASA validation, hazard probability, or flight certification in UI copy or API responses.
  Backend payloads carry `notice` / `limitation` / `provenance` strings for exactly this — keep them.
- Verified downloadable datasets = **0**; the 73,909 "listed file entries" are inventory counts, not data.
- Numbers are pinned by tests: `frontend/src/data/ranking.test.ts` asserts 26 investigations and 73909 listed
  file entries; `backend/tests/test_services.py` asserts evidence coverage 65 and the ranking notice strings.
  Change the catalog and its tests together.

## Workflow

- Work on a feature branch and open a PR per change (branch from `main`).
- Adding dependencies is fine, but keep `frontend/pnpm-lock.yaml` and `backend/requirements.txt` in sync.
- `frontend/dist/`, `backend/.venv/`, and `backend/data/*.db` are gitignored — never commit them.
- `frontend/pnpm-workspace.yaml` only carries `minimumReleaseAgeExclude` entries for framer-motion/motion-dom;
  it is not a multi-package workspace.
