"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import Link, { type LinkProps } from "next/link";
import { trackCtaClicked, type GaTrackCategory } from "@/lib/analytics/gtag";

type TrackableLinkProps = Omit<LinkProps, "href"> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: LinkProps["href"];
    children: ReactNode;
    category?: GaTrackCategory;
    label?: string;
    eventParams?: Record<string, string | number | boolean | null>;
    trackingDisabled?: boolean;
  };

export function TrackableLink({
  href,
  children,
  category = "cta_clicked",
  label,
  eventParams,
  trackingDisabled = false,
  ...linkProps
}: TrackableLinkProps) {
  const handleClick = () => {
    if (trackingDisabled) {
      return;
    }

    trackCtaClicked(label ?? String(typeof href === "string" ? href : "link"), {
      event_category: category,
      ...(eventParams ?? {}),
    });
  };

  return (
    <Link href={href} {...linkProps} onClick={handleClick}>
      {children}
    </Link>
  );
}
