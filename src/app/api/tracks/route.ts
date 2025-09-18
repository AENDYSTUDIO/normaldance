import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { validateTrackUpload, TrackUploadSchema } from '@/lib/data-validation'
import { createSecureHandler, securityConfigs } from '@/lib/api-security'

export const GET = createSecureHandler(securityConfigs.public)(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')
    const genre = searchParams.get('genre')

    const where: any = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (genre) {
      where.genre = genre
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
  }
)

export const POST = createSecureHandler({
  ...securityConfigs.upload,
  validation: TrackUploadSchema,
  sanitize: true
})(
  async (req: NextRequest, user: any, validatedData: any) => {
    const track = await db.track.create({
      data: {
        title: validatedData.metadata.title,
        artist: validatedData.metadata.artist,
        genre: validatedData.metadata.genre,
        duration: validatedData.metadata.duration,
        description: validatedData.metadata.description,
        releaseDate: new Date(validatedData.metadata.releaseDate),
        isExplicit: validatedData.metadata.isExplicit,
        fileSize: validatedData.metadata.fileSize,
        mimeType: validatedData.metadata.mimeType,
        ipfsHash: validatedData.ipfsHash || '',
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { username: true, displayName: true, walletAddress: true }
        }
      }
    })

    return Response.json({ success: true, track })
  }
)