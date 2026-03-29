# Jagdamba Automobiles website

- **`www/`** — production static site. Upload its **contents** into the URL folder on the server (e.g. `public_html/jagdambaautomobiles/` if the site is at `yoursite.in/jagdambaautomobiles`).
- **`app/`** — source code. Run `npm install` and `npm run build` inside `app/` to regenerate `www/`. There is **no** `package.json` inside `www/` on purpose.

`app/vite.config.ts` **`base`** must match the path segment where the site is served (see comment in that file). Change it to `'/'` only if the site lives at the domain root.
