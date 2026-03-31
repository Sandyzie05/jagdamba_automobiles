# Jagdamba Automobiles website

Everything for this app lives in **one repository root** (no nested `app/` folder, no second copy of the project).

```
repository root/
├── app.js              # Node entry (cPanel “startup file”) — optional; serves dist/ via Vite preview
├── package.json
├── vite.config.ts
├── index.html
├── admin.html
├── src/
├── public/
└── dist/               # production build — see “Git vs server” below
```

## Git vs server (matches cPanel guidance)

Your host wants **one application root** where **`app.js`**, **`vite.config.ts`**, source files, **and** the **build output** (`dist/`) all live together **on the server**. That does **not** mean everything has to be **committed to GitHub**.

| Folder | Commit / push to GitHub? | Why |
|--------|---------------------------|-----|
| **`node_modules/`** | **No** — never | Created by **`npm install`** from `package.json` / `package-lock.json`. Large and machine-specific. Already in `.gitignore`. |
| **`dist/`** | **Optional** | Must **exist on the server** next to `package.json` so `app.js` / Vite preview can serve it. **Either:** (1) run **`npm run build`** on the server after **`npm install`** (use a full install so **TypeScript / Vite** are available to build), **or** (2) build on your PC and deploy `dist/` by FTP, **or** (3) stop ignoring `dist/` in `.gitignore` and **commit `dist/`** if you only run **`git pull`** on the server and **cannot** run a build there. |

Right now **`dist/` is listed in `.gitignore`**, so it is **not** pushed unless you remove that line on purpose. After **`npm install`**, you still need **`npm run build`** somewhere (local or server) to create **`dist/`**.

## Commands (repo root)

```bash
npm install
npm run dev       # dev server (subpath in vite.config.ts)
npm run build     # writes to dist/
npm run preview   # test dist/ locally
npm start         # same as node app.js — preview dist/
```

`vite.config.ts` **`base`** must match the URL path (e.g. `/jagdambaautomobiles/`). Use `'/'` only at the domain root.

---

## cPanel + GitHub (single directory)

Follow your host’s guidance so **nothing is split** across two folders:

1. **Remove** the old Node.js app in cPanel.
2. **Delete** any duplicate clone directories under `repositories/` (e.g. both `jagdamba_automobiles` and `jagdambaautomobiles`). Use **one** folder name that matches **one** GitHub repo clone.
3. **Re-clone** the GitHub repository once into `repositories/<repo-name>/`.
4. **Setup Node.js App** → **Application root**: use the **relative** path only, e.g. **`repositories/<repo-name>`** — do **not** include `/home/.../`.
5. **Startup file:** **`app.js`** (at that same root, next to `package.json`).
6. **Node.js:** **18** or **20** (not 10).
7. Run **NPM Install** (full install, not production-only, if you will **`npm run build`** on the server). Then run **`npm run build`** so **`dist/`** exists in that same directory — **or** build locally and upload **`dist/`**, **or** commit **`dist/`** if you choose to track it in Git.

All of **`app.js`**, **`vite.config.ts`**, **`src/`**, **`public/`**, and **`dist/`** must live in **that one** application root — no separate `www` tree elsewhere.

---

## Hosting modes

- **Static (simplest):** point the web server document root at **`dist/`** (contents). No Node required for visitors.
- **Node + `app.js`:** serves **`dist/`** via Vite preview; set **`PORT`** / **`NODE_PORT`** as your host expects.

Admin “Publish to GitHub” writes **`public/...`** and **`dist/...`** in the repo.

---

## Build fails with `SyntaxError: Unexpected token ?`

Use **Node 18+** in the Node.js app settings, reinstall, rebuild.
