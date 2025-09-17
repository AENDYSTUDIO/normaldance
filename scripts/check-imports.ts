/*
  Minimal import validation for home page and layout.
  Runs TypeScript with tsconfig.app.json and prints a concise JSON result.
*/
import { spawn } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { createRequire } from 'node:module'

function runTsc(): Promise<{ ok: boolean; output: string }> {
  return new Promise((resolve) => {
    const require = createRequire(import.meta.url)
    let tscBin: string
    try {
      // Resolve local TypeScript compiler entry
      tscBin = require.resolve('typescript/bin/tsc')
    } catch {
      // Fallback to global tsc
      tscBin = 'tsc'
    }

    // Run via Node to avoid npx/Windows spawn issues
    const nodeExec = process.execPath
    const args = [tscBin, '-p', 'tsconfig.app.json', '--noEmit']
    const child = spawn(nodeExec, args, { stdio: ['ignore', 'pipe', 'pipe'] })

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => (stdout += d.toString()))
    child.stderr.on('data', (d) => (stderr += d.toString()))
    child.on('close', (code) => {
      const output = (stdout + '\n' + stderr).trim()
      resolve({ ok: code === 0, output })
    })
  })
}

async function main() {
  const start = Date.now()
  const res = await runTsc()
  const durationMs = Date.now() - start
  const summary = {
    scope: ['src/app/page.tsx', 'src/app/layout.tsx'],
    ok: res.ok,
    durationMs,
    errors: res.ok ? [] : res.output.split('\n').slice(-50) // tail for brevity
  }
  const line = JSON.stringify({ ts: new Date().toISOString(), script: 'check-imports', ...summary })
  try { appendFileSync('logs.rxt', line + '\n', { encoding: 'utf8' }) } catch {}
  console.log(JSON.stringify(summary, null, 2))
  process.exit(res.ok ? 0 : 1)
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err) }, null, 2))
  process.exit(1)
})


