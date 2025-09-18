import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'

// GET /api/anti-pirate/free-tracks - Check free tracks usage
export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')
    const walletAddress = searchParams.get('walletAddress')

    if (!deviceId || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing deviceId or walletAddress' },
        { status: 400 }
      )
    }

    // Get current date range (last 24 hours)
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Count free tracks used in the last 24 hours
    const freeTracksUsed = await db.playHistory.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    })

    // Check if user has any active passes that would allow unlimited playback
    const activePasses = await db.nft.findMany({
      where: {
        ownerId: session.user.id,
        isActive: true
      }
    })

    const hasActivePass = activePasses.length > 0

    return NextResponse.json({
      success: true,
      used: freeTracksUsed,
      limit: 7,
      remaining: Math.max(0, 7 - freeTracksUsed),
      hasActivePass,
      resetTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).getTime()
    })

  } catch (error) {
    console.error('Error checking free tracks:', error)
    return NextResponse.json(
      { error: 'Failed to check free tracks' },
      { status: 500 }
    )
  }
}

// POST /api/anti-pirate/free-tracks - Record free track usage
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
    const { deviceId, walletAddress, trackId } = body

    if (!deviceId || !walletAddress || !trackId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user has already used 7 free tracks in the last 24 hours
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const freeTracksUsed = await db.playHistory.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    })

    if (freeTracksUsed >= 7) {
      return NextResponse.json(
        { error: 'Free tracks limit exceeded' },
        { status: 400 }
      )
    }

    // Create playback history record
    const sessionRecord = await db.playHistory.create({
      data: {
        userId: session.user.id,
        trackId,
        duration: 0,
        completed: false
      }
    })

    return NextResponse.json({
      success: true,
      session: {
        id: sessionRecord.id,
        trackId: sessionRecord.trackId,
        startTime: sessionRecord.startTime.getTime(),
        isFree: sessionRecord.isFree
      }
    })

  } catch (error) {
    console.error('Error recording free track usage:', error)
    return NextResponse.json(
      { error: 'Failed to record free track usage' },
      { status: 500 }
    )
  }
}
