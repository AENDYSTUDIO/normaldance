'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Динамический импорт компонента с отключенным SSR
const SignUpForm = dynamic(() => import('./signup-form'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p>Загрузка...</p>
      </div>
    </div>
  )
})

export default function SignUpPage() {
  return <SignUpForm />
}