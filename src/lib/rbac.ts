export async function requireRole(role: 'ADMIN' | 'CURATOR' | 'ARTIST'): Promise<boolean> {
  try {
    const { getServerSession } = await import('next-auth/next')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)
    const user: any = session?.user
    if (!session || !user) return false

    // Prefer explicit role if present
    const explicitRole = user.role as string | undefined
    if (explicitRole) {
      if (role === 'ADMIN') return explicitRole === 'ADMIN'
      if (role === 'CURATOR') return explicitRole === 'ADMIN' || explicitRole === 'CURATOR'
      if (role === 'ARTIST') return ['ADMIN','CURATOR','ARTIST'].includes(explicitRole)
      return false
    }

    // Fallback: derive from legacy level/isArtist
    const level = user.level as string | undefined
    const isArtist = Boolean(user.isArtist)

    const derivedRole: 'ADMIN' | 'CURATOR' | 'ARTIST' =
      level === 'ADMIN' ? 'ADMIN' : level === 'CURATOR' ? 'CURATOR' : 'ARTIST'

    // If no admin/curator levels exist, treat artists as ARTIST
    if (role === 'ADMIN') return derivedRole === 'ADMIN'
    if (role === 'CURATOR') return derivedRole === 'ADMIN' || derivedRole === 'CURATOR'
    if (role === 'ARTIST') return true // any authenticated user qualifies as at least ARTIST
    return false
  } catch {
    return false
  }
}

export async function isAdmin(): Promise<boolean> { return requireRole('ADMIN') }


