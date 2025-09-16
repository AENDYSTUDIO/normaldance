'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { trackEvent } from '@/lib/mixpanel'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      trackEvent('Waitlist Submit', { email })
      // Mailchimp embed POST (replace with your form action URL)
      const formAction = process.env.NEXT_PUBLIC_MAILCHIMP_ACTION_URL
      if (!formAction) {
        setStatus('success')
        return
      }
      const formData = new FormData()
      formData.append('EMAIL', email)
      const res = await fetch(formAction, { method: 'POST', body: formData, mode: 'no-cors' })
      setStatus('success')
    } catch (_) {
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-600 to-fuchsia-700 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Image src="/logo.svg" alt="NormalDance" width={72} height={72} className="mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">NormalDance — Music NFTs. Real Monetization.</h1>
          <p className="text-lg opacity-90 mb-8">Mint music NFTs on Solana with 2% burn, stream via IPFS multi-gateway, and get paid.</p>

          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="px-4 py-3 rounded-md text-black w-full sm:w-96"
            />
            <button
              type="submit"
              disabled={status==='loading'}
              className="px-6 py-3 rounded-md bg-white text-purple-700 font-semibold disabled:opacity-70"
            >
              {status==='loading' ? 'Joining…' : 'Join waitlist'}
            </button>
          </form>
          {status==='success' && <p className="mt-3 text-emerald-200">You’re on the list. We’ll be in touch.</p>}
          {status==='error' && <p className="mt-3 text-rose-200">Something went wrong. Try again.</p>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="font-bold">Deflationary 2% burn</p>
              <p className="text-sm opacity-80">Every transaction burns 2% of supply.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="font-bold">IPFS multi-gateway</p>
              <p className="text-sm opacity-80">Resilient streaming across gateways.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="font-bold">Mobile app</p>
              <p className="text-sm opacity-80">Expo-based app for on-the-go streaming.</p>
            </div>
          </div>

          <div className="mt-10 opacity-80 text-sm">
            <Link href="/">Explore app →</Link>
          </div>
        </div>
      </div>
    </main>
  )
}


