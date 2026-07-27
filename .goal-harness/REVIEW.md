# Review

## Scope Review

- The application diff is limited to `app/regions/[region]/page.tsx`.
- The new block is gated by `regionRow.code === "jeonnam"`.
- Metadata, canonical, program queries, filters, cron routes, data schema, and all non-Jeonnam copy remain untouched.

## Content Safety Review

- Copy explains a verification sequence and directs readers to official notices.
- It does not promise eligibility, grant amount, selection, or deadline accuracy.
- Two questions are answered conditionally rather than turning general guidance into factual eligibility advice.

## Regression Review

- Lint, type-check, 37 tests, production build, and local two-route smoke pass.
- Preview deployment remains required before merge.
