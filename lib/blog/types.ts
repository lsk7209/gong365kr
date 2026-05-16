export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO 8601, KST
  category: string;
  tags: string[];
  researchSources?: BlogResearchSource[];
  qualityScore?: number;
  content: string; // HTML
};

export type BlogResearchSource = {
  title: string;
  url: string;
  publisher: string;
  checkedAt: string; // YYYY-MM-DD
};
