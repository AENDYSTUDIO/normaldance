'use client'

import { SecureLogger } from '@/lib/security/secure-logger';
import { useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import GraveyardGrid from '@/components/grave/GraveyardGrid'
import GraveVinyl from '@/components/grave/GraveVinyl'
import GraveDonateButton from '@/components/grave/GraveDonateButton'

interface TelegramUser {
  id: number
  first_name: string
  username?: string
  is_premium?: boolean
}

export default function GraveMinAppPage() {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [activeTab, setActiveTab] = useState<'explore' | 'create' | 'my-memorials'>('explore')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize Telegram Web App
    if (typeof window !== 'undefined') {
      WebApp.ready()

      // Get user data
      const initData = WebApp.initDataUnsafe
      if (initData?.user) {
        setUser(initData.user as TelegramUser)
      }

      // Setup UI
      WebApp.setHeaderColor('#000000')
      WebApp.setBackgroundColor('#111827')
      WebApp.expand()
      WebApp.enableClosingConfirmation()

      // Setup main button
      WebApp.MainButton.setText('🕯️ Light Candle')
      WebApp.MainButton.onClick(() => {
        // Handle main button click
        SecureLogger.log('Main button clicked')
      })

      setIsInitialized(true)
    }
  }, [])

  const handleSendWebAppData = (data: any) => {
    WebApp.sendData(JSON.stringify(data))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-purple-500/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🪦 G.rave
            </h1>
            {user && (
              <p className="text-xs text-gray-400 mt-1">
                Welcome, {user.first_name}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Telegram Mini App</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'explore'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🌍 Explore
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'create'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            ➕ Create
          </button>
          <button
            onClick={() => setActiveTab('my-memorials')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'my-memorials'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            👤 Mine
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {activeTab === 'explore' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-purple-500/20">
              <h2 className="text-lg font-bold text-white mb-2">🪦 Explore Memorials</h2>
              <p className="text-sm text-gray-300">
                Discover and support eternal memorials for musicians
              </p>
            </div>
            <GraveyardGrid />
          </div>
        )}

        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur rounded-lg p-6 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-4">🪦 Create Memorial</h2>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    placeholder="DJ Eternal"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    IPFS Hash
                  </label>
                  <input
                    type="text"
                    placeholder="QmYourIPFSHash..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Contains audio, photo, and biography
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Heirs (Wallet Addresses)
                  </label>
                  <textarea
                    placeholder="0x1234...&#10;0x5678..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 h-24"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    One address per line (max 10)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleSendWebAppData({
                      action: 'create_memorial',
                      timestamp: Date.now()
                    })
                    WebApp.showAlert('✅ Memorial creation started!')
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
                >
                  🪦 Create Memorial
                </button>
              </form>

              <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-xs text-yellow-100">
                  ⚠️ <strong>Important:</strong> Memorials are permanent on the blockchain.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'my-memorials' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur rounded-lg p-4 border border-purple-500/20">
              <h2 className="text-lg font-bold text-white mb-2">👤 My Memorials</h2>
              <p className="text-sm text-gray-300">
                Memorials you created or contributed to
              </p>
            </div>

            <div className="space-y-4">
              {/* Sample memorial card */}
              <div className="bg-gray-800/50 backdrop-blur rounded-lg border border-purple-500/20 overflow-hidden hover:border-purple-500/40 transition-all">
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2">🎵 DJ Eternal</h3>

                  {/* Mini 3D Vinyl */}
                  <div className="mb-4 rounded-lg overflow-hidden bg-black h-48">
                    <GraveVinyl
                      bpm={120}
                      tracks={5}
                      name="DJ Eternal"
                      candlesLit={12}
                      isPlaying={true}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-purple-500/10 rounded p-2">
                      <div className="text-lg font-bold text-purple-400">1.25</div>
                      <div className="text-xs text-gray-400">ETH Fund</div>
                    </div>
                    <div className="bg-pink-500/10 rounded p-2">
                      <div className="text-lg font-bold text-pink-400">15</div>
                      <div className="text-xs text-gray-400">Donations</div>
                    </div>
                    <div className="bg-blue-500/10 rounded p-2">
                      <div className="text-lg font-bold text-blue-400">1.2K</div>
                      <div className="text-xs text-gray-400">Visitors</div>
                    </div>
                  </div>

                  <GraveDonateButton
                    memorialId="1"
                    artistName="DJ Eternal"
                    onSuccess={() => {
                      WebApp.showAlert('✅ Candle lit!')
                      handleSendWebAppData({
                        action: 'donation_completed',
                        memorialId: '1',
                        artistName: 'DJ Eternal'
                      })
                    }}
                  />
                </div>
              </div>

              {/* Empty state */}
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🪦</div>
                <p className="text-gray-400 mb-4">No memorials yet</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Create your first memorial
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Safe Area */}
      <div className="h-4 bg-black" />
    </div>
  )
}
