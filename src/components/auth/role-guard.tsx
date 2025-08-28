'use client'

import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'

export type UserRole = 'LISTENER' | 'ARTIST' | 'CURATOR' | 'ADMIN'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { data: session } = useSession()

  if (!session) {
    return fallback || null
  }

  const userRole = (session.user as any)?.level || 'LISTENER'

  if (allowedRoles.includes(userRole as UserRole)) {
    return <>{children}</>
  }

  return fallback || null
}

// Хуки для проверки ролей
export function useRole() {
  const { data: session } = useSession()
  
  return {
    role: (session?.user as any)?.level || 'LISTENER' as UserRole,
    hasRole: (allowedRoles: UserRole[]) => {
      const userRole = (session?.user as any)?.level || 'LISTENER'
      return allowedRoles.includes(userRole as UserRole)
    },
    hasAnyRole: (allowedRoles: UserRole[]) => {
      const userRole = (session?.user as any)?.level || 'LISTENER'
      return allowedRoles.includes(userRole as UserRole)
    },
    isArtist: () => (session?.user as any)?.level === 'ARTIST',
    isCurator: () => (session?.user as any)?.level === 'CURATOR',
    isAdmin: () => (session?.user as any)?.level === 'ADMIN',
    isListener: () => (session?.user as any)?.level === 'LISTENER'
  }
}

// Компоненты для конкретных ролей
export function ArtistOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard allowedRoles={['ARTIST']} children={children} fallback={fallback} />
}

export function CuratorOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard allowedRoles={['CURATOR', 'ADMIN']} children={children} fallback={fallback} />
}

export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard allowedRoles={['ADMIN']} children={children} fallback={fallback} />
}

export function ArtistOrCurator({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard allowedRoles={['ARTIST', 'CURATOR', 'ADMIN']} children={children} fallback={fallback} />
}