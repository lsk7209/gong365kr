# GOAL

## Final Deliverable

Strengthen the Gong365 Jeonnam regional support-program page with evidence-bounded guidance and verify via preview deployment.

## User Value

Readers of the Jeonnam regional page can quickly decide whether a listed program is worth opening, then verify eligibility and deadlines in the official notice without relying on unsupported summaries.

## Required Features

- Add a Jeonnam-only three-step application-check guide ahead of the program list.
- Add two Jeonnam-specific FAQ answers that preserve the official-notice boundary.
- Preserve existing title, canonical, program queries, filtering, and all other regional pages.

## Non-Goals

- No title rewrite, claim about eligibility, funding amount, selection likelihood, or deadline.
- No database, cron, API, sitemap, IndexNow, AdSense, or search-console mutation.
- No change to non-Jeonnam regional page copy.

## Done Conditions

- The Jeonnam page renders the added guide and FAQ content without affecting other region routes.
- Lint, type-check, tests, build, local route smoke, and Vercel preview validation pass.
- A reversible feature-branch commit and preview deployment are recorded.

## User-Visible Result

The Jeonnam page gives readers a short, concrete sequence for checking recruitment status, regional/eligibility conditions, and official notice documents before applying.
