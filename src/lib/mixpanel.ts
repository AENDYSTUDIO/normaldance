import mixpanel from 'mixpanel-browser'

let isInitialized = false

export function initMixpanel(token?: string) {
  if (isInitialized) return
  const mixpanelToken = token || process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
  if (!mixpanelToken) return
  try {
    mixpanel.init(mixpanelToken, { debug: process.env.NODE_ENV !== 'production' })
    isInitialized = true
  } catch (_) {
    // silent per project style
  }
}

export function trackEvent(eventName: string, props?: Record<string, any>) {
  try {
    mixpanel.track(eventName, props)
  } catch (_) {}
}

export function identify(userId?: string) {
  if (!userId) return
  try {
    mixpanel.identify(userId)
  } catch (_) {}
}

export function trackPageView(path: string) {
  trackEvent('Page View', { path })
}


