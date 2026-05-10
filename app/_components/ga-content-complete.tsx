"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackContentReadComplete } from "@/lib/analytics/gtag";

type GaContentCompleteProps = {
  contentType: "program" | "event";
  title: string;
  id: string;
};

export function GaContentComplete({ contentType, title, id }: GaContentCompleteProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    trackContentReadComplete(contentType, title, {
      content_id: id,
      page_path: pathname,
      value: 1
    });
  }, [contentType, id, pathname, title]);

  return null;
}

