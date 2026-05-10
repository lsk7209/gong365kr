"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { trackCtaClicked, type GaTrackCategory } from "@/lib/analytics/gtag";

type TrackableButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  category?: GaTrackCategory;
  label?: string;
  eventParams?: Record<string, string | number | boolean | null>;
  trackingDisabled?: boolean;
};

export function TrackableButton({
  children,
  category = "cta_clicked",
  label,
  eventParams,
  trackingDisabled = false,
  onClick,
  ...buttonProps
}: TrackableButtonProps) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!trackingDisabled) {
      trackCtaClicked(label ?? "button", {
        event_category: category,
        ...(eventParams ?? {})
      });
    }

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button {...buttonProps} onClick={handleClick}>
      {children}
    </button>
  );
}

