import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')
    const genre = searchParams.get('genre')

    const where: any = {}
    if (search) {
      // Санитизация поискового запроса
      const sanitizedSearch = search.replace(/[<>"'&]/g, '').trim()
      if (sanitizedSearch.length > 0) {
        where.OR = [
          { title: { contains: sanitizedSearch, mode: 'insensitive' } },
          { artist: { contains: sanitizedSearch, mode: 'insensitive' } }
        ]
      }
    }
    if (genre) {
      // Валидация жанра
      const validGenres = ['electronic', 'hip-hop', 'rock', 'pop', 'jazz', 'classical', 'ambient', 'techno', 'house', 'other']
      if (validGenres.includes(genre)) {
        where.genre = genre
      }
    }

    const tracks = await db.track.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { username: true, displayName: true, walletAddress: true }
        }
      }
    })

    const total = await db.track.count({ where })

    return Response.json({
      tracks,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Get tracks error:', error)
    return Response.json({ error: 'Failed to fetch tracks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const track = await db.track.create({
      data: {
        title: body.title || 'Untitled',
        artist: body.artist || 'Unknown',
        genre: body.genre || 'other',
        duration: body.duration || 0,
        description: body.description || '',
        releaseDate: new Date(),
        isExplicit: false,
        fileSize: body.fileSize || 0,
        mimeType: body.mimeType || 'audio/mpeg',
        ipfsHash: body.ipfsHash || '',
        userId: 'default-user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return Response.json({ success: true, track })
  } catch (error) {
    console.error('Create track error:', error)
    return Response.json({ error: 'Failed to create track' }, { status: 500 })
  }
}