import { z } from 'zod'

// Базовые схемы
export const PublicKeySchema = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana public key')
export const TransactionSignatureSchema = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{87,88}$/, 'Invalid transaction signature')
export const IPFSHashSchema = z.string().regex(/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/, 'Invalid IPFS hash')

// Схемы для пользователей
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email().optional(),
  walletAddress: PublicKeySchema.optional(),
  displayName: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  isVerified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
})

// Схемы для треков
export const TrackMetadataSchema = z.object({
  title: z.string().min(1).max(100),
  artist: z.string().min(1).max(50),
  genre: z.enum(['electronic', 'hip-hop', 'rock', 'pop', 'jazz', 'classical', 'ambient', 'techno', 'house', 'other']),
  duration: z.number().positive().max(3600), // максимум 1 час
  albumArt: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  releaseDate: z.string().datetime(),
  bpm: z.number().positive().max(300).optional(),
  key: z.string().max(10).optional(),
  isExplicit: z.boolean().default(false),
  fileSize: z.number().positive().max(100 * 1024 * 1024), // максимум 100MB
  mimeType: z.enum(['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg'])
})

export const TrackUploadSchema = z.object({
  metadata: TrackMetadataSchema,
  file: z.object({
    name: z.string(),
    size: z.number().positive().max(100 * 1024 * 1024),
    type: z.string()
  }),
  ipfsHash: IPFSHashSchema.optional()
})

// Схемы для транзакций
export const DonationSchema = z.object({
  artistWallet: PublicKeySchema,
  amount: z.number().positive().max(1000), // максимум 1000 SOL
  message: z.string().max(200).optional(),
  anonymous: z.boolean().default(false)
})

export const StakingSchema = z.object({
  amount: z.number().positive().min(1).max(10000), // от 1 до 10000 NDT
  period: z.enum([30, 90, 180, 365]),
  autoRenew: z.boolean().default(false)
})

export const NFTMintSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(500),
  image: z.string().url().optional(),
  attributes: z.array(z.object({
    trait_type: z.string(),
    value: z.union([z.string(), z.number()])
  })).optional()
})

// Схемы для API запросов
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export const SearchSchema = z.object({
  query: z.string().min(1).max(100),
  type: z.enum(['tracks', 'artists', 'playlists', 'all']).default('all'),
  filters: z.object({
    genre: z.string().optional(),
    duration: z.object({
      min: z.number().optional(),
      max: z.number().optional()
    }).optional(),
    verified: z.boolean().optional()
  }).optional()
}).merge(PaginationSchema)

// Схемы для уведомлений
export const NotificationSchema = z.object({
  type: z.enum(['like', 'comment', 'follow', 'playlist_add', 'reward', 'achievement', 'system', 'marketing', 'security']),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  data: z.record(z.any()).optional(),
  expiresAt: z.date().optional()
})

// Схемы для плейлистов
export const PlaylistSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
  coverImage: z.string().url().optional(),
  tracks: z.array(z.string().uuid()).max(1000) // максимум 1000 треков
})

// Функции валидации с дружелюбными ошибками
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string,
    public userMessage: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Нормализация данных
export function normalizeUsername(username: string): string {
  return username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '')
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function normalizeTrackTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ')
}

// Валидация с дружелюбными сообщениями
export function validateUserProfile(data: unknown) {
  try {
    return UserProfileSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      const field = firstError.path.join('.')
      
      const userMessages: Record<string, string> = {
        'username': 'Имя пользователя должно содержать от 3 до 20 символов (только буквы, цифры и _)',
        'email': 'Введите корректный email адрес',
        'walletAddress': 'Некорректный адрес кошелька Solana',
        'displayName': 'Отображаемое имя не может быть пустым и должно быть не длиннее 50 символов',
        'bio': 'Описание не должно превышать 500 символов'
      }
      
      throw new ValidationError(
        firstError.message,
        field,
        firstError.code,
        userMessages[field] || 'Некорректные данные профиля'
      )
    }
    throw error
  }
}

export function validateTrackUpload(data: unknown) {
  try {
    return TrackUploadSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      const field = firstError.path.join('.')
      
      const userMessages: Record<string, string> = {
        'metadata.title': 'Название трека обязательно и не должно превышать 100 символов',
        'metadata.artist': 'Имя исполнителя обязательно и не должно превышать 50 символов',
        'metadata.genre': 'Выберите жанр из предложенного списка',
        'metadata.duration': 'Длительность трека должна быть положительным числом (максимум 1 час)',
        'metadata.fileSize': 'Размер файла не должен превышать 100MB',
        'metadata.mimeType': 'Поддерживаются только форматы: MP3, WAV, FLAC, OGG',
        'file.size': 'Размер файла не должен превышать 100MB'
      }
      
      throw new ValidationError(
        firstError.message,
        field,
        firstError.code,
        userMessages[field] || 'Некорректные данные трека'
      )
    }
    throw error
  }
}

