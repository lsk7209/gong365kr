import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { isAuthorizedCronRequest } from "@/lib/http/cron-auth";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("Cron auth", () => {
  it("requires CRON_SECRET to be configured", () => {
    delete process.env.CRON_SECRET;

    assert.equal(
      isAuthorizedCronRequest(
        new Request("http://localhost:3000/api/cron/sync", {
          headers: { authorization: "Bearer test-secret" },
        }),
      ),
      false,
    );
  });

  it("rejects spoofable cron marker headers", () => {
    process.env.CRON_SECRET = "test-secret";

    assert.equal(
      isAuthorizedCronRequest(
        new Request("http://localhost:3000/api/cron/sync", {
          headers: { "x-vercel-cron": "1" },
        }),
      ),
      false,
    );
  });

  it("accepts the configured bearer token", () => {
    process.env.CRON_SECRET = "test-secret";

    assert.equal(
      isAuthorizedCronRequest(
        new Request("http://localhost:3000/api/cron/sync", {
          headers: { authorization: "Bearer test-secret" },
        }),
      ),
      true,
    );
  });
});
