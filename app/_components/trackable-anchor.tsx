"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import {
  trackCtaClicked,
  trackEvent,
  type GaTrackCategory,
} from "@/lib/analytics/gtag";

type TrackableAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  category?: GaTrackCategory;
  label?: string;
  eventName?: string;
  eventParams?: Record<string, string | number | boolean | null>;
  trackingDisabled?: boolean;
};

export function TrackableAnchor({
  children,
  category = "cta_clicked",
  label,
  eventName,
  eventParams,
  trackingDisabled = false,
  onClick,
  ...anchorProps
}: TrackableAnchorProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!trackingDisabled) {
      const target = label ?? anchorProps.href?.toString() ?? "anchor";
      if (eventName) {
        trackEvent(eventName, { event_label: target, ...(eventParams ?? {}) });
      } else {
        trackCtaClicked(target, {
          event_category: category,
          ...(eventParams ?? {}),
        });
      }
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
