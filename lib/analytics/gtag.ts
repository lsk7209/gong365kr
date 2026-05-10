export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? null;

type GaParams = Record<string, string | number | boolean | null | undefined>;

type GaEventParams = GaParams & {
  event_category?: string;
  event_label?: string;
  value?: number;
};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: [string, ...unknown[]]) => void;
  }
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function isGaReady() {
  return Boolean(GA_MEASUREMENT_ID && isBrowser());
}

export function trackEvent(name: string, params?: GaEventParams) {
  if (!isBrowser()) {
    return;
  }

  const cleanParams = sanitizeParams(params);

  if (typeof window.gtag === "function") {
    window.gtag("event", name, cleanParams);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: name,
      ...cleanParams
    });
  }
}

export function trackPageView(path: string) {
  if (!isBrowser() || !GA_MEASUREMENT_ID) {
    return;
  }

  trackEvent("page_view", {
    page_path: path,
    event_category: "navigation",
    event_label: "page_view"
  });
}

function sanitizeParams(params?: GaParams) {
  if (!params) {
    return {};
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    result[key] = value;
  }

  return result;
}

export type GaTrackCategory = "tool_used" | "cta_clicked" | "content_read_complete" | "lead_captured";

export function trackToolUsed(tool: string, detail?: GaEventParams) {
  trackEvent("tool_used", {
    event_category: "tool",
    event_label: tool,
    ...detail
  });
}

export function trackCtaClicked(target: string, detail?: GaEventParams) {
  trackEvent("cta_clicked", {
    event_category: "cta",
    event_label: target,
    ...detail
  });
}

export function trackContentReadComplete(contentType: string, title: string, detail?: GaEventParams) {
  trackEvent("content_read_complete", {
    event_category: "content",
    event_label: `${contentType}:${title}`,
    ...detail
  });
}

export function trackLeadCaptured(leadType: string, detail?: GaEventParams) {
  trackEvent("lead_captured", {
    event_category: "lead",
    event_label: leadType,
    ...detail
  });
}

