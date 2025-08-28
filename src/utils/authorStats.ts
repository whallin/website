import { getCollection } from "astro:content";

export interface AuthorStats {
  totalAuthors: number;
  topContributor: string;
}

export async function calculateAuthorStats(): Promise<AuthorStats> {
  const allAuthors = await getCollection("authorCollection");
  const totalAuthors = allAuthors.length;
  const allPosts = await getCollection("blogCollection");
  const publishedPosts = allPosts.filter((post) => !post.data.draft);
  const contributionCounts = new Map<string, number>();

  for (const post of publishedPosts) {
    for (const author of post.data.author) {
      const authorId = author.id;
      const currentCount = contributionCounts.get(authorId) || 0;
      contributionCounts.set(authorId, currentCount + 1);
    }
  }

  let topContributor = "No posts yet";
  let maxContributions = 0;

  for (const [authorId, count] of contributionCounts.entries()) {
    if (count > maxContributions) {
      maxContributions = count;
      const author = allAuthors.find((a) => a.id === authorId);
      if (author) {
        topContributor = author.data.name;
      }
    }
  }

  return {
    totalAuthors,
    topContributor,
  };
}
