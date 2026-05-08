import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateProgramStatus, toUnixSeconds } from "@/lib/programs/status";

describe("Program status", () => {
  const now = new Date(Date.UTC(2026, 4, 8, 6));

  it("marks future programs as upcoming", () => {
    const status = calculateProgramStatus({
      applicationStart: new Date(Date.UTC(2026, 4, 9)),
      applicationEnd: new Date(Date.UTC(2026, 4, 20)),
      now
    });

    assert.equal(status, "upcoming");
  });

  it("keeps programs active through the application end date", () => {
    const status = calculateProgramStatus({
      applicationStart: new Date(Date.UTC(2026, 4, 1)),
      applicationEnd: new Date(Date.UTC(2026, 4, 8)),
      now
    });

    assert.equal(status, "active");
  });

  it("marks programs closed after the end date", () => {
    const status = calculateProgramStatus({
      applicationStart: new Date(Date.UTC(2026, 4, 1)),
      applicationEnd: new Date(Date.UTC(2026, 4, 7)),
      now
    });

    assert.equal(status, "closed");
  });

  it("converts dates to libsql timestamp seconds", () => {
    assert.equal(toUnixSeconds(new Date("1970-01-01T00:01:00.000Z")), 60);
  });
});
