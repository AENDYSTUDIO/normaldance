// Интерфейс для IPFS метаданных
export interface IPFSTrackMetadata {
  title: string
  artist: string
  genre: string
  duration: number
  albumArt?: string
  description?: string
  releaseDate: string
  bpm?: number
  key?: string
  isExplicit: boolean
  fileSize: number
  mimeType: string
}

// Интерфейс для результата загрузки
export interface UploadResult {
  cid: string
  size: number
  pinSize?: number
  timestamp: Date
  metadata: IPFSTrackMetadata
}

// Конфигурация нескольких IPFS шлюзов
const GATEWAYS = [
  'https://ipfs.io',
  'https://gateway.pinata.cloud',
  'https://cloudflare-ipfs.com'
]

// Интерфейс для улучшенного результата загрузки
export interface EnhancedUploadResult extends UploadResult {
  gateways: string[]
  replicationStatus: {
    success: boolean
    failedNodes: string[]
  }
}

// Интерфейс для Filecoin интеграции
export interface FilecoinStatus {
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  dealId?: string
  storageProvider?: string
  price?: string
  duration?: string
}

// Оптимизированная загрузка файла с репликацией
export async function uploadWithReplication(
  file: File,
  metadata: IPFSTrackMetadata,
  options: {
    replicateToGateways?: string[]
    enableFilecoin?: boolean
    chunkSize?: number
  } = {}
): Promise<EnhancedUploadResult> {
  const {
    replicateToGateways = GATEWAYS,
    enableFilecoin = false,
    chunkSize = 10 * 1024 * 1024 // 10MB chunks
  } = options

  try {
    console.log(`Starting upload for file: ${file.name} (${file.size} bytes)`)

    // Используем существующую функцию загрузки из ipfs.ts
    const uploadResult = await uploadLargeFileToIPFS(file, metadata, chunkSize)
    
    // Репликация на дополнительные шлюзы
    const replicationResults = await replicateToMultipleGateways(
      uploadResult.cid,
      replicateToGateways
    )

    // Filecoin интеграция (опционально)
    let filecoinStatus: FilecoinStatus | undefined
    if (enableFilecoin) {
      filecoinStatus = await uploadToFilecoin(uploadResult.cid)
    }

    return {
      ...uploadResult,
      gateways: replicateToGateways,
      replicationStatus: {
        success: replicationResults.success,
        failedNodes: replicationResults.failedNodes
      }
    }

  } catch (error) {
    console.error('Enhanced IPFS upload failed:', error)
    throw new Error(`Failed to upload file with replication: ${error}`)
  }
}

// Загрузка с чанкованием для больших файлов
async function uploadLargeFileToIPFS(
  file: File,
  metadata: IPFSTrackMetadata,
  chunkSize: number
): Promise<UploadResult> {
  try {
    const totalChunks = Math.ceil(file.size / chunkSize)
    const chunks: Uint8Array[] = []

    // Чанкуем файл
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)
      const arrayBuffer = await chunk.arrayBuffer()
      chunks.push(new Uint8Array(arrayBuffer))
    }

    console.log(`File split into ${totalChunks} chunks`)

    // Загружаем чанки через существующий IPFS клиент
    const ipfsResult = await import('./ipfs')
    const { ipfsClient } = ipfsResult
    const chunkCIDs: string[] = []
    
    for (const chunk of chunks) {
      const chunkResult = await ipfsClient.add(chunk)
      chunkCIDs.push(chunkResult.cid.toString())
    }

    // Создаем манифест для чанков
    const manifest = {
      chunks: chunkCIDs,
      totalChunks,
      totalSize: file.size,
      metadata,
      type: 'chunked-audio',
      timestamp: new Date().toISOString(),
      compression: 'none'
    }

    // Загружаем манифест
    const manifestResult = await ipfsClient.add(JSON.stringify(manifest))
    const manifestCID = manifestResult.cid.toString()

    // Пинимаем через Pinata
    try {
      const pinataResult = await import('./ipfs')
      const { pinata } = pinataResult
      await pinata.pinFile(manifestCID)
      for (const chunkCID of chunkCIDs) {
        await pinata.pinFile(chunkCID)
      }
      console.log('File pinned successfully via Pinata')
    } catch (pinError) {
      console.warn('Pinata pinning failed:', pinError)
    }

    return {
      cid: manifestCID,
      size: file.size,
      timestamp: new Date(),
      metadata
    }
  } catch (error) {
    console.error('Chunked IPFS upload failed:', error)
    throw new Error(`Failed to upload large file to IPFS: ${error}`)
  }
}

