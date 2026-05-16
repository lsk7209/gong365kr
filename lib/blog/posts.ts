import type { BlogPost } from "./types";
import { BATCH_01 } from "./batches/batch-01";
import { BATCH_02 } from "./batches/batch-02";
import { BATCH_03 } from "./batches/batch-03";
import { BATCH_04 } from "./batches/batch-04";
import { BATCH_05 } from "./batches/batch-05";
import { BATCH_06 } from "./batches/batch-06";
import { BATCH_07 } from "./batches/batch-07";
import { BATCH_08 } from "./batches/batch-08";

export const BLOG_POSTS: BlogPost[] = [
  ...BATCH_01,
  ...BATCH_02,
  ...BATCH_03,
  ...BATCH_04,
  ...BATCH_05,
  ...BATCH_06,
  ...BATCH_07,
  ...BATCH_08,
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
