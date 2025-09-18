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

// Environment detection
const isBrowser = typeof window !== 'undefined'
const isNode = typeof process !== 'undefined' && process.versions?.node

// Browser-safe fetch with timeout
async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  if (isBrowser) {
    return fetch(url, { ...options, signal: AbortSignal.timeout(8000) as any })
  } else {
    // Node.js environment - use node-fetch or undici
    const { fetch: nodeFetch } = await import('undici')
    return nodeFetch(url, options)
  }
}

// Browser-safe File handling
function createFileFromBuffer(buffer: Buffer, filename: string, mimeType: string): File | Buffer {
  if (isBrowser) {
    return new File([buffer], filename, { type: mimeType })
  } else {
    return buffer
  }
}

// Оптимизированная загрузка файла с репликацией
export async function uploadWithReplication(
  file: File | Buffer,
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
  file: File | Buffer,
  metadata: IPFSTrackMetadata,
  chunkSize: number
): Promise<UploadResult> {
  try {
    const fileSize = isBrowser ? (file as File).size : (file as Buffer).length
    const totalChunks = Math.ceil(fileSize / chunkSize)
    const chunks: Uint8Array[] = []

    // Чанкуем файл
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, fileSize)
      
      let chunk: Uint8Array
      if (isBrowser) {
        const fileChunk = (file as File).slice(start, end)
        const arrayBuffer = await fileChunk.arrayBuffer()
        chunk = new Uint8Array(arrayBuffer)
      } else {
        chunk = new Uint8Array((file as Buffer).slice(start, end))
      }
      chunks.push(chunk)
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
      size: fileSize,
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
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await safeFetch(url, { 
        method: 'HEAD', 
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
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
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await safeFetch(url, { 
        method: 'HEAD', 
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
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

  // Пробуем шлюзы в порядке приоритета с ограничением числа попыток
  const fetchWithRetry = async (url: string, tries = 3): Promise<Response> => {
    for (let i = 0; i < tries; i++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000)
        
        const response = await fetch(url, { signal: controller.signal })
        clearTimeout(timeoutId)
        return response
      } catch (e) {
        if (i === tries - 1) throw e
      }
    }
    throw new Error('IPFS gateways exhausted')
  }

  for (const gateway of GATEWAYS) {
    try {
      const url = `${gateway}/ipfs/${cid}`
      const response = await fetchWithRetry(url, 3)
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

// Интерфейс для манифеста бэкапа
export interface BackupManifest {
  id: string
  timestamp: Date
  files: BackupFile[]
  totalSize: number
  status: 'pending' | 'completed' | 'failed' | 'partial'
  retryCount: number
  errors: string[]
  metadata: {
    version: string
    source: string
    description?: string
  }
}

export interface BackupFile {
  path: string
  cid: string
  size: number
  status: 'pending' | 'uploaded' | 'failed'
  retryCount: number
  error?: string
  gateways: string[]
}

// Система бэкапов с манифестом
export class IPFSBackupSystem {
  private manifests = new Map<string, BackupManifest>()
  private maxRetries = 3
  private retryDelay = 2000

  // Создание бэкапа с манифестом
  async createBackup(
    files: { path: string; content: File | Buffer | string }[],
    description?: string
  ): Promise<BackupManifest> {
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const manifest: BackupManifest = {
      id: backupId,
      timestamp: new Date(),
      files: [],
      totalSize: 0,
      status: 'pending',
      retryCount: 0,
      errors: [],
      metadata: {
        version: '1.0',
        source: 'normaldance-app',
        description
      }
    }

    this.manifests.set(backupId, manifest)

    try {
      // Загружаем файлы с ретраями
      for (const file of files) {
        const backupFile = await this.uploadFileWithRetry(file.path, file.content)
        manifest.files.push(backupFile)
        manifest.totalSize += backupFile.size
      }

      // Загружаем сам манифест
      const manifestCid = await this.uploadManifest(manifest)
      console.log(`Backup manifest uploaded: ${manifestCid}`)

      manifest.status = manifest.files.every(f => f.status === 'uploaded') ? 'completed' : 'partial'
      
      return manifest
    } catch (error) {
      manifest.status = 'failed'
      manifest.errors.push(`Backup failed: ${error}`)
      throw error
    }
  }

  // Загрузка файла с ретраями
  private async uploadFileWithRetry(
    path: string, 
    content: File | Buffer | string
  ): Promise<BackupFile> {
    const backupFile: BackupFile = {
      path,
      cid: '',
      size: 0,
      status: 'pending',
      retryCount: 0,
      gateways: []
    }

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        backupFile.retryCount = attempt
        
        // Конвертируем content в нужный формат
        let fileData: Buffer
        if (content instanceof File) {
          fileData = Buffer.from(await content.arrayBuffer())
        } else if (typeof content === 'string') {
          fileData = Buffer.from(content, 'utf-8')
        } else {
          fileData = content
        }

        backupFile.size = fileData.length

        // Загружаем через существующую систему
        const metadata: IPFSTrackMetadata = {
          title: path,
          artist: 'system',
          genre: 'backup',
          duration: 0,
          releaseDate: new Date().toISOString(),
          isExplicit: false,
          fileSize: fileData.length,
          mimeType: 'application/octet-stream'
        }

        // Создаем временный File объект
        const tempFile = new File([fileData], path, { type: 'application/octet-stream' })
        const result = await uploadWithReplication(tempFile, metadata, {
          replicateToGateways: GATEWAYS,
          enableFilecoin: false
        })

        backupFile.cid = result.cid
        backupFile.status = 'uploaded'
        backupFile.gateways = result.gateways
        
        console.log(`File uploaded successfully: ${path} -> ${result.cid}`)
        return backupFile
        
      } catch (error) {
        backupFile.error = `Attempt ${attempt + 1}: ${error}`
        console.warn(`Upload attempt ${attempt + 1} failed for ${path}:`, error)
        
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)))
        }
      }
    }

    backupFile.status = 'failed'
    return backupFile
  }

  // Загрузка манифеста
  private async uploadManifest(manifest: BackupManifest): Promise<string> {
    const manifestJson = JSON.stringify(manifest, null, 2)
    const manifestBuffer = Buffer.from(manifestJson, 'utf-8')
    
    const ipfsResult = await import('./ipfs')
    const { ipfsClient } = ipfsResult
    const result = await ipfsClient.add(manifestBuffer)
    
    return result.cid.toString()
  }

  // Восстановление из бэкапа
  async restoreFromBackup(manifestCid: string): Promise<{ [path: string]: Buffer }> {
    try {
      // Получаем манифест
      const manifestResponse = await getFileFromBestGateway(manifestCid)
      const manifestJson = await manifestResponse.text()
      const manifest: BackupManifest = JSON.parse(manifestJson)
      
      const restoredFiles: { [path: string]: Buffer } = {}
      
      // Восстанавливаем каждый файл
      for (const file of manifest.files) {
        if (file.status === 'uploaded') {
          try {
            const fileResponse = await getFileFromBestGateway(file.cid)
            const fileBuffer = Buffer.from(await fileResponse.arrayBuffer())
            restoredFiles[file.path] = fileBuffer
            console.log(`File restored: ${file.path}`)
          } catch (error) {
            console.error(`Failed to restore file ${file.path}:`, error)
          }
        }
      }
      
      return restoredFiles
    } catch (error) {
      console.error('Failed to restore from backup:', error)
      throw error
    }
  }

  // Получение статуса бэкапа
  getBackupStatus(backupId: string): BackupManifest | null {
    return this.manifests.get(backupId) || null
  }

  // Получение всех бэкапов
  getAllBackups(): BackupManifest[] {
    return Array.from(this.manifests.values())
  }

  // Проверка целостности бэкапа
  async verifyBackup(backupId: string): Promise<{
    valid: boolean
    issues: string[]
    availableFiles: number
    totalFiles: number
  }> {
    const manifest = this.manifests.get(backupId)
    if (!manifest) {
      return {
        valid: false,
        issues: ['Backup manifest not found'],
        availableFiles: 0,
        totalFiles: 0
      }
    }

    const issues: string[] = []
    let availableFiles = 0

    for (const file of manifest.files) {
      try {
        const availability = await checkFileAvailabilityOnMultipleGateways(file.cid)
        if (availability.available) {
          availableFiles++
        } else {
          issues.push(`File not available: ${file.path} (${file.cid})`)
        }
      } catch (error) {
        issues.push(`Error checking file ${file.path}: ${error}`)
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      availableFiles,
      totalFiles: manifest.files.length
    }
  }

  // Генерация отчета о бэкапах
  generateBackupReport(): {
    totalBackups: number
    completedBackups: number
    failedBackups: number
    totalSize: number
    oldestBackup?: Date
    newestBackup?: Date
  } {
    const backups = Array.from(this.manifests.values())
    
    return {
      totalBackups: backups.length,
      completedBackups: backups.filter(b => b.status === 'completed').length,
      failedBackups: backups.filter(b => b.status === 'failed').length,
      totalSize: backups.reduce((sum, b) => sum + b.totalSize, 0),
      oldestBackup: backups.length > 0 ? new Date(Math.min(...backups.map(b => b.timestamp.getTime()))) : undefined,
      newestBackup: backups.length > 0 ? new Date(Math.max(...backups.map(b => b.timestamp.getTime()))) : undefined
    }
  }
}

// Глобальный экземпляр системы бэкапов
export const backupSystem = new IPFSBackupSystem()

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