import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'

// GET /api/anti-pirate/passes - Get user's NFT passes
export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const now = new Date()

    // Get all passes for the user
    const passes = await db.nFT.findMany({
      where: {
        ownerId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format passes for response
    const formattedPasses = passes.map(pass => ({
      id: pass.id,
      type: pass.type,
      name: pass.name,
      price: pass.price,
      description: pass.description,
      status: pass.status,
      tokenId: pass.tokenId,
      createdAt: pass.createdAt.getTime(),
      metadata: pass.metadata
    }))

    return NextResponse.json({
      success: true,
      passes: formattedPasses
    })

  } catch (error) {
    console.error('Error getting NFT passes:', error)
    return NextResponse.json(
      { error: 'Failed to get NFT passes' },
      { status: 500 }
    )
  }
}

// POST /api/anti-pirate/passes - Create new NFT pass
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
    const { type, name, price, duration, description, benefits, icon, color, metadata } = body

    if (!type || !name || !price || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate pass type
    const validTypes = ['day', 'track', 'club', 'genre', 'olympic']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid pass type' },
        { status: 400 }
      )
    }

    // Create NFT pass
    const pass = await db.nFT.create({
      data: {
        ownerId: session.user.id,
        tokenId: `pass_${Date.now()}`,
        type: 'PASS',
        name,
        description: description || '',
        price,
        status: 'MINTED',
        metadata: JSON.stringify(metadata || {})
      }
    })

    return NextResponse.json({
      success: true,
      pass: {
        id: pass.id,
        type: pass.type,
        name: pass.name,
        price: pass.price,
        description: pass.description,
        status: pass.status,
        tokenId: pass.tokenId,
        createdAt: pass.createdAt.getTime(),
        metadata: pass.metadata
      }
    })

  } catch (error) {
    console.error('Error creating NFT pass:', error)
    return NextResponse.json(
      { error: 'Failed to create NFT pass' },
      { status: 500 }
    )
  }
}
