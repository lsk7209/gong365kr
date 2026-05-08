import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { retryFetch } from "@/lib/http/retry-fetch";

describe("retryFetch", () => {
  it("retries transient fetch failures", async () => {
    let calls = 0;
    const response = await retryFetch(
      "https://example.com",
      undefined,
      {
        retryDelayMs: 0,
        fetcher: async () => {
          calls += 1;

          if (calls < 3) {
            throw new TypeError("fetch failed");
          }

          return new Response("ok", { status: 200 });
        }
      }
    );

    assert.equal(calls, 3);
    assert.equal(response.status, 200);
  });

  it("retries 5xx responses", async () => {
    let calls = 0;
    const response = await retryFetch(
      "https://example.com",
      undefined,
      {
        retryDelayMs: 0,
        fetcher: async () => {
          calls += 1;

          return new Response("body", { status: calls === 1 ? 502 : 200 });
        }
      }
    );

    assert.equal(calls, 2);
    assert.equal(response.status, 200);
  });

  it("does not retry 4xx responses", async () => {
    let calls = 0;
    const response = await retryFetch(
      "https://example.com",
      undefined,
      {
        retryDelayMs: 0,
        fetcher: async () => {
          calls += 1;

          return new Response("unauthorized", { status: 401 });
        }
      }
    );

    assert.equal(calls, 1);
    assert.equal(response.status, 401);
  });
});
