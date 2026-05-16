import type { BlogPost } from "./types";
import { BATCH_01 } from "./batches/batch-01";
import { BATCH_02 } from "./batches/batch-02";

export const BLOG_POSTS: BlogPost[] = [...BATCH_01, ...BATCH_02];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
