import { getCollection } from "astro:content";

export async function calculateBlogStats() {
  const allPosts = await getCollection("blogCollection");
  const publishedPosts = allPosts.filter((post) => !post.data.draft);
  const totalPosts = publishedPosts.length;

  let totalWords = 0;
  let totalReadTimeMinutes = 0;

  for (const post of publishedPosts) {
    const { body } = post;

    if (!body) continue;

    const wordCount = body
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    totalWords += wordCount;

    const readTimeMinutes = Math.ceil(wordCount / 200);
    totalReadTimeMinutes += readTimeMinutes;
  }

  const hours = Math.floor(totalReadTimeMinutes / 60);
  const minutes = totalReadTimeMinutes % 60;

  let totalReadTime: string;
  if (hours > 0) {
    totalReadTime = `${hours}h ${minutes}m`;
  } else {
    totalReadTime = `${minutes}m`;
  }

  return {
    totalPosts,
    totalWords,
    totalReadTime,
  };
}
