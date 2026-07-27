# EVIDENCE

## Validation Level

Level: 5 production deployment and public-route smoke.

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
| GitHub PR #7 checks | PASS | Vercel, Vercel Preview Comments, and Hosting Cost Guard succeeded; merge state was CLEAN. |
| Vercel preview `dpl_GXtBouZP8uR9VmAXpm4g7ugPiifH` | PASS | Deployment Ready. Direct anonymous body smoke was unavailable because Vercel Login protection applied. |
| Production deploy `dpl_A8vWbbBkMaA3Bn5rkxKHzPEKNHRU` | PASS | Deployment Ready after PR #7 merge commit `949fca4d979f8f8bfcb69aba616afa7acfec50bc`. |
| Public production HTTP smoke | PASS | Jeonnam: HTTP 200, guide and canonical present. Chungbuk: HTTP 200, Jeonnam guide absent. |

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

- Feature commit `cc88a9e` was merged through PR #7, not pushed directly to `main`.
- Preview deployment was Ready; production was then independently verified from the public canonical domain.
