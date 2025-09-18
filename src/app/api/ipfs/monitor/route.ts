import { NextRequest, NextResponse } from 'next/server'
import { monitorFileHealth, getFileFromBestGateway } from '@/lib/ipfs-enhanced'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cid = searchParams.get('cid')
    const action = searchParams.get('action') // 'health' or 'download'

    if (!cid) {
      return NextResponse.json({ error: 'CID is required' }, { status: 400 })
    }

    switch (action) {
      case 'health':
        // Мониторинг здоровья файла
        const health = await monitorFileHealth(cid)
        return NextResponse.json({
          success: true,
          data: {
            cid,
            health: health.health,
            replicationFactor: health.replicationFactor,
            lastChecked: health.lastChecked,
            recommendations: getRecommendations(health)
          }
        })

      case 'download':
        // Скачивание файла с лучшего шлюза
        try {
          const response = await getFileFromBestGateway(cid)
          
          // Создаем новый Response с тем же содержимым, но с правильными заголовками
          const headers = new Headers()
          response.headers.forEach((value, key) => {
            headers.set(key, value)
          })
          
          // Добавляем кастомные заголовки
          headers.set('X-Source-Gateway', 'best-available')
          headers.set('X-CID', cid)
          
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers
          })
        } catch (error) {
          return NextResponse.json(
            { error: 'File not available for download' },
            { status: 404 }
          )
        }

      default:
        // Базовая информация о файле
        const healthInfo = await monitorFileHealth(cid)
        return NextResponse.json({
          success: true,
          data: {
            cid,
            health: healthInfo.health,
            replicationFactor: healthInfo.replicationFactor,
            lastChecked: healthInfo.lastChecked,
            gateways: [
              'https://ipfs.io/ipfs/' + cid,
              'https://gateway.pinata.cloud/ipfs/' + cid,
              'https://cloudflare-ipfs.com/ipfs/' + cid
            ]
          }
        })
    }

  } catch (error) {
    console.error('IPFS monitor error:', error)
    return NextResponse.json(
      { error: 'Failed to monitor file' },
      { status: 500 }
    )
  }
}

// Функция для получения рекомендаций на основе состояния файла
function getRecommendations(health: {
  health: 'healthy' | 'degraded' | 'unhealthy'
  replicationFactor: number
  lastChecked: Date
}): string[] {
  const recommendations: string[] = []

  switch (health.health) {
    case 'healthy':
      recommendations.push('File is well-replicated and available')
      recommendations.push('No immediate action required')
      break

    case 'degraded':
      recommendations.push('File has limited replication')
      recommendations.push('Consider re-uploading for better redundancy')
      recommendations.push('Monitor availability closely')
      break

    case 'unhealthy':
      recommendations.push('File is not available on any gateway')
      recommendations.push('Immediate re-upload required')
      recommendations.push('Check network connectivity')
      break
  }

  if (health.replicationFactor < 2) {
    recommendations.push('Increase replication factor to at least 2')
  }

  return recommendations
}