import type { BlogPost } from "./types";
import { BATCH_01 } from "./batches/batch-01";
import { BATCH_02 } from "./batches/batch-02";
import { BATCH_03 } from "./batches/batch-03";
import { BATCH_04 } from "./batches/batch-04";
import { BATCH_05 } from "./batches/batch-05";
import { BATCH_06 } from "./batches/batch-06";
import { BATCH_07 } from "./batches/batch-07";
import { BATCH_08 } from "./batches/batch-08";
import { BATCH_09 } from "./batches/batch-09";
import { BATCH_10 } from "./batches/batch-10";
import { BATCH_11 } from "./batches/batch-11";
import { BATCH_12 } from "./batches/batch-12";
import { BATCH_13 } from "./batches/batch-13";
import { BATCH_14 } from "./batches/batch-14";
import { BATCH_15 } from "./batches/batch-15";
import { BATCH_16 } from "./batches/batch-16";

export const BLOG_POSTS: BlogPost[] = [
  ...BATCH_01,
  ...BATCH_02,
  ...BATCH_03,
  ...BATCH_04,
  ...BATCH_05,
  ...BATCH_06,
  ...BATCH_07,
  ...BATCH_08,
  ...BATCH_09,
  ...BATCH_10,
  ...BATCH_11,
  ...BATCH_12,
  ...BATCH_13,
  ...BATCH_14,
  ...BATCH_15,
  ...BATCH_16,
];

export function getPublishedBlogPosts(referenceDate = new Date()): BlogPost[] {
  return BLOG_POSTS.filter((post) => isBlogPostPublished(post, referenceDate));
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getPublishedBlogPost(
  slug: string,
  referenceDate = new Date(),
): BlogPost | undefined {
  const post = getBlogPost(slug);
  return post && isBlogPostPublished(post, referenceDate) ? post : undefined;
}

export function getPublishedBlogSlugs(referenceDate = new Date()): string[] {
  return getPublishedBlogPosts(referenceDate).map((p) => p.slug);
}

export function isBlogPostPublished(
  post: BlogPost,
  referenceDate = new Date(),
) {
  return new Date(post.publishedAt).getTime() <= referenceDate.getTime();
}
