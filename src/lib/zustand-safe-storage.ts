import { createJSONStorage } from 'zustand/middleware'

// Provides a JSON storage implementation that is safe to use in SSR environments.
// On the server it becomes a no-op storage; on the client it uses localStorage.
export function createClientSideJSONStorage() {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return createJSONStorage(() => localStorage)
  }

  // No-op storage for SSR to avoid ReferenceError: localStorage is not defined
  // Using loose typings on purpose (project uses relaxed TS settings for Web3 code)
  return {
    getItem: async (_name: string) => null as any,
    setItem: async (_name: string, _value: unknown) => {},
    removeItem: async (_name: string) => {},
  } as any
}


