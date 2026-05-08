import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractPdfLinks } from "@/lib/bizinfo/detail";

describe("PDF link extraction", () => {
  it("extracts absolute, relative, and encoded PDF links", () => {
    const links = extractPdfLinks(
      `
        <a href="/files/notice.pdf">공고문</a>
        <a href='https://example.com/docs/form.PDF?download=1'>양식</a>
        <a href="/common/fileDown.do?fileId=123&amp;seq=1">첨부파일</a>
        <a href="/page/not-pdf">상세</a>
      `,
      "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_1"
    );

    assert.deepEqual(links, [
      "https://www.bizinfo.go.kr/files/notice.pdf",
      "https://example.com/docs/form.PDF?download=1",
      "https://www.bizinfo.go.kr/common/fileDown.do?fileId=123&seq=1"
    ]);
  });

  it("deduplicates normalized links", () => {
    const links = extractPdfLinks(
      `
        <a href="/files/notice.pdf">공고문</a>
        <a href="https://www.bizinfo.go.kr/files/notice.pdf">공고문</a>
      `,
      "https://www.bizinfo.go.kr/detail"
    );

    assert.deepEqual(links, ["https://www.bizinfo.go.kr/files/notice.pdf"]);
  });
});
