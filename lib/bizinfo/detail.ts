import { retryFetch } from "@/lib/http/retry-fetch";

const PDF_LINK_PATTERN = /href\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi;

export async function fetchBizinfoDetailHtml(url: string) {
  const response = await retryFetch(url, {
    headers: {
      accept: "text/html"
    },
    next: {
      revalidate: 0
    }
  });

  if (!response.ok) {
    throw new Error(`기업마당 상세 페이지 호출 실패: ${response.status}`);
  }

  return response.text();
}

export function extractPdfLinks(html: string, baseUrl: string) {
  const links = new Set<string>();

  for (const match of html.matchAll(PDF_LINK_PATTERN)) {
    const href = decodeHtmlEntity(match[1] ?? match[2] ?? match[3] ?? "").trim();

    if (!href || !isPdfLikeLink(href)) {
      continue;
    }

    links.add(normalizeUrl(href, baseUrl));
  }

  return [...links];
}

export async function fetchPdfBuffer(url: string) {
  const response = await retryFetch(url, {
    headers: {
      accept: "application/pdf"
    },
    next: {
      revalidate: 0
    }
  });

  if (!response.ok) {
    throw new Error(`PDF 다운로드 실패: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function isPdfLikeLink(href: string) {
  const lower = href.toLowerCase();

  return lower.includes(".pdf") || lower.includes("filedown") || lower.includes("download");
}

function normalizeUrl(href: string, baseUrl: string) {
  return new URL(href, baseUrl).toString();
}

function decodeHtmlEntity(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}
