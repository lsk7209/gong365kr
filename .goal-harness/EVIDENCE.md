# EVIDENCE

## Validation Level

Level: 4 local production smoke; Level 5 preview validation pending.

## Commands Run

| Command | Result | Notes |
|---|---|---|
| harness-init.py | PASS | size=medium, domain=seo-content-batch, created=2026-07-27T23:22:48+09:00 |
| `pnpm install --frozen-lockfile` | PASS | Restored clone dependencies from the lockfile; no lockfile change. |
| `pnpm lint` | PASS | No warnings. |
| `pnpm type-check` | PASS | No TypeScript errors. |
| `pnpm test` | PASS | 37 tests passed. |
| `pnpm exec next build` | PASS | Production build passed without invoking the search-submission postbuild hook. |
| Local HTTP smoke | PASS | Jeonnam 200 with guide/canonical; Chungbuk 200 without Jeonnam guide. |

## Test Results

| Test | Result | Notes |
|---|---|---|
| Jeonnam-only rendering | PASS | `전남 지원사업 공고, 신청 전 3가지만 확인하세요` present only on `/regions/jeonnam`. |
| Metadata/data query preservation | PASS | Source diff changes no metadata or data-query code; local Jeonnam response includes canonical markup. |

## Failed Checks

- First local server invocation failed because `--` caused `-p` to be parsed as the project directory. Corrected command: `pnpm exec next start -p 3001`.

## Fixes Applied

- Added `node_modules` from the existing frozen lockfile so standard checks can run in the isolated clone.
- Corrected only the local smoke command; no application source recovery was required.

## Completion Evidence

- Feature branch and Vercel preview evidence pending.
