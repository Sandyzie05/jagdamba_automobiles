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
- **Hosts that require an application startup file:** set it to **`app.js`** at the repo root (same as **`npm start`** — serves **`www/`** via Vite preview). Uses env **`PORT`** or **`NODE_PORT`**, else **4173**. **`vite`** and **`@vitejs/plugin-react`** are in **`dependencies`** so **`npm install --omit=dev`** can still work for serving. Prefer static **`www/`** when you can.

Admin “Publish to GitHub” updates **`public/...`** and **`www/...`** in the repo.

## Build fails with `SyntaxError: Unexpected token ?` in TypeScript

The server is almost certainly using **Node.js 10** (paths like `nodevenv/.../10/`). This stack needs **Node 18+** (20 LTS recommended).

In your hosting **Node.js / Application** UI, change the app’s **Node version** from **10** to **18** or **20**, save, run **NPM Install** again, then **npm run build**.

If you see a warning that `npm` and `node` are different binaries, enable **`--scripts-prepend-node-path`** in npm config or use the host’s “Run NPM Install” button so scripts use the same Node as the virtual environment.
