import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractBizinfoItems } from "@/lib/bizinfo/client";
import { normalizeBizinfoEventItem, parseBizinfoPeriod } from "@/lib/bizinfo/event-normalize";
import { normalizeBizinfoItem, parseApplicationPeriod } from "@/lib/bizinfo/normalize";
import { calculateProgramStatus } from "@/lib/programs/status";

describe("Bizinfo parser", () => {
  it("extracts jsonArray.item payloads", () => {
    const items = extractBizinfoItems({
      jsonArray: {
        item: [{ pblancId: "PBLN_1" }, { pblancId: "PBLN_2" }]
      }
    });

    assert.equal(items.length, 2);
  });

  it("normalizes mixed official/RSS fields", () => {
    const now = new Date(Date.UTC(2026, 4, 8));
    const program = normalizeBizinfoItem(
      {
        seq: "PBLN_0001",
        title: "예비창업패키지 창업사업화 지원",
        description: "<p>예비창업자 사업화 지원</p>",
        author: "중소벤처기업부",
        lcategory: "창업",
        reqstDt: "2026-04-28 ~ 2026-05-22",
        pubDate: "2026-04-20"
      },
      now
    );

    assert.ok(program);
    assert.equal(program.pblancId, "PBLN_0001");
    assert.equal(program.source, "bizinfo");
    assert.equal(program.status, "active");
    assert.equal(program.agency, "중소벤처기업부");
    assert.equal(program.summaryShort, "예비창업자 사업화 지원");
    assert.match(program.slug, /^changup-yebi-changup-changup-package-support-program-2026-pbln-0001$/);
  });

  it("parses application period and status", () => {
    const period = parseApplicationPeriod("2026.04.28 ~ 2026.05.22");
    const now = new Date(Date.UTC(2026, 4, 23));

    assert.equal(period.start?.toISOString(), "2026-04-28T00:00:00.000Z");
    assert.equal(period.end?.toISOString(), "2026-05-22T00:00:00.000Z");
    assert.equal(
      calculateProgramStatus({
        applicationStart: period.start,
        applicationEnd: period.end,
        now
      }),
      "closed"
    );
  });

  it("normalizes event API fields", () => {
    const now = new Date(Date.UTC(2026, 4, 8));
    const event = normalizeBizinfoEventItem(
      {
        seq: "EVEN_0001",
        title: "[Seoul] Startup seminar",
        areaNm: "서울",
        eventType: "세미나",
        description: "<p>Startup education event</p>",
        originOrg: "Seoul Startup Center",
        rceptPd: "2026-05-01 ~ 2026-05-20",
        eventPeriod: "20260521 ~ 20260521",
        bizinfoUrl: "https://www.bizinfo.go.kr/event",
        registDe: "20260501"
      },
      now
    );

    assert.ok(event);
    assert.equal(event.eventInfoId, "EVEN_0001");
    assert.equal(event.source, "bizinfo");
    assert.equal(event.status, "upcoming");
    assert.equal(event.areaName, "서울");
    assert.equal(event.summaryShort, "Startup education event");
    assert.equal(event.eventStart?.toISOString(), "2026-05-21T00:00:00.000Z");
    assert.match(event.slug, /^seminar-seoul-startup-seminar-2026-even-0001$/);
  });

  it("parses compact event periods", () => {
    const period = parseBizinfoPeriod("20260521 ~ 20260522");

    assert.equal(period.start?.toISOString(), "2026-05-21T00:00:00.000Z");
    assert.equal(period.end?.toISOString(), "2026-05-22T00:00:00.000Z");
  });
});
