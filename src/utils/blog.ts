import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blogCollection">;

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateISO(date: string): string {
  return new Date(date).toISOString().split("T")[0];
}

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function sortBlogPostsByDate(posts: BlogPost[]): BlogPost[] {
  return posts.sort((a, b) => {
    const dateA = new Date(a.data.publishedDate);
    const dateB = new Date(b.data.publishedDate);
    return dateB.getTime() - dateA.getTime();
  });
}

export function getFeaturedPost(posts: BlogPost[]): BlogPost | null {
  const publishedFeaturedPosts = posts.filter(
    (post) => post.data.featured && !post.data.draft,
  );

  if (publishedFeaturedPosts.length === 0) return null;

  return sortBlogPostsByDate(publishedFeaturedPosts)[0];
}

export function getRecentPosts(
  posts: BlogPost[],
  limit: number = 6,
): BlogPost[] {
  const publishedPosts = posts.filter((post) => !post.data.draft);
  return sortBlogPostsByDate(publishedPosts).slice(0, limit);
}

export function getAllPublishedPosts(posts: BlogPost[]): BlogPost[] {
  const publishedPosts = posts.filter((post) => !post.data.draft);
  return sortBlogPostsByDate(publishedPosts);
}
