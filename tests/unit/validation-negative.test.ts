import { 
  validateUserProfile, 
  validateTrackUpload, 
  validateDonation, 
  validateStaking,
  validateSearch,
  ValidationError 
} from '@/lib/data-validation'

describe('🔥 НЕГАТИВНЫЕ ТЕСТЫ ВАЛИДАЦИИ', () => {
  describe('👤 Валидация профиля пользователя', () => {
    test('должен отклонить короткий username', () => {
      expect(() => validateUserProfile({
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'ab', // Слишком короткий
        displayName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date()
      })).toThrow(ValidationError)
    })

    test('должен отклонить username с недопустимыми символами', () => {
      expect(() => validateUserProfile({
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'user@name!', // Недопустимые символы
        displayName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date()
      })).toThrow(ValidationError)
    })

    test('должен отклонить некорректный email', () => {
      expect(() => validateUserProfile({
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        email: 'invalid-email', // Некорректный email
        displayName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date()
      })).toThrow(ValidationError)
    })

    test('должен отклонить некорректный wallet address', () => {
      expect(() => validateUserProfile({
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        walletAddress: 'invalid-wallet-address', // Некорректный адрес
        displayName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date()
      })).toThrow(ValidationError)
    })

    test('должен отклонить слишком длинное bio', () => {
      expect(() => validateUserProfile({
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        displayName: 'Test User',
        bio: 'x'.repeat(501), // Превышает лимит 500 символов
        createdAt: new Date(),
        updatedAt: new Date()
      })).toThrow(ValidationError)
    })
  })

  describe('🎵 Валидация загрузки трека', () => {
    test('должен отклонить пустое название трека', () => {
      expect(() => validateTrackUpload({
        metadata: {
          title: '', // Пустое название
          artist: 'Test Artist',
          genre: 'electronic',
          duration: 180,
          releaseDate: new Date().toISOString(),
          isExplicit: false,
          fileSize: 5000000,
          mimeType: 'audio/mpeg'
        },
        file: {
          name: 'test.mp3',
          size: 5000000,
          type: 'audio/mpeg'
        }
      })).toThrow(ValidationError)
    })

    test('должен отклонить неподдерживаемый жанр', () => {
      expect(() => validateTrackUpload({
        metadata: {
          title: 'Test Track',
          artist: 'Test Artist',
          genre: 'unknown-genre' as any, // Неподдерживаемый жанр
          duration: 180,
          releaseDate: new Date().toISOString(),
          isExplicit: false,
          fileSize: 5000000,
          mimeType: 'audio/mpeg'
        },
        file: {
          name: 'test.mp3',
          size: 5000000,
          type: 'audio/mpeg'
        }
      })).toThrow(ValidationError)
    })

    test('должен отклонить слишком большой файл', () => {
      expect(() => validateTrackUpload({
        metadata: {
          title: 'Test Track',
          artist: 'Test Artist',
          genre: 'electronic',
          duration: 180,
          releaseDate: new Date().toISOString(),
          isExplicit: false,
          fileSize: 200 * 1024 * 1024, // 200MB - превышает лимит
          mimeType: 'audio/mpeg'
        },
        file: {
          name: 'test.mp3',
          size: 200 * 1024 * 1024,
          type: 'audio/mpeg'
        }
      })).toThrow(ValidationError)
    })

    test('должен отклонить неподдерживаемый MIME тип', () => {
      expect(() => validateTrackUpload({
        metadata: {
          title: 'Test Track',
          artist: 'Test Artist',
          genre: 'electronic',
          duration: 180,
          releaseDate: new Date().toISOString(),
          isExplicit: false,
          fileSize: 5000000,
          mimeType: 'audio/unknown' as any // Неподдерживаемый тип
        },
        file: {
          name: 'test.unknown',
          size: 5000000,
          type: 'audio/unknown'
        }
      })).toThrow(ValidationError)
    })

    test('должен отклонить отрицательную длительность', () => {
      expect(() => validateTrackUpload({
        metadata: {
          title: 'Test Track',
          artist: 'Test Artist',
          genre: 'electronic',
          duration: -180, // Отрицательная длительность
          releaseDate: new Date().toISOString(),
          isExplicit: false,
          fileSize: 5000000,
          mimeType: 'audio/mpeg'
        },
        file: {
          name: 'test.mp3',
          size: 5000000,
          type: 'audio/mpeg'
        }
      })).toThrow(ValidationError)
    })
  })

  describe('💰 Валидация доната', () => {
    test('должен отклонить некорректный адрес получателя', () => {
      expect(() => validateDonation({
        artistWallet: 'invalid-wallet', // Некорректный адрес
        amount: 1.5,
        message: 'Great music!'
      })).toThrow(ValidationError)
    })

    test('должен отклонить отрицательную сумму', () => {
      expect(() => validateDonation({
        artistWallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        amount: -1.5, // Отрицательная сумма
        message: 'Great music!'
      })).toThrow(ValidationError)
    })

    test('должен отклонить нулевую сумму', () => {
      expect(() => validateDonation({
        artistWallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        amount: 0, // Нулевая сумма
        message: 'Great music!'
      })).toThrow(ValidationError)
    })

    test('должен отклонить слишком большую сумму', () => {
      expect(() => validateDonation({
        artistWallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        amount: 1001, // Превышает лимит 1000 SOL
        message: 'Great music!'
      })).toThrow(ValidationError)
    })

    test('должен отклонить слишком длинное сообщение', () => {
      expect(() => validateDonation({
        artistWallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        amount: 1.5,
        message: 'x'.repeat(201) // Превышает лимит 200 символов
      })).toThrow(ValidationError)
    })
  })

  describe('🏦 Валидация стейкинга', () => {
    test('должен отклонить сумму меньше минимума', () => {
      expect(() => validateStaking({
        amount: 0.5, // Меньше минимума 1 NDT
        period: 30
      })).toThrow(ValidationError)
    })

    test('должен отклонить сумму больше максимума', () => {
      expect(() => validateStaking({
        amount: 10001, // Превышает максимум 10000 NDT
        period: 30
      })).toThrow(ValidationError)
    })

    test('должен отклонить неподдерживаемый период', () => {
      expect(() => validateStaking({
        amount: 100,
        period: 45 as any // Неподдерживаемый период
      })).toThrow(ValidationError)
    })

    test('должен отклонить отрицательную сумму', () => {
      expect(() => validateStaking({
        amount: -100, // Отрицательная сумма
        period: 30
      })).toThrow(ValidationError)
    })
  })

  describe('🔍 Валидация поиска', () => {
    test('должен отклонить пустой запрос', () => {
      expect(() => validateSearch({
        query: '', // Пустой запрос
        type: 'all'
      })).toThrow(ValidationError)
    })

    test('должен отклонить слишком длинный запрос', () => {
      expect(() => validateSearch({
        query: 'x'.repeat(101), // Превышает лимит 100 символов
        type: 'all'
      })).toThrow(ValidationError)
    })

    test('должен отклонить неподдерживаемый тип поиска', () => {
      expect(() => validateSearch({
        query: 'test',
        type: 'unknown' as any // Неподдерживаемый тип
      })).toThrow(ValidationError)
    })

    test('должен отклонить отрицательный номер страницы', () => {
      expect(() => validateSearch({
        query: 'test',
        type: 'all',
        page: -1 // Отрицательный номер страницы
      })).toThrow(ValidationError)
    })

    test('должен отклонить нулевой номер страницы', () => {
      expect(() => validateSearch({
        query: 'test',
        type: 'all',
        page: 0 // Нулевой номер страницы
      })).toThrow(ValidationError)
    })

    test('должен отклонить слишком большой лимит', () => {
      expect(() => validateSearch({
        query: 'test',
        type: 'all',
        limit: 101 // Превышает максимум 100
      })).toThrow(ValidationError)
    })

    test('должен отклонить нулевой лимит', () => {
      expect(() => validateSearch({
        query: 'test',
        type: 'all',
        limit: 0 // Нулевой лимит
      })).toThrow(ValidationError)
    })
  })

  describe('🎯 Граничные значения', () => {
    test('должен принять минимальные валидные значения', () => {
      expect(() => validateUserProfile({
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'abc', // Минимум 3 символа
        displayName: 'A', // Минимум 1 символ
        createdAt: new Date(),
        updatedAt: new Date()
      })).not.toThrow()
    })

    test('должен принять максимальные валидные значения', () => {
      expect(() => validateUserProfile({
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'a'.repeat(20), // Максимум 20 символов
        displayName: 'x'.repeat(50), // Максимум 50 символов
        bio: 'y'.repeat(500), // Максимум 500 символов
        createdAt: new Date(),
        updatedAt: new Date()
      })).not.toThrow()
    })

    test('должен принять минимальную сумму доната', () => {
      expect(() => validateDonation({
        artistWallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        amount: 0.000000001, // Минимальная положительная сумма
        message: 'Test'
      })).not.toThrow()
    })

    test('должен принять максимальную сумму доната', () => {
      expect(() => validateDonation({
        artistWallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        amount: 1000, // Максимум 1000 SOL
        message: 'Test'
      })).not.toThrow()
    })
  })

  describe('📝 Сообщения об ошибках', () => {
    test('должен возвращать дружелюбное сообщение для username', () => {
      try {
        validateUserProfile({
          id: '123e4567-e89b-12d3-a456-426614174000',
          username: 'ab',
          displayName: 'Test',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect((error as ValidationError).userMessage).toContain('от 3 до 20 символов')
      }
    })

    test('должен возвращать дружелюбное сообщение для суммы доната', () => {
      try {
        validateDonation({
          artistWallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
          amount: -1
        })
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect((error as ValidationError).userMessage).toContain('положительным числом')
      }
    })

    test('должен возвращать дружелюбное сообщение для размера файла', () => {
      try {
        validateTrackUpload({
          metadata: {
            title: 'Test',
            artist: 'Test',
            genre: 'electronic',
            duration: 180,
            releaseDate: new Date().toISOString(),
            isExplicit: false,
            fileSize: 200 * 1024 * 1024,
            mimeType: 'audio/mpeg'
          },
          file: {
            name: 'test.mp3',
            size: 200 * 1024 * 1024,
            type: 'audio/mpeg'
          }
        })
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect((error as ValidationError).userMessage).toContain('100MB')
      }
    })
  })
})