import { NextResponse } from 'next/server'
import { monitor } from '@/lib/monitoring'

// POST /api/analytics - Collect analytics events
export async function POST(request: Request) {
  try {
    const { event, properties, userId, timestamp } = await request.json()
    
    // Валидация
    if (!event || typeof event !== 'string') {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 })
    }
    
    // Сохраняем в мониторинг
    monitor.increment(`analytics.${event}`)
    
    // В продакшене здесь будет сохранение в БД
    console.log('Analytics event:', { event, properties, userId, timestamp })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    monitor.captureError(error as Error, { context: 'analytics' })
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}

// GET /api/analytics - Get analytics dashboard
export async function GET() {
  try {
    const stats = monitor.getStats()
    const health = monitor.getHealth()
    
    return NextResponse.json({
      health,
      metrics: stats.metrics,
      uptime: stats.uptime,
      timestamp: Date.now()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get analytics' }, { status: 500 })
  }
}