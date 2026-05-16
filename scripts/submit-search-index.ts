import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { hashSubmitFingerprint, submitSearchIndexNow } from "@/lib/search-submit";

loadLocalEnvFiles();

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

function loadLocalEnvFiles() {
  for (const fileName of [".env.local", ".env.production.local", ".env"]) {
    const filePath = join(process.cwd(), fileName);

    if (!existsSync(filePath)) {
      continue;
    }

    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match || process.env[match[1]] !== undefined) {
        continue;
      }

      process.env[match[1]] = normalizeEnvValue(match[2]);
    }
  }
}

function normalizeEnvValue(value: string) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).replaceAll("\\n", "\n");
  }

  return trimmed;
}
