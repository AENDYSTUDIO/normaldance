import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClientSideJSONStorage } from '@/lib/zustand-safe-storage'

interface User {
  id: string
  walletAddress: string
  username?: string
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isConnecting: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  setConnecting: (connecting: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isConnecting: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setConnecting: (connecting) => set({ isConnecting: connecting }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
      storage: createClientSideJSONStorage(),
    }
  )
)