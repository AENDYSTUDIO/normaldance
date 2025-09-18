import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'

// POST /api/anti-pirate/passes/purchase - Purchase NFT pass
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
    const { passId, deviceId, walletAddress, trackId, clubId, genreId } = body

    if (!passId || !deviceId || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get pass template
    const passTemplate = await db.nFT.findUnique({
      where: { id: passId }
    })

    if (!passTemplate) {
      return NextResponse.json(
        { error: 'Pass template not found' },
        { status: 404 }
      )
    }

    // Check if user has enough balance
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { tonBalance: true, balance: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has enough TON balance
    const passPrice = passTemplate.price || 0
    if (user.tonBalance < passPrice) {
      return NextResponse.json(
        { error: 'Insufficient TON balance' },
        { status: 400 }
      )
    }

    // Use transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // Deduct TON from user balance
      await tx.user.update({
        where: { id: session.user.id },
        data: { tonBalance: { decrement: passPrice } }
      })

      // Create NFT pass
      const pass = await tx.nFT.create({
        data: {
          ownerId: session.user.id,
          tokenId: `pass_${Date.now()}`,
          name: passTemplate.name,
          description: passTemplate.description,
          price: passPrice,
          type: 'PASS',
          status: 'MINTED',
          metadata: JSON.stringify({
            deviceId,
            walletAddress,
            trackId: trackId || null,
            clubId: clubId || null,
            genreId: genreId || null,
            purchasedAt: new Date().toISOString()
          })
        }
      })

      // Create purchase transaction record
      await tx.purchase.create({
        data: {
          buyerId: session.user.id,
          nftId: pass.id,
          price: passPrice,
          transaction: `pass_purchase_${Date.now()}`
        }
      })

      // Award artist with 90% of the purchase price
      if (trackId) {
        const track = await tx.track.findUnique({
          where: { id: trackId },
          select: { artistId: true }
        })

        if (track) {
          const artistReward = passPrice * 0.9
          await tx.user.update({
            where: { id: track.artistId },
            data: { tonBalance: { increment: artistReward } }
          })

          await tx.reward.create({
            data: {
              userId: track.artistId,
              type: 'PASS_PURCHASE',
              amount: artistReward,
              reason: `NFT pass purchase reward (90% of ${passPrice} TON)`
            }
          })
        }
      }

      return pass
    })

    return NextResponse.json({
      success: true,
      pass: {
        id: result.id,
        type: result.type,
        name: result.name,
        price: result.price,
        duration: result.duration,
        description: result.description,
        benefits: result.benefits,
        icon: result.icon,
        color: result.color,
        isActive: result.isActive,
        expiresAt: result.expiresAt?.getTime(),
        createdAt: result.createdAt.getTime(),
        metadata: result.metadata
      }
    })

  } catch (error) {
    console.error('Error purchasing NFT pass:', error)
    return NextResponse.json(
      { error: 'Failed to purchase NFT pass' },
      { status: 500 }
    )
  }
}
