"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { trackCtaClicked, type GaTrackCategory } from "@/lib/analytics/gtag";

type TrackableAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  category?: GaTrackCategory;
  label?: string;
  eventParams?: Record<string, string | number | boolean | null>;
  trackingDisabled?: boolean;
};

export function TrackableAnchor({
  children,
  category = "cta_clicked",
  label,
  eventParams,
  trackingDisabled = false,
  onClick,
  ...anchorProps
}: TrackableAnchorProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!trackingDisabled) {
      trackCtaClicked(label ?? anchorProps.href?.toString() ?? "anchor", {
        event_category: category,
        ...(eventParams ?? {})
      });
    }

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <a {...anchorProps} onClick={handleClick}>
      {children}
    </a>
  );
}
