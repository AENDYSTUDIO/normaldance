'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useTracksStore } from '@/lib/stores/tracks-store'
import { apiClient } from '@/lib/api-client'

export default function TestPanel() {
  const { user, token } = useAuthStore()
  const { tracks } = useTracksStore()
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testAPI = async (endpoint: string, method = 'GET', data?: any) => {
    try {
      const response = await fetch(`/api${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...(data && { body: JSON.stringify(data) }),
      })
      
      addResult(`${method} ${endpoint}: ${response.status} ${response.statusText}`)
      return response.ok
    } catch (error) {
      addResult(`${method} ${endpoint}: ERROR - ${error}`)
      return false
    }
  }

  const runSmokeTest = async () => {
    setTestResults([])
    addResult('🧪 Starting smoke test...')

    // Test 1: Auth status
    addResult(`Auth: ${user ? '✅ Connected' : '❌ Not connected'}`)
    addResult(`Token: ${token ? '✅ Present' : '❌ Missing'}`)

    // Test 2: API endpoints
    await testAPI('/tracks')
    await testAPI('/auth/wallet', 'POST', { publicKey: 'test', signature: 'test' })
    
    // Test 3: Zustand state
    addResult(`Tracks in store: ${tracks.length}`)
    addResult(`Auth persist: ${localStorage.getItem('auth-storage') ? '✅' : '❌'}`)

    addResult('🏁 Smoke test completed!')
  }

  if (!user) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg p-4 shadow-lg max-w-md">
      <h3 className="font-bold mb-2">🧪 Test Panel</h3>
      
      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <span className="font-medium">User:</span> {user.walletAddress.slice(0, 8)}...
        </div>
        <div className="text-sm">
          <span className="font-medium">Tracks:</span> {tracks.length}
        </div>
      </div>

      <button
        onClick={runSmokeTest}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded mb-2 text-sm"
      >
        Run Smoke Test
      </button>

      <div className="max-h-32 overflow-y-auto text-xs bg-gray-50 p-2 rounded">
        {testResults.map((result, i) => (
          <div key={i} className="mb-1">{result}</div>
        ))}
      </div>
    </div>
  )
}