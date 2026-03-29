# Jagdamba Automobiles — site source

Vite + React app. **Do not upload this folder to shared hosting** — only the built site.

## Develop

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

Output is **`../www/`** at the repository root. Upload everything inside `www/` to your host’s document root (`public_html`, `www`, etc.).

Optional preview of the build locally:

```bash
npm run preview
```

## GitHub “Publish” in Admin

Inventory publish writes `app/public/...` (source) and `www/...` (deploy tree) when using the GitHub API from the admin UI.
