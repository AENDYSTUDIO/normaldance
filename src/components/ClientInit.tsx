'use client'

import { useEffect } from 'react'
import { initMixpanel, trackPageView } from '@/lib/mixpanel'

export function ClientInit() {
  useEffect(() => {
    initMixpanel()
    if (typeof window !== 'undefined') {
      trackPageView(window.location.pathname)
    }
  }, [])
  return null
}


