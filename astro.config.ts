import fs from "node:fs";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";
import webmanifest from "astro-webmanifest";
import { defineConfig } from "astro/config";

import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeUnwrapImages from "rehype-unwrap-images";
// Remark plugins
import remarkDirective from "remark-directive";

import { remarkAdmonitions } from "./src/plugins/remark-admonitions";
import { remarkGithubCard } from "./src/plugins/remark-github-card";
import { remarkReadingTime } from "./src/plugins/remark-reading-time";
import {
  expressiveCodeOptions,
  siteConfig,
} from "./src/site.config"; /* Handle ::: directives as nodes */

// https://astro.build/config
export default defineConfig({
  site: siteConfig.url,
  image: {
    domains: [],
  },
  integrations: [
    expressiveCode(expressiveCodeOptions),
    icon(),
    sitemap(),
    mdx(),
    robotsTxt(),
    webmanifest({
      // See: https://github.com/alextim/astro-lib/blob/main/packages/astro-webmanifest/README.md
      name: siteConfig.title,
      description: "Xwbx's blog",
      lang: siteConfig.lang,
      icon: "public/icon.svg", // source for favicon & icons
      icons: [
        {
          src: "icons/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
        {
          src: "icons/icon-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "icons/icon-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      start_url: "/",
      background_color: "#1d1f21",
      theme_color: "#2bbc8a",
      display: "standalone",

      config: {
        insertFaviconLinks: false,
        insertThemeColorMeta: false,
        insertManifestLink: false,
      },
    }),
  ],
  markdown: {
    rehypePlugins: [
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        { behavior: "wrap", properties: { className: ["not-prose"] } },
      ],
      [
        rehypeExternalLinks,
        {
          rel: ["noreferrer", "noopener"],
          target: "_blank",
        },
      ],
      rehypeUnwrapImages,
    ],
    remarkPlugins: [
      remarkReadingTime,
      remarkDirective,
      remarkGithubCard,
      remarkAdmonitions,
    ],
    remarkRehype: {
      footnoteLabelProperties: {
        className: [""],
      },
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
    plugins: [tailwind(), rawFonts([".ttf", ".woff"])],
  },
});

function rawFonts(ext: string[]) {
  return {
    name: "vite-plugin-raw-fonts",
    // @ts-expect-error:next-line
    transform(_, id) {
      if (ext.some((e) => id.endsWith(e))) {
        const buffer = fs.readFileSync(id);
        return {
          code: `export default ${JSON.stringify(buffer)}`,
          map: null,
        };
      }
    },
  };
}
