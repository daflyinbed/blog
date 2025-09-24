# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Astro Cactus**, a personal blog website built with Astro framework. It features a modern, content-focused blog with support for posts, notes, and tags, with dark/light theme support.

## Essential Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Development server at localhost:3000
pnpm dev

# Production build to ./dist/
pnpm build

# Generate search index after build
pnpm postbuild

# Preview production build locally
pnpm preview

# Generate types from content config
pnpm sync

# Code quality
pnpm format       # Prettier formatting
pnpm check        # Astro type checking
pnpm lint         # ESLint
pnpm lint:fix     # ESLint with auto-fix

# Deploy to Aliyun OSS
pnpm deploy
```

## Architecture & Code Organization

### Content Structure

- **Posts** (`src/content/post/`) - Full blog articles with tags, cover images, reading time
- **Notes** (`src/content/note/`) - Shorter form content with simpler frontmatter
- **Tags** (`src/content/tag/`) - Custom tag pages that override generated tag pages
- **Draft Support** - Posts marked as `draft: true` are excluded from production builds

### Key Directories

```
src/
├── components/     # Reusable Astro components organized by feature
│   ├── blog/      # Blog-specific components (Masthead, PostPreview, etc.)
│   ├── note/      # Note-specific components
│   └── layout/    # Layout components (Header, Footer, etc.)
├── content/       # Content collections with type-safe schemas
├── layouts/       # Page layouts (Base, BlogPost, etc.)
├── pages/         # File-based routing with dynamic [...slug] routes
├── plugins/       # Custom remark/rehype plugins (admonitions, reading time)
├── styles/        # Global CSS and Tailwind configuration
└── utils/         # Utility functions for dates, slugs, etc.
```

### Content Schema Validation

Content collections use Zod schemas defined in `src/content.config.ts`:

- **Post Schema**: title, description, publishDate, updatedDate, tags, coverImage, ogImage, draft
- **Note Schema**: title, description, publishDate (simpler than posts)
- **Tag Schema**: title, description (for custom tag pages)

### Key Configuration Files

- `src/site.config.ts` - Site metadata, menu links, Expressive Code options
- `astro.config.ts` - Astro integrations, markdown plugins, Vite config
- `tailwind.config.ts` - Tailwind CSS customization
- `src/content.config.ts` - Content collection schemas

## Important Development Patterns

### Content Schema Details

**Post Schema** (`src/content.config.ts`):

- `title` (required), `description` (required)
- `publishDate` (ISO 8601 format with timezone)
- `updatedDate` (optional, same format)
- `tags` (array of strings, optional)
- `coverImage` (optional, relative path from `/src/assets/images/`)
- `ogImage` (optional, for social sharing)
- `draft` (boolean, excludes from production)
- `pinned` (boolean, sticks to top of post lists)

**Note Schema** (simplified):

- `title`, `description`, `publishDate` only

### TypeScript Path Aliases

The project uses `@/*` as an alias for `src/*`. Import utilities and components using:

```typescript
import BaseHead from "@/components/BaseHead.astro";
import { getFormattedDate } from "@/utils/date";
```

### Content Creation Workflow

1. Create `.md` or `.mdx` files in `src/content/post/` or `src/content/note/`
2. Use frontmatter snippets by typing `frontmatter` in VSCode
3. Use `pnpm sync` to regenerate types after schema changes
4. Draft posts are excluded from production - use `draft: true` in frontmatter

### Styling Approach

- Tailwind CSS v4.1.13 with custom configuration
- Dark/light theme support via `data-theme` attribute
- Custom CSS properties defined in `src/styles/global.css`
- Expressive Code for syntax highlighting (Dracula dark, GitHub Light themes)

### Custom Plugins

- **Admonitions** - Support for `:::note`, `:::tip`, `:::important`, `:::caution`, `:::warning` callouts
- **Reading Time** - Automatic reading time calculation for posts

### Performance Features

- Static search via Pagefind (runs in `postbuild`)
- Prefetching enabled for faster navigation
- Image optimization through Astro
- Font optimization via custom Vite plugin
- Sitemap generation and robots.txt
- Web manifest for PWA capabilities

### Deployment

- Builds to `./dist/` directory
- Deploys to Aliyun OSS (AWS S3 compatible) via `pnpm deploy`
- GitHub Actions workflow for automated deployment on main branch pushes

## Advanced Architecture Details

### Dynamic Routing & Page Generation

- **Content Collections**: Uses Astro's content layer with Zod validation
- **Dynamic Slugs**: `[...slug].astro` pages generate routes from content collections
- **Tag Pages**: Automatically generated for each tag, with custom override support
- **OG Image Generation**: Dynamic social images via `/og-image/[...slug].astro` using Satori

### Custom Plugin System

Located in `src/plugins/`:

- **remark-admonitions**: Transforms `:::note` syntax into styled callouts
- **remark-github-cards**: Converts GitHub links to embedded cards
- **reading-time**: Calculates reading time for posts during build

### Theme & Styling Architecture

- **CSS Custom Properties**: Defined in `src/styles/global.css` for theming
- **Data Theme Attribute**: `data-theme="dark"` or `data-theme="light"` on HTML element
- **Tailwind Integration**: Custom colors and utilities in `tailwind.config.ts`
- **Expressive Code**: Syntax highlighting themes configured in `src/site.config.ts`

### Search Implementation

- **Pagefind Integration**: Static search index generated during `postbuild`
- **Search Component**: `src/components/Search.astro` with client-side search UI
- **Index Generation**: Automatically indexes all posts and notes content

### Performance Optimizations

- **Image Optimization**: Astro's built-in image processing for cover images
- **Font Optimization**: Custom Vite plugin for preloading and optimizing fonts
- **Prefetching**: Enabled for faster navigation between pages
- **Static Generation**: Full static build with no runtime JavaScript by default
