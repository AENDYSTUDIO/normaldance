import { NextRequest, NextResponse } from 'next/server'
import { createSecureHandler } from '@/lib/api-security'
import { db } from '@/lib/db'
import { z } from 'zod'

// Define schema for track validation
const trackSchema = z.object({
  title: z.string().min(1).max(100),
  artist: z.string().min(1).max(100),
  genre: z.string().optional(),
  duration: z.number().positive(),
  price: z.number().min(0).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  audioUrl: z.string().url(),
  isExplicit: z.boolean().default(false),
  releaseDate: z.string().datetime().optional(),
})

// Create secure handler with authentication
const secureHandler = createSecureHandler({
  rateLimit: { limit: 100, windowMs: 60000 },
  auth: { required: true },
  validation: trackSchema,
})

// GET /api/tracks - Get tracks with pagination and filtering
export const GET = secureHandler(async (req, user, data) => {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''
    const genre = searchParams.get('genre') || ''
    const artistId = searchParams.get('artistId') || ''

    // Build query
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (genre) {
      where.genre = genre
    }
    
    if (artistId) {
      where.artistId = artistId
    }

    // Get tracks
    const [tracks, total] = await Promise.all([
      db.track.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, imageUrl: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      db.track.count({ where })
    ])

    return NextResponse.json({
      tracks,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching tracks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    )
  }
})

// POST /api/tracks - Create new track
export const POST = secureHandler(async (req, user, data) => {
  try {
    const body = await req.json()
    const validatedData = trackSchema.parse(body)

    // Check if user has permission to create tracks
    if (!user.permissions?.includes('CREATE_TRACK')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Create track
    const track = await db.track.create({
      data: {
        ...validatedData,
        artistId: user.id, // Assuming user is an artist
        status: 'PENDING'
      },
      include: {
        artist: {
          select: { id: true, name: true, imageUrl: true }
        }
      }
    })

    return NextResponse.json(track, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating track:', error)
    return NextResponse.json(
      { error: 'Failed to create track' },
      { status: 500 }
    )
  }
})