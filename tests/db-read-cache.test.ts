import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isMissingIncrementalCacheError } from "@/lib/db-read-cache";

describe("DB read cache", () => {
  it("recognizes Next incremental cache runtime misses", () => {
    assert.equal(
      isMissingIncrementalCacheError(
        new Error("Invariant: incrementalCache missing in unstable_cache async()=>..."),
      ),
      true,
    );
    assert.equal(isMissingIncrementalCacheError(new Error("database failed")), false);
  });
});
