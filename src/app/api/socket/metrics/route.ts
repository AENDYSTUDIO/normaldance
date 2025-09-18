import { NextRequest } from 'next/server'
import { getSocketMetrics } from '@/lib/socket'

export async function GET(req: NextRequest) {
  try {
    const metrics = getSocketMetrics()
    
    // Добавляем дополнительные метрики
    const enhancedMetrics = {
      ...metrics,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      performance: {
        latency: metrics.averageLatency,
        deliveryRate: metrics.deliveryRate,
        reconnectRate: metrics.reconnects / Math.max(metrics.totalConnections, 1)
      }
    }
    
    return Response.json(enhancedMetrics)
  } catch (error) {
    console.error('Failed to get socket metrics:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Сброс метрик (только для разработки)
    if (body.action === 'reset' && process.env.NODE_ENV === 'development') {
      // Здесь можно добавить логику сброса метрик
      return Response.json({ success: true, message: 'Metrics reset' })
    }
    
    return new Response('Invalid action', { status: 400 })
  } catch (error) {
    console.error('Socket metrics API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}