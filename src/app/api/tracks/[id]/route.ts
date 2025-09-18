import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/rbac'

// GET /api/tracks/[id] - Get a specific track
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const track = await db.track.findUnique({
      where: { id: id },
      include: {
        artist: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      }
    })

    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(track)
  } catch (error) {
    console.error('Error fetching track:', error)
    return NextResponse.json(
      { error: 'Failed to fetch track' },
      { status: 500 }
    )
  }
}

// PUT /api/tracks/[id] - Update a track
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    
    // Only allow updating certain fields
    const updateData = {
      ...(body.title && { title: body.title }),
      ...(body.artistName && { artistName: body.artistName }),
      ...(body.genre && { genre: body.genre }),
      ...(body.duration !== undefined && { duration: body.duration }),
      ...(body.metadata !== undefined && { metadata: body.metadata }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.isExplicit !== undefined && { isExplicit: body.isExplicit }),
      ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
    }

    const track = await db.track.update({
      where: { id: id },
      data: updateData,
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

    return NextResponse.json(track)
  } catch (error) {
    console.error('Error updating track:', error)
    return NextResponse.json(
      { error: 'Failed to update track' },
      { status: 500 }
    )
  }
}

// DELETE /api/tracks/[id] - Delete a track
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await db.track.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Track deleted successfully' })
  } catch (error) {
    console.error('Error deleting track:', error)
    return NextResponse.json(
      { error: 'Failed to delete track' },
      { status: 500 }
    )
  }
}

// POST /api/tracks/[id]/play - Record a play
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { userId, duration, completed } = body

    // Increment play count
    await db.track.update({
      where: { id: id },
      data: { playCount: { increment: 1 } }
    })

    // Record play history if user is provided
    if (userId) {
      await db.playHistory.create({
        data: {
          userId,
          trackId: id,
          duration: duration || 0,
          completed: completed || false,
        }
      })

      // Award listening reward
      if (completed && duration > 30) { // Only reward if listened for more than 30 seconds
        await db.reward.create({
          data: {
            userId,
            type: 'LISTENING',
            amount: 1, // 1 $NDT token per completed listen
            reason: `Listening reward for track ${id}`
          }
        })

        // Update user balance
        await db.user.update({
          where: { id: userId },
          data: { balance: { increment: 1 } }
        })
      }
    }

    return NextResponse.json({ message: 'Play recorded successfully' })
  } catch (error) {
    console.error('Error recording play:', error)
    return NextResponse.json(
      { error: 'Failed to record play' },
      { status: 500 }
    )
  }
}