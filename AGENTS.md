# Repository Guidelines

## Project Overview

This repository hosts the official documentation site for **IoT DC3** — an open-source, distributed IoT platform built on Spring Cloud. The site is generated with [VuePress 1.9.10](https://v1.vuepress.vuejs.org/) and deployed via GitHub Pages to [dc3.site](https://dc3.site).

The `docs/` directory contains the static build output (HTML, JS, CSS, assets) served to users. Documentation covers architecture, configuration, driver development, operation guides, FAQ, and contributor resources — all in Chinese.

## Project Structure

```
.
├── docs/                  # Built static site (deployed by GitHub Pages)
│   ├── index.html         # Landing page
│   ├── 404.html           # Custom 404 page
│   ├── CNAME              # Custom domain: dc3.site
│   ├── assets/            # Bundled JS, CSS, images, fonts
│   ├── config/            # Configuration reference pages
│   ├── contributor/       # Contributor guide page
│   ├── docs/              # Core documentation (guide, code, driver, cluster, etc.)
│   ├── faq/               # Frequently asked questions
│   └── video/             # Video tutorial pages
├── LICENSE                # Project license
└── AGENTS.md              # This file
```

> **Note:** VuePress source Markdown files are maintained in the main [iot-dc3](https://github.com/pnoker/iot-dc3) repository. This repo only receives the final build output.

## Build & Deploy

The static site is built externally and the output is committed to this repository for GitHub Pages deployment. No local build toolchain is required here.

- **Build** happens in the main `iot-dc3` repo via VuePress CLI.
- **Deploy** is handled by copying the VuePress output into this repo's `docs/` directory and pushing to `main`. GitHub Pages serves from the `docs/` folder.

## File Naming & Conventions

- All content and page titles are in **Simplified Chinese**.
- Static HTML files use lowercase kebab-case naming (e.g., `update-log.html`).
- Directory names mirror the documentation section they represent (`config/`, `faq/`, `video/`).
- Favicon and logo reside under `docs/assets/images/`.

## Commit & Pull Request Guidelines

- **Commits:** Use concise, descriptive commit messages. No strict convention (no Conventional Commits), but keep them clear and in English or Chinese.
- **Pull Requests:** Reference the upstream documentation change in the main `iot-dc3` repo. Link related issues or PRs. Include before/after screenshots for visual or layout changes.
- **Review focus:** Verify that all links work after deployment, the CNAME is intact, and no regressions on mobile viewport.

## Security & Configuration

- Never commit secrets, API keys, or analytics tokens. The site uses Google Analytics and Baidu Tongji — these IDs are already configured in `docs/index.html`.
- The `CNAME` file must remain at `docs/CNAME` with the value `dc3.site` for the custom domain to resolve.
- Do not add or remove tracker scripts without explicit approval.
