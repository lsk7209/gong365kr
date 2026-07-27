# TESTS

## Required Checks

- Run/start: `pnpm exec next start -p 3001` against the built app.
- Lint: `pnpm lint`.
- Typecheck: `pnpm type-check`.
- Unit tests: `pnpm test`.
- Build: `pnpm exec next build` (bypasses the package postbuild search-submission hook).
- Smoke test: request `/regions/jeonnam` and `/regions/chungbuk` from the local production server.
- Domain-specific validation: Jeonnam guide is present, Chungbuk is unaffected, and Jeonnam canonical markup remains present.

## Error And Edge Cases

- The first local server launch used an invalid `next start` argument shape and failed before serving traffic. It was corrected to `pnpm exec next start -p 3001`; no source change was needed.

## User Scenario Tests

- A Jeonnam reader sees the three-step guide and two bounded FAQ answers before the program list.
- A Chungbuk reader does not see Jeonnam-specific guidance.

## Completion Checklist

- [x] Available local checks have been run.
- [x] The failed server invocation was corrected and documented.
- [ ] Preview acceptance criteria have matching evidence.
