'use client'

import { useEffect } from 'react'
import { useTracksStore } from '@/lib/stores/tracks-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { apiClient } from '@/lib/api-client'

export default function Dashboard() {
  const { tracks, setTracks } = useTracksStore()
  const { user } = useAuthStore()

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const data = await apiClient.getTracks()
        setTracks(data.tracks || [])
      } catch (error) {
        console.error('Failed to load tracks:', error)
      }
    }

    loadTracks()
  }, [setTracks])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to NORMALDANCE</h1>
          <p className="text-gray-600 mb-6">Connect your wallet to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.username || 'Artist'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => (
            <div key={track.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4">
                {track.coverUrl && (
                  <img 
                    src={track.coverUrl} 
                    alt={track.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
              </div>
              <h3 className="font-semibold text-lg mb-2">{track.title}</h3>
              <p className="text-gray-600 mb-4">{track.artist}</p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                Play
              </button>
            </div>
          ))}
        </div>

        {tracks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tracks available</p>
            <p className="text-gray-400">Upload your first track to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}