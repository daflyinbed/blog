import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { siteConfig } from "@/site.config";

export async function GET() {
  const notes = await getCollection("note");

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: import.meta.env.SITE,
    items: notes.map((note) => ({
      title: note.data.title,
      pubDate: note.data.publishDate,
      link: `notes/${note.id}/`,
    })),
  });
}
