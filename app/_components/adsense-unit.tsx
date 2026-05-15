"use client";

import { useEffect } from "react";

type AdFormat = "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";

type AdsenseUnitProps = {
  adSlot: string;
  adFormat?: AdFormat;
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdsenseUnit({
  adSlot,
  adFormat = "auto",
  className,
}: AdsenseUnitProps) {
  const approved = process.env.NEXT_PUBLIC_ADSENSE_APPROVED === "true";
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

  useEffect(() => {
    if (!approved || !pubId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not ready
    }
  }, [approved, pubId]);

  if (!approved || !pubId) return null;

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={pubId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