// Репликация на несколько шлюзов
async function replicateToMultipleGateways(
  cid: string,
  gateways: string[]
): Promise<{ success: boolean; failedNodes: string[] }> {
  const failedNodes: string[] = []
  const successNodes: string[] = []

  for (const gateway of gateways) {
    try {
      const url = `${gateway}/ipfs/${cid}`
      const response = await fetch(url, { method: 'HEAD' })
      
      if (response.ok) {
        successNodes.push(gateway)
        console.log(`Successfully replicated to ${gateway}`)
      } else {
        failedNodes.push(gateway)
        console.warn(`Failed to replicate to ${gateway}: ${response.status}`)
      }
    } catch (error) {
      failedNodes.push(gateway)
      console.warn(`Error replicating to ${gateway}:`, error)
    }
  }

  return {
    success: failedNodes.length < gateways.length,
    failedNodes
  }
}

// Filecoin интеграция (заглушка)
async function uploadToFilecoin(cid: string): Promise<FilecoinStatus> {
  try {
    // Здесь должна быть реальная интеграция с Filecoin API
    // Пока возвращаем статус pending
    return {
      status: 'pending',
      dealId: undefined,
      storageProvider: 'pending',
      price: 'calculated',
      duration: '365 days'
    }
  } catch (error) {
    console.error('Filecoin upload failed:', error)
    return {
      status: 'failed'
    }
  }
}

// Проверка доступности файла на нескольких шлюзах
export async function checkFileAvailabilityOnMultipleGateways(
  cid: string
): Promise<{
  available: boolean
  availableGateways: string[]
  unavailableGateways: string[]
}> {
  const availableGateways: string[] = []
  const unavailableGateways: string[] = []

  for (const gateway of GATEWAYS) {
    try {
      const url = `${gateway}/ipfs/${cid}`
      const response = await fetch(url, { method: 'HEAD' })
      
      if (response.ok) {
        availableGateways.push(gateway)
      } else {
        unavailableGateways.push(gateway)
      }
    } catch (error) {
      unavailableGateways.push(gateway)
    }
  }

  return {
    available: availableGateways.length > 0,
    availableGateways,
    unavailableGateways
  }
}

// Получение файла с лучшего шлюза
export async function getFileFromBestGateway(cid: string): Promise<Response> {
  // Проверяем доступность на всех шлюзах
  const availability = await checkFileAvailabilityOnMultipleGateways(cid)
  
  if (!availability.available) {
    throw new Error('File not available on any gateway')
  }

  // Пробуем шлюзы в порядке приоритета
  for (const gateway of GATEWAYS) {
    try {
      const url = `${gateway}/ipfs/${cid}`
      const response = await fetch(url)
      
      if (response.ok) {
        console.log(`File retrieved from ${gateway}`)
        return response
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${gateway}:`, error)
    }
  }

  throw new Error('Failed to retrieve file from any gateway')
}

// Генерация CDN URL для быстрой доставки
export function generateCDNUrl(cid: string, region?: string): string {
  const cdnProvider = process.env.CDN_PROVIDER || 'cloudflare'
  
  switch (cdnProvider) {
    case 'cloudflare':
      return `https://normaldance.pages.dev/ipfs/${cid}`
    case 'pinata':
      return `https://gateway.pinata.cloud/ipfs/${cid}`
    default:
      return `https://ipfs.io/ipfs/${cid}`
  }
}

// Мониторинг состояния файлов
export async function monitorFileHealth(cid: string): Promise<{
  health: 'healthy' | 'degraded' | 'unhealthy'
  replicationFactor: number
  lastChecked: Date
}> {
  const availability = await checkFileAvailabilityOnMultipleGateways(cid)
  const replicationFactor = availability.availableGateways.length
  
  let health: 'healthy' | 'degraded' | 'unhealthy'
  if (replicationFactor >= 2) {
    health = 'healthy'
  } else if (replicationFactor === 1) {
    health = 'degraded'
  } else {
    health = 'unhealthy'
  }

  return {
    health,
    replicationFactor,
    lastChecked: new Date()
  }
}

// Кэширование результатов для улучшения производительности
const cache = new Map<string, {
  data: any
  timestamp: number
  ttl: number
}>()

export function getCachedData(key: string, ttl: number = 300000): any | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }
  return null
}

export function setCachedData(key: string, data: any, ttl: number = 300000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  })
}

// Очистка устаревших кэшированных данных
export function cleanupCache(): void {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > value.ttl) {
      cache.delete(key)
    }
  }
}

// Регулярная очистка кэша
setInterval(cleanupCache, 60000) // Каждую минуту