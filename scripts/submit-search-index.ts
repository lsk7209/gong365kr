import { createHash } from "node:crypto";
import { hashSubmitFingerprint, submitSearchIndexNow } from "@/lib/search-submit";

async function main() {
  const results = await submitSearchIndexNow();

  for (const result of results) {
    console.log(`${result.target}: ${result.status} - ${result.detail}`);
  }

  if (results.some((result) => result.status === "failed")) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const fingerprint = createHash("sha256").update(error instanceof Error ? error.message : String(error)).digest("hex").slice(0, 8);
  const shortMessage = error instanceof Error ? error.message : String(error);
  const summary = hashSubmitFingerprint(shortMessage);
  console.error(`submit-search-index failed (${fingerprint}):`, error instanceof Error ? error.message : error);
  console.error(`submit-search-index summary: ${summary}`);
  process.exit(1);
});
