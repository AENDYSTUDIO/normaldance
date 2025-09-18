'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { trackEvent } from '@/lib/mixpanel'

export default function LandingClient() {
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
              disabled={status === 'loading'}
              className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
            </button>
          </form>

          {status === 'success' && (
            <p className="mt-4 text-green-300">✅ You're on the waitlist! We'll notify you when we launch.</p>
          )}
          {status === 'error' && (
            <p className="mt-4 text-red-300">❌ Something went wrong. Please try again.</p>
          )}

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎵</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Music NFTs</h3>
              <p className="opacity-80">Mint your tracks as NFTs on Solana blockchain</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔥</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">2% Burn</h3>
              <p className="opacity-80">Deflationary tokenomics with automatic burn</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Paid</h3>
              <p className="opacity-80">Earn from streams, sales, and staking rewards</p>
            </div>
          </div>

          <div className="mt-16">
            <Link href="/demo" className="inline-block px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-purple-600 transition-colors">
              View Demo
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
