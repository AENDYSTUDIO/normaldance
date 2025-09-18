import fetch from 'node-fetch'

async function run() {
  const ports = [3000, 3002]
  const results: string[] = []

  async function checkOnAnyPort(path: string, init?: RequestInit) {
    for (const p of ports) {
      try {
        const url = `http://localhost:${p}/api${path}`
        const res = await fetch(url, { method: 'GET', ...(init || {}) })
        let extra = ''
        if (res.status >= 400) {
          try { extra = ' ' + (await res.text()).slice(0, 200) } catch {}
        }
        results.push(`${path} @${p}: ${res.status}${extra ? ' ' + extra : ''}`)
        return
      } catch (e: any) {
        if (p === ports[ports.length - 1]) {
          results.push(`${path} @${p}: ERROR ${e?.message || e}`)
        }
      }
    }
  }

  await checkOnAnyPort('/health')
  await checkOnAnyPort('/tracks')
  await checkOnAnyPort('/auth/status')
  await checkOnAnyPort('/test')

  console.log(results.join('\n'))
}

run().catch((e) => {
  console.error('Smoke failed', e)
  process.exit(1)
})
