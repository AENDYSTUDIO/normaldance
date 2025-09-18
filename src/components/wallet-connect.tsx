'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { apiClient } from '@/lib/api-client'

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean
      connect: () => Promise<{ publicKey: { toString: () => string } }>
      signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>
    }
  }
}

export default function WalletConnect() {
  const { user, setUser, setToken, isConnecting, setConnecting } = useAuthStore()
  const [error, setError] = useState('')

  const connectWallet = async () => {
    if (!window.solana) {
      setError('Phantom wallet not found. Please install Phantom.')
      return
    }

    setConnecting(true)
    setError('')

    try {
      const response = await window.solana.connect()
      const publicKey = response.publicKey.toString()

      // Create message to sign
      const message = `Sign this message to authenticate with NORMALDANCE: ${Date.now()}`
      const encodedMessage = new TextEncoder().encode(message)
      
      const signedMessage = await window.solana.signMessage(encodedMessage)
      const signature = Array.from(signedMessage.signature).map(b => b.toString(16).padStart(2, '0')).join('')

      // Authenticate with backend
      const authResponse = await apiClient.connectWallet(publicKey, signature)
      
      setUser({
        id: authResponse.user.id,
        walletAddress: publicKey,
        username: authResponse.user.username,
        avatar: authResponse.user.avatar,
      })
      setToken(authResponse.token)

    } catch (error) {
      console.error('Wallet connection failed:', error)
      setError('Failed to connect wallet. Please try again.')
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    useAuthStore.getState().logout()
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-sm">
          <p className="font-medium">{user.username || 'Artist'}</p>
          <p className="text-gray-500 text-xs">
            {user.walletAddress.slice(0, 4)}...{user.walletAddress.slice(-4)}
          </p>
        </div>
        <button
          onClick={disconnect}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  )
}