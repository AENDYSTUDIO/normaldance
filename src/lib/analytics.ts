// Простая аналитика без внешних сервисов
class SimpleAnalytics {
  private events: Array<{
    event: string
    properties: any
    timestamp: number
    userId?: string
  }> = []
  
  // Отправка события
  track(event: string, properties: any = {}, userId?: string) {
    this.events.push({
      event,
      properties,
      timestamp: Date.now(),
      userId
    })
    
    // Ограничиваем размер
    if (this.events.length > 10000) {
      this.events = this.events.slice(-5000)
    }
    
    // В продакшене отправляем на сервер
    if (typeof window !== 'undefined') {
      this.sendToServer(event, properties, userId)
    }
  }
  
  private async sendToServer(event: string, properties: any, userId?: string) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, properties, userId, timestamp: Date.now() })
      })
    } catch (error) {
      console.warn('Analytics failed:', error)
    }
  }
  
  // Ключевые метрики
  getMetrics(timeframe = 24 * 60 * 60 * 1000) { // 24 часа
    const cutoff = Date.now() - timeframe
    const recentEvents = this.events.filter(e => e.timestamp > cutoff)
    
    return {
      totalEvents: recentEvents.length,
      uniqueUsers: new Set(recentEvents.map(e => e.userId).filter(Boolean)).size,
      topEvents: this.getTopEvents(recentEvents),
      userActivity: this.getUserActivity(recentEvents)
    }
  }
  
  private getTopEvents(events: any[]) {
    const counts: Record<string, number> = {}
    events.forEach(e => {
      counts[e.event] = (counts[e.event] || 0) + 1
    })
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
  }
  
  private getUserActivity(events: any[]) {
    const activity: Record<string, number> = {}
    events.forEach(e => {
      if (e.userId) {
        activity[e.userId] = (activity[e.userId] || 0) + 1
      }
    })
    
    return Object.keys(activity).length
  }
}

export const analytics = new SimpleAnalytics()

// Хуки для компонентов
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackPageView: (page: string) => analytics.track('page_view', { page }),
    trackClick: (element: string) => analytics.track('click', { element }),
    trackPlay: (trackId: string) => analytics.track('track_play', { trackId }),
    trackUpload: (trackId: string) => analytics.track('track_upload', { trackId })
  }
}