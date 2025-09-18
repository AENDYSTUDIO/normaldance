import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// Validation schema for minting NFT
const mintSchema = z.object({
  nftId: z.string().min(1),
  recipientAddress: z.string().min(1),
  quantity: z.number().min(1).default(1),
})

// POST /api/nft/mint - Mint NFT to a specific address
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nftId, recipientAddress, quantity } = mintSchema.parse(body)

    // Find the NFT
    const nft = await db.nft.findUnique({
      where: { id: nftId },
      include: {
        artist: true,
      }
    })

    if (!nft) {
      return NextResponse.json(
        { error: 'NFT not found' },
        { status: 404 }
      )
    }

    // Check if NFT is published
    if (!nft.isPublished) {
      return NextResponse.json(
        { error: 'NFT is not published for minting' },
        { status: 400 }
      )
    }

    // Check if there's enough supply
    const totalMinted = await db.nftOwner.count({
      where: { nftId: nftId }
    })

    if (totalMinted + quantity > nft.supply) {
      return NextResponse.json(
        { error: 'Not enough supply available' },
        { status: 400 }
      )
    }

    // Simulate blockchain minting process
    // In a real implementation, this would interact with Solana
    const mintTransaction = {
      signature: `mint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      blockhash: `blockhash_${Date.now()}`,
      slot: Math.floor(Date.now() / 1000),
    }

    // Create NFT ownership records
    const ownershipRecords: any[] = []
    for (let i = 0; i < quantity; i++) {
      const ownership = await db.nftOwner.create({
        data: {
          nftId: nftId,
          ownerAddress: recipientAddress,
          mintedAt: new Date(),
          transactionSignature: mintTransaction.signature,
          quantity: 1,
        }
      })
      ownershipRecords.push(ownership)
    }

    // Update NFT mint count
    await db.nft.update({
      where: { id: nftId },
      data: {
        mintCount: { increment: quantity },
        lastMintedAt: new Date(),
      }
    })

    // Award minting reward to artist (royalty)
    const royaltyAmount = nft.price ? Math.floor((nft.price * (nft.royaltyPercentage / 100)) * quantity) : 0
    if (royaltyAmount > 0) {
      // Apply deflationary model for royalty calculation (2% burn)
      const burnAmount = Math.floor(royaltyAmount * 0.02) // 2% burn
      const royaltyAfterDeflation = royaltyAmount - burnAmount
      
      await db.reward.create({
        data: {
          userId: nft.artistId,
          type: 'NFT',
          amount: royaltyAfterDeflation,
          reason: `NFT minting royalty: ${nft.title} (${quantity} units)`
        }
      })

      // Update artist balance
      await db.user.update({
        where: { id: nft.artistId },
        data: { balance: { increment: royaltyAfterDeflation } }
      })
    }

    return NextResponse.json({
      message: 'NFT minted successfully',
      transaction: mintTransaction,
      ownershipRecords,
      quantity,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error minting NFT:', error)
    return NextResponse.json(
      { error: 'Failed to mint NFT' },
      { status: 500 }
    )
  }
}