export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO 8601, KST
  category: string;
  tags: string[];
  content: string; // HTML
};
