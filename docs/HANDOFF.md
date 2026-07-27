# Handoff

## Jeonnam regional-page guidance live (2026-07-27 KST)

User goal: improve the fresh GSC opportunity on Gong365 without publishing unsupported claims or changing site-wide SEO/data behavior.

Current state: complete. PR #7 merged feature commit `cc88a9e` into `main` as merge commit `949fca4d979f8f8bfcb69aba616afa7acfec50bc`.

Changed application file: `app/regions/[region]/page.tsx`. The new guidance and two verification questions render only when `regionRow.code === "jeonnam"`. Titles, metadata, canonical generation, program queries, filters, API/DB/cron paths, and other regional pages were not changed.

Validation evidence:

- `pnpm lint`, `pnpm type-check`, `pnpm test` (37 tests), and `pnpm exec next build` passed.
- Local production smoke: Jeonnam returned 200 with the guide and canonical; Chungbuk returned 200 without Jeonnam-specific copy.
- PR #7 checks (Vercel, Vercel Preview Comments, Hosting Cost Guard) passed; preview `dpl_GXtBouZP8uR9VmAXpm4g7ugPiifH` was Ready.
- Production deployment `dpl_A8vWbbBkMaA3Bn5rkxKHzPEKNHRU` was Ready. Public production smoke on `https://gong365.kr/regions/jeonnam?contentRefresh=20260727` returned 200 with the guide/canonical; Chungbuk returned 200 without the guide.

Known limitation: the preview body was protected by Vercel Login, so its body was not anonymously inspected. Production was publicly inspected instead.

Side effect: `vercel curl` auto-linked the isolated clone and created a separate Vercel project, `gong365kr-content-brief-20260727` (`prj_hYvIyMV0Y90dsO5enHkRS1h7Rhqi`). It is unrelated to the merged deployment and was not deleted; removal requires explicit approval.

Rollback: revert merge commit `949fca4d979f8f8bfcb69aba616afa7acfec50bc` through a PR, or use the known-good previous Vercel deployment.

Deliberately not run: no DB writes, API backfill, sitemap submission, search-index submission, cron execution, or content publishing job beyond the version-controlled site deployment.

Next step: on 2026-08-10, inspect fresh GSC page/query data for `/regions/jeonnam`; decide on any new change only from that evidence.
