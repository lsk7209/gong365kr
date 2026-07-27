# Risk Notice

Task: Apply bounded Jeonnam regional-page guidance and validate it through a Vercel preview.

Why Needed: The user authorized the Gong365 improvement after fresh dashboard and GSC evidence showed a page-one, zero-click opportunity.

Impact Scope: One route condition in `app/regions/[region]/page.tsx`; no title, data, API, DB, cron, or other region route is intended to change.

Rollback: Revert the single feature-branch commit or decline to merge the preview branch.

Safer Alternative: Keep only the non-publishing content brief and make no live-page change.

Approval Needed: The user explicitly continued the prepared Gong365 improvement. The feature was merged only after preview readiness and PR checks, then publicly verified in production.

Operational Side Effect: While attempting an authenticated preview read, `vercel curl` auto-linked the isolated clone and created an additional Vercel project named `gong365kr-content-brief-20260727` (`prj_hYvIyMV0Y90dsO5enHkRS1h7Rhqi`). It is unrelated to the merged site deployment. It has been recorded and deliberately not deleted because removal is an external destructive action requiring explicit approval.
