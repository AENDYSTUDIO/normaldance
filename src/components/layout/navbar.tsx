'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', textDecoration: 'none' }}>
          NORMALDANCE
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/dashboard" style={{ color: '#374151', textDecoration: 'none' }}>
            Dashboard
          </Link>
          <Link href="/upload" style={{ color: '#374151', textDecoration: 'none' }}>
            Upload
          </Link>
        </div>
      </div>
    </nav>
  )
}