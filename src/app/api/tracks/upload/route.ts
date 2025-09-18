import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { writeFile } from 'fs/promises'
import { join } from 'path'

// Validation schema for track upload
const uploadSchema = z.object({
  title: z.string().min(1).max(100),
  artistName: z.string().min(1).max(50),
  genre: z.string().min(1).max(30),
  duration: z.number().min(1),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  isExplicit: z.boolean().default(false),
})

// POST /api/tracks/upload - Upload a new track
export async function POST(request: Request) {
  try {
    // Parse form data
    const formData = await request.formData()
    
    // Get file from form data
    const file = formData.get('audioFile') as File
    const imageFile = formData.get('imageFile') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      )
    }

    // Validate track metadata
    const metadata = JSON.parse(formData.get('metadata') as string || '{}')
    const validatedData = uploadSchema.parse(metadata)

    // Generate unique filename
    const audioFileName = `${Date.now()}_${file.name}`
    const imageFileName = imageFile ? `${Date.now()}_${imageFile.name}` : null

    // Save files to local storage (in production, this would be IPFS/Filecoin)
    const audioBuffer = Buffer.from(await file.arrayBuffer())
    const audioPath = join(process.cwd(), 'uploads', 'audio', audioFileName)
    
    await writeFile(audioPath, audioBuffer)

    let imagePath: string | null = null
    let imageUrl: string | null = null
    if (imageFile) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
      imagePath = join(process.cwd(), 'uploads', 'images', imageFileName!)
      await writeFile(imagePath, imageBuffer)
      imageUrl = `/uploads/images/${imageFileName}`
    }

    // For now, use a default artist ID - in real app this would come from auth context
    const defaultArtistId = 'default-artist-id'

    // Create track record
    const track = await db.track.create({
      data: {
        ...validatedData,
        artistId: defaultArtistId,
        audioUrl: `/uploads/audio/${audioFileName}`,
        imageUrl: imageUrl,
        ipfsHash: `ipfs_${Date.now()}`, // This would be actual IPFS hash in production
        duration: validatedData.duration,
        isPublished: true,
      },
      include: {
        artist: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          }
        }
      }
    })

    // Award upload reward to artist
    await db.reward.create({
      data: {
        userId: defaultArtistId,
        type: 'UPLOAD',
        amount: 20, // 20 $NDT tokens for upload
        reason: `Track upload reward: ${track.title}`
      }
    })

    // Update user balance
    await db.user.update({
      where: { id: defaultArtistId },
      data: { balance: { increment: 20 } }
    })

    // Sanitize track data before returning
    const sanitizedTrack = {
      ...track,
      title: track.title.replace(/[<>"'&]/g, ''),
      artistName: track.artistName.replace(/[<>"'&]/g, ''),
      genre: track.genre.replace(/[<>"'&]/g, ''),
      description: track.description?.replace(/[<>"'&]/g, '') || null
    }

    return NextResponse.json({
      message: 'Track uploaded successfully',
      track: sanitizedTrack,
      files: {
        audio: audioFileName.replace(/[<>"'&]/g, ''),
        image: imageFileName?.replace(/[<>"'&]/g, '') || null,
      }
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error uploading track:', error)
    return NextResponse.json(
      { error: 'Failed to upload track' },
      { status: 500 }
    )
  }
}

// GET /api/tracks/upload - Get upload status and progress (for large files)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get('uploadId')

    if (!uploadId) {
      return NextResponse.json(
        { error: 'Upload ID is required' },
        { status: 400 }
      )
    }

    // In a real implementation, this would check the status of an ongoing upload
    // For now, return a mock response
    return NextResponse.json({
      uploadId,
      status: 'completed',
      progress: 100,
      message: 'Upload completed successfully'
    })
  } catch (error) {
    console.error('Error checking upload status:', error)
    return NextResponse.json(
      { error: 'Failed to check upload status' },
      { status: 500 }
    )
  }
}