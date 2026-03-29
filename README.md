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

- **Static (recommended):** point the site’s document root at **`www/`** (or upload `www/`). No Node process and **no `npm start`** are required.
- **Build on server:** application root = repo root, run **`npm install`** and **`npm run build`**, then serve **`www/`** with Apache/nginx.
- **Hosts that insist on `npm start`:** `package.json` includes **`start`** → runs **`vite preview`** on **`www/`** (uses **`PORT`** if set, else **4173**). This is only for panels that require a Node process; prefer static serving when possible. **`vite` must be installed** (do not use `npm install --omit=dev` unless you move `vite` to `dependencies`).

Admin “Publish to GitHub” updates **`public/...`** and **`www/...`** in the repo.

## Build fails with `SyntaxError: Unexpected token ?` in TypeScript

The server is almost certainly using **Node.js 10** (paths like `nodevenv/.../10/`). This stack needs **Node 18+** (20 LTS recommended).

In your hosting **Node.js / Application** UI, change the app’s **Node version** from **10** to **18** or **20**, save, run **NPM Install** again, then **npm run build**.

If you see a warning that `npm` and `node` are different binaries, enable **`--scripts-prepend-node-path`** in npm config or use the host’s “Run NPM Install” button so scripts use the same Node as the virtual environment.
