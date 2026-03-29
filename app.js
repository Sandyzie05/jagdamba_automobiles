/**
 * Node application entry for hosts that require a startup file (e.g. cPanel).
 * Serves the production build in ./www — same as `npm start` / `vite preview`.
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const viteCli = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js')
const port = String(process.env.PORT || process.env.NODE_PORT || 4173)

const child = spawn(process.execPath, [viteCli, 'preview', '--host', '0.0.0.0', '--port', port], {
  stdio: 'inherit',
  cwd: __dirname,
})

child.on('error', (err) => {
  console.error(err)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  process.exit(code ?? 1)
})
