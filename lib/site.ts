export const DEFAULT_SITE_URL = "https://gong365.kr";
export const DEFAULT_SITE_NAME = "창업머니맵";

export function getSiteUrl() {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL);
}

export function getSiteName() {
  return process.env.NEXT_PUBLIC_SITE_NAME ?? DEFAULT_SITE_NAME;
}

export function normalizeSiteUrl(url: string) {
  return url.replace(/\/+$/, "");
}
