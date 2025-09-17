"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'

export function NFTMemorialMint() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { publicKey, sendTransaction } = useWallet()

  const MEMORIAL_PRICE = 0.01 * LAMPORTS_PER_SOL // 0.01 SOL

  const handleMint = async () => {
    if (!publicKey || !name || !message) return
    
    setIsLoading(true)
    try {
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!)
      
      const transaction = new Transaction()
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_WALLET!),
          lamports: MEMORIAL_PRICE,
        })
      )
      
      await sendTransaction(transaction, connection)
      
      const response = await fetch('/api/grave/mint-memorial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message, owner: publicKey.toString() }),
      })
      
      if (response.ok) {
        alert('NFT мемориал создан!')
        setName('')
        setMessage('')
      }
    } catch (error) {
      alert('Ошибка при создании мемориала')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h3 className="text-xl font-bold">Создать NFT Мемориал</h3>
      <p className="text-sm text-gray-600">Цена: 0.01 SOL</p>
      
      <Input
        placeholder="Имя для мемориала"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      
      <Textarea
        placeholder="Сообщение или память..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
      />
      
      <Button 
        onClick={handleMint}
        disabled={!publicKey || !name || !message || isLoading}
        className="w-full bg-gradient-to-r from-gray-700 to-gray-900"
      >
        {isLoading ? 'Создание...' : '🪦 Создать мемориал за 0.01 SOL'}
      </Button>
    </div>
  )
}