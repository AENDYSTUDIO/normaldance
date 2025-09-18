import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// Validation schema for transferring NFT
const transferSchema = z.object({
  nftId: z.string().min(1),
  fromAddress: z.string().min(1),
  toAddress: z.string().min(1),
  quantity: z.number().min(1).default(1),
})

// POST /api/nft/transfer - Transfer NFT between addresses
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nftId, fromAddress, toAddress, quantity } = transferSchema.parse(body)

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

    // Check if sender has enough NFT quantity
    const senderOwnership = await db.nftOwner.findMany({
      where: {
        nftId: nftId,
        ownerAddress: fromAddress,
      }
    })

    const senderTotalQuantity = senderOwnership.reduce((sum, ownership) => sum + ownership.quantity, 0)

    if (senderTotalQuantity < quantity) {
      return NextResponse.json(
        { error: 'Insufficient NFT balance for transfer' },
        { status: 400 }
      )
    }

    // Simulate blockchain transfer process
    // In a real implementation, this would interact with Solana
    const transferTransaction = {
      signature: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      blockhash: `blockhash_${Date.now()}`,
      slot: Math.floor(Date.now() / 1000),
    }

    // Process the transfer
    let remainingQuantity = quantity
    const transferRecords: any[] = []

    // First, remove from sender
    for (const ownership of senderOwnership) {
      if (remainingQuantity <= 0) break

      const transferAmount = Math.min(ownership.quantity, remainingQuantity)
      
      if (transferAmount === ownership.quantity) {
        // Transfer the entire ownership record
        await db.nftOwner.update({
          where: { id: ownership.id },
          data: {
            ownerAddress: toAddress,
            transferredAt: new Date(),
            transactionSignature: transferTransaction.signature,
          }
        })
        transferRecords.push({
          from: fromAddress,
          to: toAddress,
          quantity: transferAmount,
          ownershipId: ownership.id,
        })
        remainingQuantity -= transferAmount
      } else {
        // Split the ownership record
        await db.nftOwner.update({
          where: { id: ownership.id },
          data: {
            quantity: ownership.quantity - transferAmount,
          }
        })

        const newOwnership = await db.nftOwner.create({
          data: {
            nftId: nftId,
            ownerAddress: toAddress,
            quantity: transferAmount,
            mintedAt: new Date(),
            transactionSignature: transferTransaction.signature,
            transferredAt: new Date(),
          }
        })
        
        transferRecords.push({
          from: fromAddress,
          to: toAddress,
          quantity: transferAmount,
          ownershipId: newOwnership.id,
        })
        remainingQuantity -= transferAmount
      }
    }

    // Update NFT transfer count
    await db.nft.update({
      where: { id: nftId },
      data: {
        transferCount: { increment: quantity },
        lastTransferredAt: new Date(),
      }
    })

    // Record transfer history
    await db.nftTransfer.create({
      data: {
        nftId: nftId,
        fromAddress: fromAddress,
        toAddress: toAddress,
        quantity: quantity,
        transactionSignature: transferTransaction.signature,
        blockhash: transferTransaction.blockhash,
        slot: transferTransaction.slot,
        transferredAt: new Date(),
      }
    })

    return NextResponse.json({
      message: 'NFT transferred successfully',
      transaction: transferTransaction,
      transferRecords,
      quantity,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error transferring NFT:', error)
    return NextResponse.json(
      { error: 'Failed to transfer NFT' },
      { status: 500 }
    )
  }
}