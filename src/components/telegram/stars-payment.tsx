"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface StarsPaymentProps {
  amount: number
  description: string
  onSuccess?: () => void
}

export function StarsPayment({ amount, description, onSuccess }: StarsPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStarsPayment = async () => {
    setIsLoading(true)
    try {
      // @ts-ignore
      if (window.Telegram?.WebApp) {
        // @ts-ignore
        window.Telegram.WebApp.showInvoice({
          title: 'NORMAL DANCE',
          description,
          payload: JSON.stringify({ type: 'stars', amount }),
          provider_token: '',
          start_parameter: 'stars_payment',
          currency: 'XTR', // Telegram Stars
          prices: [{ label: description, amount }],
        }, (status: string) => {
          if (status === 'paid') {
            onSuccess?.()
            alert('Оплата Stars прошла успешно!')
          }
        })
      } else {
        alert('Доступно только в Telegram Mini App')
      }
    } catch (error) {
      alert('Ошибка при оплате Stars')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleStarsPayment}
      disabled={isLoading}
      className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
    >
      {isLoading ? 'Оплата...' : `⭐ Оплатить ${amount} Stars`}
    </Button>
  )
}