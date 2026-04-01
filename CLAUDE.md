# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install           # Install all dependencies (full install needed for build)
npm run dev           # Dev server with hot reload
npm run build         # TypeScript check + Vite bundle → writes to dist/
npm run preview       # Serve dist/ locally to test production build
npm run lint          # Run ESLint
npm start             # node app.js — same as vite preview, used on cPanel
```

No test framework is configured.

## Architecture

This is a React 18 + TypeScript + Vite SPA for a motorcycle parts shop (Jagdamba Automobiles). The app has two entry points:

- **`index.html`** → storefront for customers
- **`admin.html`** → inventory management panel

Routing is handled manually in `src/App.tsx` by checking `window.location.pathname` — no router library is used. Paths matching `/admin` or `/admin.html` render `AdminPage`, everything else renders `StorefrontPage`.

### Key source files

| File | Role |
|------|------|
| `src/App.tsx` | Route switch between storefront and admin |
| `src/StorefrontPage.tsx` | Customer UI: browse/search inventory, gallery, contact, language toggle |
| `src/AdminPage.tsx` | Admin UI: edit inventory, upload images, publish to GitHub |
| `src/inventory.ts` | `InventoryItem` / `InventoryDocument` types and utilities |
| `src/siteContent.ts` | Hardcoded business content (contact info, gallery captions, brand data) |
| `src/githubRepoApi.ts` | GitHub API integration for publishing inventory/images from the admin panel |
| `public/data/inventory.json` | Live inventory data served at runtime |

### Data flow

- Inventory is loaded at runtime from `/data/inventory.json` (relative to `BASE_URL`)
- Admin drafts are persisted to **localStorage**
- Admin "Publish to GitHub" uses the GitHub API (token stored in localStorage) to write updated `inventory.json` and image files directly to the repo

### Build configuration

`vite.config.ts` sets `base: '/jagdambaautomobiles/'` — all asset paths are prefixed with this subpath. Change this if deploying at the domain root (`'/'`). The build produces two HTML entry points (`index.html` and `admin.html`) in `dist/`.

### Deployment

The app is hosted on cPanel. `app.js` is the Node.js startup file — it serves `dist/` using only Node built-ins (`http`, `fs`) on `PORT` or `NODE_PORT`. It deliberately avoids Vite/esbuild at runtime because shared hosts (CloudLinux LVE) cannot allocate WebAssembly memory. The entire repo (source + `dist/`) must live in one directory as the Node.js application root. See `README.md` for full cPanel setup steps.
