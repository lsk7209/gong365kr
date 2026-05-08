import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { GET } from "@/app/api/cron/generate-meta/route";
import { processProgramMetaBatch, type MetaPipelineDeps } from "@/lib/programs/meta-pipeline";
import type { PendingMetaProgram, ProgramMetaExtractionInput } from "@/lib/programs/repository";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("Generate meta route", () => {
  it("rejects requests without the cron bearer token", async () => {
    process.env.CRON_SECRET = "test-secret";

    const response = await GET(new Request("http://localhost:3000/api/cron/generate-meta"));
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.deepEqual(body, { error: "unauthorized" });
  });

  it("returns missing env before touching the database", async () => {
    process.env.CRON_SECRET = "test-secret";
    delete process.env.TURSO_DATABASE_URL;

    const response = await GET(
      new Request("http://localhost:3000/api/cron/generate-meta", {
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

describe("Program meta pipeline", () => {
  it("extracts a PDF link, parses text, and saves meta extraction", async () => {
    const saved: ProgramMetaExtractionInput[] = [];
    const deps = createDeps({
      saveMetaExtraction: async (input) => {
        saved.push(input);
      }
    });

    const summary = await processProgramMetaBatch([createProgram()], deps, new Date("2026-05-08T00:00:00Z"));

    assert.equal(summary.processed, 1);
    assert.equal(summary.skipped, 0);
    assert.equal(summary.failed, 0);
    assert.equal(summary.results[0].detailPdfUrl, "https://www.bizinfo.go.kr/files/notice.pdf");
    assert.equal(summary.results[0].extractedTextLength, 6);
    assert.deepEqual(saved, [
      {
        programId: 1,
        detailPdfUrl: "https://www.bizinfo.go.kr/files/notice.pdf",
        updatedAt: new Date("2026-05-08T00:00:00Z")
      }
    ]);
  });

  it("skips programs when the detail page has no PDF link", async () => {
    const deps = createDeps({
      extractPdfLinks: () => []
    });

    const summary = await processProgramMetaBatch([createProgram()], deps);

    assert.equal(summary.processed, 0);
    assert.equal(summary.skipped, 1);
    assert.equal(summary.results[0].reason, "no_pdf_link");
  });

  it("keeps processing failures isolated to each program", async () => {
    const deps = createDeps({
      fetchDetailHtml: async () => {
        throw new Error("detail failed");
      }
    });

    const summary = await processProgramMetaBatch([createProgram()], deps);

    assert.equal(summary.processed, 0);
    assert.equal(summary.failed, 1);
    assert.equal(summary.results[0].reason, "detail failed");
  });

  it("tries the next PDF candidate when the first candidate cannot be parsed", async () => {
    const saved: ProgramMetaExtractionInput[] = [];
    const deps = createDeps({
      extractPdfLinks: () => ["https://www.bizinfo.go.kr/files/form.hwpx", "https://www.bizinfo.go.kr/files/notice.pdf"],
      extractPdfText: async (buffer) => {
        if (buffer.toString() === "bad") {
          throw new Error("Invalid PDF structure.");
        }

        return { text: "정상 PDF 본문" };
      },
      fetchPdfBuffer: async (url) => Buffer.from(url.endsWith(".hwpx") ? "bad" : "good"),
      saveMetaExtraction: async (input) => {
        saved.push(input);
      }
    });

    const summary = await processProgramMetaBatch([createProgram()], deps, new Date("2026-05-08T00:00:00Z"));

    assert.equal(summary.processed, 1);
    assert.equal(summary.results[0].detailPdfUrl, "https://www.bizinfo.go.kr/files/notice.pdf");
    assert.deepEqual(saved.map((item) => item.detailPdfUrl), ["https://www.bizinfo.go.kr/files/notice.pdf"]);
  });
});

function createProgram(): PendingMetaProgram {
  return {
    id: 1,
    title: "테스트 지원사업",
    summaryShort: null,
    rawUrl: "https://www.bizinfo.go.kr/detail",
    detailPdfUrl: null
  };
}

function createDeps(overrides: Partial<MetaPipelineDeps> = {}): MetaPipelineDeps {
  return {
    fetchDetailHtml: async () => '<a href="/files/notice.pdf">공고문</a>',
    extractPdfLinks: (_html, baseUrl) => [new URL("/files/notice.pdf", baseUrl).toString()],
    fetchPdfBuffer: async () => Buffer.from("pdf"),
    extractPdfText: async () => ({ text: "본문 텍스트" }),
    saveMetaExtraction: async () => undefined,
    ...overrides
  };
}
