import { NextRequest } from 'next/server'
import { PublicKey } from '@solana/web3.js'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

export async function POST(req: NextRequest) {
  try {
    const { publicKey, signature, message } = await req.json()
    
    if (!publicKey || !signature || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    try {
      new PublicKey(publicKey)
    } catch {
      return Response.json({ error: 'Invalid public key' }, { status: 400 })
    }

    let user = await prisma.user.findUnique({
      where: { walletAddress: publicKey }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: publicKey,
          username: `user_${publicKey.slice(0, 8)}`,
          displayName: `User ${publicKey.slice(0, 8)}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    const token = jwt.sign(
      { userId: user.id, walletAddress: publicKey },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return Response.json({
      success: true,
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        displayName: user.displayName
      }
    })

  } catch (error) {
    console.error('Auth error:', error)
    return Response.json({ error: 'Authentication failed' }, { status: 500 })
  }
}