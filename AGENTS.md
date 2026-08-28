# Repository Guidelines

## Project Overview

This repository hosts the source of **dc3.site** — the official landing/showcase site for **IoT DC3**, an open-source industrial IoT platform (Physical AI Runtime) built on Spring Cloud.

The site is built with **VitePress 1.6** and deployed to GitHub Pages (custom domain `dc3.site`) by `.github/workflows/deploy.yml` on every push to `main`.

> Technical documentation lives on a separate site (`docs.dc3.site`, source in the main [iot-dc3](https://github.com/pnoker/iot-dc3) repo). This repo is the marketing/demo landing site.

## Project Structure

```
.
├── .vitepress/
│   ├── config.ts          # VitePress config: locales (zh/en), sitemap rules, analytics, verifications
│   ├── seo.ts             # transformHead: canonical, hreflang, OG/Twitter, JSON-LD (@graph), FAQPage extraction
│   ├── theme/             # Custom theme: site shell, VisionPage (home), DashboardGallery, 12 industry panels
│   │   └── components/    #   DemoCrossLinks.vue = breadcrumb + cross links on every demo page
│   └── dist/              # Build output (gitignored)
├── zh/                    # Chinese content (index, vision, demo/<12 industries>)
├── en/                    # English content — paths must mirror zh/ 1:1
├── public/                # Static files copied to dist root:
│   ├── CNAME              # dc3.site (must not be removed)
│   ├── robots.txt         # Welcomes AI/answer-engine crawlers (GPTBot, ClaudeBot, PerplexityBot, ...)
│   ├── llms.txt           # Curated AI-readable site summary (AEO)
│   ├── ads.txt            # AdSense authorization
│   └── <hex>.txt          # IndexNow key file — key is referenced by deploy.yml; do not delete
├── scripts/
│   ├── generate-llms-full.cjs  # Post-build: extracts SSR HTML text into dist/llms-full.txt (AEO)
│   └── gen-og-images.mjs       # Regenerates public/images/og-{zh,en}.png from SVG (run locally, commit PNGs)
└── .github/workflows/deploy.yml  # Build + GitHub Pages deploy + IndexNow ping
```

## Build & Deploy

- `pnpm install` then `pnpm dev` for local dev; `pnpm build` runs `vitepress build && node scripts/generate-llms-full.cjs`.
- Deployment is automatic on push to `main`; no manual build output is committed.

## Content Conventions

- All page content is **Simplified Chinese** (`zh/`) with a 1:1 **English** mirror (`en/`) — every page must exist in both locales with identical paths, each having its own `title` and `description` frontmatter.
- Demo pages follow a fixed structure: frontmatter (title + description) → industry panel component → `demo-seo-desc` intro → `demo-article` sections (看板亮点 / 业务价值 / 如何基于 IoT DC3 落地 / 常见问题) → `<DemoCrossLinks />`.
- A `## 常见问题` / `## FAQ` section with `### question` headings is **required on demo pages**: seo.ts extracts it at build time into FAQPage structured data.
- Root `index.md` and `zh|en/vision.md` are noindex redirect pages; vision pages are excluded from the sitemap by config.

## SEO/AEO Invariants (do not regress)

- Every indexable page gets exactly one canonical, hreflang alternates (`zh-CN`/`en-US`/`x-default` → zh), OG/Twitter tags and JSON-LD (`Organization`, `WebSite`, `WebPage`, `BreadcrumbList`, plus `SoftwareApplication` on locale homes and `FAQPage` where FAQ content exists) — all generated in `.vitepress/seo.ts`; do not add competing tags in frontmatter `head` except on redirect pages.
- The sitemap (config.ts `transformItems`) must exclude noindex pages (root `/`, vision) and must not contain alternates pointing at the root redirect.
- `robots.txt`, `llms.txt`, `llms-full.txt` (generated), and the IndexNow ping in deploy.yml together form the AEO pipeline; keep them consistent when adding pages.

## Security & Configuration

- Never commit secrets or API keys. Tracking IDs (GA4, Baidu Tongji, AdSense, search-engine verification metas) live in `.vitepress/config.ts` and are intentional — do not add/remove tracker scripts without explicit approval.
- `public/CNAME` must remain `dc3.site`.

## Commits & Pull Requests

- Concise descriptive commit messages, English or Chinese.
- PRs: link related upstream changes in the main `iot-dc3` repo; include before/after screenshots for visual changes; verify links, CNAME, and mobile viewport after deployment.
