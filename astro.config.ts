import fs from "node:fs";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";
import { defineConfig } from "astro/config";
// Remark plugins
import remarkDirective from "remark-directive";

import { expressiveCodeOptions } from "./src/site.config"; /* Handle ::: directives as nodes */
import remarkUnwrapImages from "remark-unwrap-images";
import { remarkAdmonitions } from "./src/plugins/remark-admonitions"; /* Add admonitions */
// Rehype plugins
import rehypeExternalLinks from "rehype-external-links";

import { remarkReadingTime } from "./src/plugins/remark-reading-time";

// https://astro.build/config
export default defineConfig({
  image: {
    domains: [],
  },
  integrations: [
    expressiveCode(expressiveCodeOptions),
    icon(),
    tailwind({
      applyBaseStyles: false,
      nesting: true,
    }),
    sitemap(),
    mdx(),
    robotsTxt(),
  ],
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          rel: ["nofollow, noopener, noreferrer"],
          target: "_blank",
        },
      ],
    ],
    remarkPlugins: [
      remarkUnwrapImages,
      remarkReadingTime,
      remarkDirective,
      remarkAdmonitions,
    ],
    remarkRehype: {
      footnoteLabelProperties: {
        className: [""],
      },
    },
  },
  // https://docs.astro.build/en/guides/prefetch/
  prefetch: true,
  // ! Please remember to replace the following site property with your own domain
  site: "https://astro-cactus.chriswilliams.dev/",
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
    plugins: [rawFonts([".ttf", ".woff"])],
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
