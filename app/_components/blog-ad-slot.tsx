import { AdsenseUnit } from "@/app/_components/adsense-unit";

type BlogAdPosition = "top" | "middle" | "bottom";

const blogAdSlots: Record<BlogAdPosition, string | undefined> = {
  top: process.env.NEXT_PUBLIC_ADSENSE_BLOG_TOP_SLOT,
  middle: process.env.NEXT_PUBLIC_ADSENSE_BLOG_MIDDLE_SLOT,
  bottom: process.env.NEXT_PUBLIC_ADSENSE_BLOG_BOTTOM_SLOT,
};

type BlogAdSlotProps = {
  position: BlogAdPosition;
};

export function BlogAdSlot({ position }: BlogAdSlotProps) {
  const slot = blogAdSlots[position];

  if (!slot) {
    return null;
  }

  return (
    <section aria-label="광고" className="my-8">
      <AdsenseUnit adSlot={slot} className="min-h-24 w-full" />
    </section>
  );
}
