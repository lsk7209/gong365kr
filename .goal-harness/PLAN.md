# PLAN

## Classification

- Size: medium
- Domain Profile: seo-content-batch

## Phase 1

- Objective: Lock evidence, scope, and deployment risk before editing.
- Tasks: Confirm clean clone, create risk notice, preserve the non-publishing content brief, and identify the Jeonnam-only render boundary.
- Expected Files: `.goal-harness/*`, `docs/gong365-regional-content-brief-2026-07-27.md`, `app/regions/[region]/page.tsx`.
- Completion Criteria: No claim exceeds the public source/brief evidence and no other regional route is in scope.
- Test Point: Git status and source inspection.
- Rollback/Recovery: Delete the feature branch or revert its single commit; the source checkout remains untouched.

## Phase 2

- Objective: Implement the smallest Jeonnam-only guidance addition.
- Tasks: Add the decision guide and two bounded FAQs behind the `jeonnam` route condition.
- Expected Files: `app/regions/[region]/page.tsx`.
- Completion Criteria: Existing title/canonical/program-list behavior remains unchanged.
- Test Point: Targeted source review and project checks.
- Rollback/Recovery: Revert the feature commit.

## Phase 3

- Objective: Validate and deliver through the required preview path.
- Tasks: Run lint, type-check, tests, build, local Jeonnam/another-region smoke, push feature branch, and inspect Vercel preview.
- Expected Files: `.goal-harness/EVIDENCE.md`, `.goal-harness/ACCEPTANCE.md`, `.goal-harness/REVIEW.md`.
- Completion Criteria: All applicable acceptance criteria pass; no production branch is directly pushed.
- Test Point: Command output, HTTP checks, and Vercel preview status.
- Rollback/Recovery: Do not merge preview if a criterion fails; remove feature branch only after recorded evidence.
