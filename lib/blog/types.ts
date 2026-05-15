export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // YYYY-MM-DD
  category: string;
  tags: string[];
  content: string; // HTML
};
