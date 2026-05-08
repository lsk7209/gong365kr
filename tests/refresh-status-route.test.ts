import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { GET } from "@/app/api/cron/refresh-status/route";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("Refresh status route", () => {
  it("rejects requests without the cron bearer token", async () => {
    process.env.CRON_SECRET = "test-secret";

    const response = await GET(new Request("http://localhost:3000/api/cron/refresh-status"));
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.deepEqual(body, { error: "unauthorized" });
  });

  it("returns missing env before touching the database", async () => {
    process.env.CRON_SECRET = "test-secret";
    delete process.env.TURSO_DATABASE_URL;

    const response = await GET(
      new Request("http://localhost:3000/api/cron/refresh-status", {
        headers: {
          authorization: "Bearer test-secret"
        }
      })
    );
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.error, "missing_runtime_env");
    assert.deepEqual(body.required, ["TURSO_DATABASE_URL"]);
  });
});
