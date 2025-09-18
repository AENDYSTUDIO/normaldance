import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { Connection, PublicKey } from '@solana/web3.js'
import { prisma } from '@/lib/db'
import { validateDonation } from '@/lib/data-validation'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com')

function getUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  
  try {
    const token = authHeader.split(' ')[1]
    return jwt.verify(token, JWT_SECRET) as any
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { artistWallet, amount, message, signature } = body

    // Validate donation data
    const validatedData = validateDonation({ artistWallet, amount, message })

    if (!signature) {
      return Response.json({ error: 'Transaction signature required' }, { status: 400 })
    }

    // Verify transaction on Solana
    let transactionStatus
    try {
      transactionStatus = await connection.getSignatureStatus(signature)
      if (!transactionStatus.value) {
        return Response.json({ error: 'Transaction not found' }, { status: 400 })
      }
      if (transactionStatus.value.err) {
        return Response.json({ error: 'Transaction failed' }, { status: 400 })
      }
    } catch (error) {
      return Response.json({ error: 'Failed to verify transaction' }, { status: 500 })
    }

    // Find artist
    const artist = await prisma.user.findUnique({
      where: { walletAddress: artistWallet }
    })

    if (!artist) {
      return Response.json({ error: 'Artist not found' }, { status: 404 })
    }

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        fromUserId: user.userId,
        toUserId: artist.id,
        amount: validatedData.amount,
        message: validatedData.message,
        signature,
        status: 'completed',
        createdAt: new Date()
      },
      include: {
        fromUser: {
          select: { username: true, displayName: true, walletAddress: true }
        },
        toUser: {
          select: { username: true, displayName: true, walletAddress: true }
        }
      }
    })

    return Response.json({
      success: true,
      donation
    })

  } catch (error) {
    console.error('Donation error:', error)
    if (error.name === 'ValidationError') {
      return Response.json({ error: error.userMessage }, { status: 400 })
    }
    return Response.json({ error: 'Donation failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'sent' or 'received'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (type === 'sent') {
      where.fromUserId = user.userId
    } else if (type === 'received') {
      where.toUserId = user.userId
    } else {
      where.OR = [
        { fromUserId: user.userId },
        { toUserId: user.userId }
      ]
    }

    const donations = await prisma.donation.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        fromUser: {
          select: { username: true, displayName: true, walletAddress: true }
        },
        toUser: {
          select: { username: true, displayName: true, walletAddress: true }
        }
      }
    })

    const total = await prisma.donation.count({ where })

    return Response.json({
      donations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Get donations error:', error)
    return Response.json({ error: 'Failed to fetch donations' }, { status: 500 })
  }
}