export function validateDonation(data: unknown) {
  try {
    return DonationSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      const field = firstError.path.join('.')
      
      const userMessages: Record<string, string> = {
        'artistWallet': 'Некорректный адрес кошелька получателя',
        'amount': 'Сумма доната должна быть положительным числом (максимум 1000 SOL)',
        'message': 'Сообщение не должно превышать 200 символов'
      }
      
      throw new ValidationError(
        firstError.message,
        field,
        firstError.code,
        userMessages[field] || 'Некорректные данные доната'
      )
    }
    throw error
  }
}

export function validateStaking(data: unknown) {
  try {
    return StakingSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      const field = firstError.path.join('.')
      
      const userMessages: Record<string, string> = {
        'amount': 'Сумма стейкинга должна быть от 1 до 10000 NDT',
        'period': 'Выберите период стейкинга: 30, 90, 180 или 365 дней'
      }
      
      throw new ValidationError(
        firstError.message,
        field,
        firstError.code,
        userMessages[field] || 'Некорректные данные стейкинга'
      )
    }
    throw error
  }
}

export function validateSearch(data: unknown) {
  try {
    return SearchSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      const field = firstError.path.join('.')
      
      const userMessages: Record<string, string> = {
        'query': 'Поисковый запрос должен содержать от 1 до 100 символов',
        'page': 'Номер страницы должен быть положительным числом',
        'limit': 'Количество результатов должно быть от 1 до 100'
      }
      
      throw new ValidationError(
        firstError.message,
        field,
        firstError.code,
        userMessages[field] || 'Некорректные параметры поиска'
      )
    }
    throw error
  }
}

// Middleware для Next.js API
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      req.validatedData = schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
          userMessage: 'Проверьте правильность введенных данных'
        })
      }
      
      return res.status(500).json({
        success: false,
        error: 'Internal validation error',
        userMessage: 'Произошла ошибка при проверке данных'
      })
    }
  }
}

// Валидация для Next.js API routes
export function validateApiRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      )
      return { success: false, errors }
    }
    return { success: false, errors: ['Unknown validation error'] }
  }
}

// Безопасная валидация с санитизацией
export function safeValidateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  sanitizeOptions: {
    maxLength?: number
    allowHtml?: boolean
    strictMode?: boolean
  } = {}
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    // Сначала санитизируем данные
    const sanitizedData = sanitizeInputData(data, sanitizeOptions)
    
    // Затем валидируем
    const validatedData = schema.parse(sanitizedData)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      )
      return { success: false, errors }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

// Санитизация входных данных
function sanitizeInputData(data: unknown, options: {
  maxLength?: number
  allowHtml?: boolean
  strictMode?: boolean
} = {}): unknown {
  if (typeof data === 'string') {
    return processUserInput(data, options)
  } else if (Array.isArray(data)) {
    return data.map(item => sanitizeInputData(item, options))
  } else if (data && typeof data === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInputData(value, options)
    }
    return sanitized
  }
  return data
}

// Импорт функции processUserInput из sanitizer
import { processUserInput } from './sanitizer'

// Экспорт всех схем
export const schemas = {
  UserProfile: UserProfileSchema,
  TrackMetadata: TrackMetadataSchema,
  TrackUpload: TrackUploadSchema,
  Donation: DonationSchema,
  Staking: StakingSchema,
  NFTMint: NFTMintSchema,
  Pagination: PaginationSchema,
  Search: SearchSchema,
  Notification: NotificationSchema,
  Playlist: PlaylistSchema
}

// Типы для TypeScript
export type UserProfile = z.infer<typeof UserProfileSchema>
export type TrackMetadata = z.infer<typeof TrackMetadataSchema>
export type TrackUpload = z.infer<typeof TrackUploadSchema>
export type Donation = z.infer<typeof DonationSchema>
export type Staking = z.infer<typeof StakingSchema>
export type NFTMint = z.infer<typeof NFTMintSchema>
export type Pagination = z.infer<typeof PaginationSchema>
export type Search = z.infer<typeof SearchSchema>
export type NotificationData = z.infer<typeof NotificationSchema>
export type Playlist = z.infer<typeof PlaylistSchema>