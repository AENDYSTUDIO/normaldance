"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'

interface DonateButtonProps {
  artistWallet: string
  artistName: string
}

export function DonateButton({ artistWallet, artistName }: DonateButtonProps) {
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { publicKey, sendTransaction } = useWallet()

  const handleDonate = async () => {
    if (!publicKey || !amount) return
    
    setIsLoading(true)
    try {
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!)
      const donationAmount = parseFloat(amount) * LAMPORTS_PER_SOL
      const platformFee = donationAmount * 0.02 // 2% комиссия
      const artistAmount = donationAmount - platformFee
      
      const transaction = new Transaction()
      
      // Перевод артисту
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(artistWallet),
          lamports: artistAmount,
        })
      )
      
      // Комиссия платформе
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_WALLET!),
          lamports: platformFee,
        })
      )
      
      await sendTransaction(transaction, connection)
      alert(`Донат ${amount} SOL отправлен ${artistName}!`)
    } catch (error) {
      console.error('Donation failed:', error)
      alert('Ошибка при отправке доната')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          💝 Донат
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Поддержать {artistName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="number"
            placeholder="Сумма в SOL"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button 
            onClick={handleDonate} 
            disabled={!publicKey || !amount || isLoading}
            className="w-full"
          >
            {isLoading ? 'Отправка...' : `Донат ${amount || '0'} SOL`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}