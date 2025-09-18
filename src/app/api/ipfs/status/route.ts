import { NextRequest } from 'next/server'
import { backupSystem } from '@/lib/ipfs-enhanced'
import { checkFileAvailabilityOnMultipleGateways } from '@/lib/ipfs-enhanced'

// Интерфейс для статуса бэкапов
interface BackupStatus {
  status: 'OK' | 'DEGRADED' | 'FAILED'
  lastSuccessfulBackup?: Date
  totalBackups: number
  healthyBackups: number
  failedBackups: number
  totalSize: number
  gatewayHealth: { [gateway: string]: boolean }
  issues: string[]
  recommendations: string[]
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const detailed = searchParams.get('detailed') === 'true'
    
    // Получаем отчет о бэкапах
    const report = backupSystem.generateBackupReport()
    const allBackups = backupSystem.getAllBackups()
    
    // Проверяем здоровье gateway
    const gatewayHealth: { [gateway: string]: boolean } = {}
    const gateways = [
      'https://ipfs.io',
      'https://gateway.pinata.cloud', 
      'https://cloudflare-ipfs.com'
    ]
    
    for (const gateway of gateways) {
      try {
        const response = await fetch(`${gateway}/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        })
        gatewayHealth[gateway] = response.ok || response.status === 404
      } catch {
        gatewayHealth[gateway] = false
      }
    }
    
    const healthyGateways = Object.values(gatewayHealth).filter(h => h).length
    
    // Определяем общий статус
    let status: 'OK' | 'DEGRADED' | 'FAILED' = 'OK'
    const issues: string[] = []
    const recommendations: string[] = []
    
    // Проверки для определения статуса
    if (report.failedBackups > report.totalBackups * 0.1) {
      status = 'DEGRADED'
      issues.push(`Высокий процент неудачных бэкапов: ${report.failedBackups}/${report.totalBackups}`)
    }
    
    if (healthyGateways < 2) {
      status = 'DEGRADED'
      issues.push(`Недостаточно здоровых gateway: ${healthyGateways}/3`)
      recommendations.push('Проверьте доступность IPFS gateway')
    }
    
    if (report.totalBackups === 0) {
      status = 'FAILED'
      issues.push('Нет созданных бэкапов')
      recommendations.push('Создайте первый бэкап')
    }
    
    if (report.failedBackups === report.totalBackups && report.totalBackups > 0) {
      status = 'FAILED'
      issues.push('Все бэкапы неудачные')
      recommendations.push('Проверьте конфигурацию IPFS и Pinata')
    }
    
    // Проверяем свежесть последнего бэкапа
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    if (report.newestBackup && report.newestBackup < oneDayAgo) {
      if (status === 'OK') status = 'DEGRADED'
      issues.push('Последний бэкап старше 24 часов')
      recommendations.push('Запустите новый цикл бэкапирования')
    }
    
    const backupStatus: BackupStatus = {
      status,
      lastSuccessfulBackup: report.newestBackup,
      totalBackups: report.totalBackups,
      healthyBackups: report.completedBackups,
      failedBackups: report.failedBackups,
      totalSize: report.totalSize,
      gatewayHealth,
      issues,
      recommendations
    }
    
    // Детальная информация если запрошена
    if (detailed) {
      const detailedBackups = await Promise.all(
        allBackups.slice(-10).map(async (backup) => {
          const verification = await backupSystem.verifyBackup(backup.id)
          return {
            id: backup.id,
            timestamp: backup.timestamp,
            status: backup.status,
            filesCount: backup.files.length,
            size: backup.totalSize,
            verification
          }
        })
      )
      
      return Response.json({
        ...backupStatus,
        recentBackups: detailedBackups
      })
    }
    
    return Response.json(backupStatus)
    
  } catch (error) {
    console.error('Failed to get backup status:', error)
    return Response.json({
      status: 'FAILED',
      issues: ['Ошибка при получении статуса бэкапов'],
      recommendations: ['Проверьте работоспособность системы бэкапов']
    }, { status: 500 })
  }
}

// Создание нового бэкапа
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { files, description } = body
    
    if (!files || !Array.isArray(files)) {
      return new Response('Files array required', { status: 400 })
    }
    
    // Создаем бэкап
    const manifest = await backupSystem.createBackup(
      files.map((file: any) => ({
        path: file.path,
        content: Buffer.from(file.content, 'base64') // Ожидаем base64
      })),
      description
    )
    
    return Response.json({
      success: true,
      backupId: manifest.id,
      status: manifest.status,
      filesCount: manifest.files.length,
      totalSize: manifest.totalSize
    })
    
  } catch (error) {
    console.error('Failed to create backup:', error)
    return new Response('Failed to create backup', { status: 500 })
  }
}

// Верификация конкретного бэкапа
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { backupId } = body
    
    if (!backupId) {
      return new Response('Backup ID required', { status: 400 })
    }
    
    const verification = await backupSystem.verifyBackup(backupId)
    
    return Response.json({
      backupId,
      verification,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Failed to verify backup:', error)
    return new Response('Failed to verify backup', { status: 500 })
  }
}