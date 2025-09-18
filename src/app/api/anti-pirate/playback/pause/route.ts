import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'

// POST /api/anti-pirate/playback/pause - Pause playback session
export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { sessionId, pausedTime, reason } = body

    if (!sessionId || !pausedTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the playback session
    const playbackSession = await db.playHistory.findUnique({
      where: { id: sessionId }
    })

    if (!playbackSession) {
      return NextResponse.json(
        { error: 'Playback session not found' },
        { status: 404 }
      )
    }

    // Check if user owns this session
    if (playbackSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update the session with pause information
    const updatedSession = await db.playHistory.update({
      where: { id: sessionId },
      data: {
        // pausedTime: new Date(pausedTime), // Removed - field doesn't exist in schema
        // endTime: new Date(pausedTime), // Removed - field doesn't exist in schema
        isActive: false,
        metadata: {
          ...playbackSession.metadata,
          pauseReason: reason || 'user_pause',
          pausedAt: new Date(pausedTime).toISOString()
        }
      }
    })

    // Calculate listening duration
    const duration = pausedTime - playbackSession.startTime.getTime()
    const durationMinutes = Math.floor(duration / (1000 * 60))

    // If user listened for more than 30 seconds, count as a completed listen
    if (duration > 30000) {
      // Update track play count
      await db.track.update({
        where: { id: playbackSession.trackId },
        data: { playCount: { increment: 1 } }
      })

      // Award listening reward
      await db.reward.create({
        data: {
          userId: session.user.id,
          type: 'LISTENING',
          amount: 1,
          reason: `Completed listen (${durationMinutes} minutes)`
        }
      })
    }

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        trackId: updatedSession.trackId,
        startTime: updatedSession.startTime.getTime(),
        pausedTime: updatedSession.pausedTime?.getTime(),
        endTime: updatedSession.endTime?.getTime(),
        duration: duration,
        durationMinutes: durationMinutes,
        isActive: updatedSession.isActive,
        metadata: updatedSession.metadata
      }
    })

  } catch (error) {
    console.error('Error pausing playback session:', error)
    return NextResponse.json(
      { error: 'Failed to pause playback session' },
      { status: 500 }
    )
  }
}
