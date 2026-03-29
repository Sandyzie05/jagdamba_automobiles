# Jagdamba Automobiles website

`package.json` is at the **repository root** so hosts that scan the app folder for Node/npm find it without an extra `app/` path.

## Layout

- **`www/`** — production build. Upload its **contents** to your host (e.g. `public_html/jagdambaautomobiles/`).
- **`public/`** — static assets and `data/inventory.json` (source for the next build).
- **`src/`** — React source.

## Commands (run at repo root)

```bash
npm install
npm run dev      # local development
npm run build    # refresh www/
npm run preview  # test the built site locally
```

`vite.config.ts` **`base`** must match the URL path where the site is served (e.g. `/jagdambaautomobiles/`). Use `'/'` only if the site is at the domain root.

## Hosting

- **Static:** point the site’s document root at **`www/`** (or upload `www/`). No Node process is required to serve visitors.
- **Build on server:** set application root to the **repo root** (where `package.json` is), run **`npm install`** and **`npm run build`**, then serve **`www/`**.

Admin “Publish to GitHub” updates **`public/...`** and **`www/...`** in the repo.
