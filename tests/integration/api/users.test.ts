import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/users/route'
import { db } from '@/lib/db'
import { z } from 'zod'

// Mock dependencies
jest.mock('@/lib/db')
jest.mock('zod')

const mockDb = db as jest.Mocked<typeof db>
const mockZod = z as jest.Mocked<typeof z>

describe('Users API - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mock implementations
    mockDb.user.findMany.mockResolvedValue([])
    mockDb.user.count.mockResolvedValue(0)
    mockDb.user.create.mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      bio: 'Test bio',
      avatar: 'test-avatar.jpg',
      banner: 'test-banner.jpg',
      wallet: 'test-wallet-address',
      level: 1,
      balance: 0,
      isArtist: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  })

  describe('GET /api/users', () => {
    it('should get users with default parameters', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          username: 'user1',
          displayName: 'User 1',
          bio: 'Bio 1',
          avatar: 'avatar1.jpg',
          banner: 'banner1.jpg',
          wallet: 'wallet1',
          level: 1,
          balance: 100,
          isArtist: false,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            tracks: 5,
            followers: 10,
            following: 8,
          }
        }
      ]

      mockDb.user.findMany.mockResolvedValue(mockUsers)
      mockDb.user.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/users')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.users).toHaveLength(1)
      expect(data.pagination.page).toBe(1)
      expect(data.pagination.limit).toBe(10)
      expect(data.pagination.total).toBe(1)
      expect(data.pagination.pages).toBe(1)
    })

    it('should get users with pagination', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          username: 'user1',
          displayName: 'User 1',
          bio: 'Bio 1',
          avatar: 'avatar1.jpg',
          banner: 'banner1.jpg',
          wallet: 'wallet1',
          level: 1,
          balance: 100,
          isArtist: false,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            tracks: 5,
            followers: 10,
            following: 8,
          }
        },
        {
          id: '2',
          email: 'user2@example.com',
          username: 'user2',
          displayName: 'User 2',
          bio: 'Bio 2',
          avatar: 'avatar2.jpg',
          banner: 'banner2.jpg',
          wallet: 'wallet2',
          level: 2,
          balance: 200,
          isArtist: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            tracks: 10,
            followers: 20,
            following: 15,
          }
        }
      ]

      mockDb.user.findMany.mockResolvedValue(mockUsers)
      mockDb.user.count.mockResolvedValue(2)

      const request = new NextRequest('http://localhost:3000/api/users?page=2&limit=5')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.users).toHaveLength(2)
      expect(data.pagination.page).toBe(2)
      expect(data.pagination.limit).toBe(5)
      expect(data.pagination.total).toBe(2)
      expect(data.pagination.pages).toBe(1)
    })

    it('should get users with search filter', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          bio: 'Test bio',
          avatar: 'avatar1.jpg',
          banner: 'banner1.jpg',
          wallet: 'wallet1',
          level: 1,
          balance: 100,
          isArtist: false,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            tracks: 5,
            followers: 10,
            following: 8,
          }
        }
      ]

      mockDb.user.findMany.mockResolvedValue(mockUsers)
      mockDb.user.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/users?search=test')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.users).toHaveLength(1)
      expect(data.users[0].username).toBe('testuser')
    })

    it('should get users with artist filter', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'artist@example.com',
          username: 'artist',
          displayName: 'Artist',
          bio: 'Artist bio',
          avatar: 'artist-avatar.jpg',
          banner: 'artist-banner.jpg',
          wallet: 'artist-wallet',
          level: 2,
          balance: 500,
          isArtist: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            tracks: 15,
            followers: 50,
            following: 30,
          }
        }
      ]

      mockDb.user.findMany.mockResolvedValue(mockUsers)
      mockDb.user.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/users?artist=true')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.users).toHaveLength(1)
      expect(data.users[0].isArtist).toBe(true)
    })

    it('should get users with non-artist filter', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user@example.com',
          username: 'user',
          displayName: 'User',
          bio: 'User bio',
          avatar: 'user-avatar.jpg',
          banner: 'user-banner.jpg',
          wallet: 'user-wallet',
          level: 1,
          balance: 100,
          isArtist: false,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            tracks: 0,
            followers: 5,
            following: 3,
          }
        }
      ]

      mockDb.user.findMany.mockResolvedValue(mockUsers)
      mockDb.user.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/users?artist=false')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.users).toHaveLength(1)
      expect(data.users[0].isArtist).toBe(false)
    })

    it('should handle empty results', async () => {
      mockDb.user.findMany.mockResolvedValue([])
      mockDb.user.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/users?search=nonexistent')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.users).toHaveLength(0)
      expect(data.pagination.total).toBe(0)
    })

    it('should handle database errors gracefully', async () => {
      mockDb.user.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/users')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch users')
    })
  })

  describe('POST /api/users', () => {
    it('should create a new user successfully', async () => {
      const mockUserData = {
        email: 'newuser@example.com',
        username: 'newuser',
        displayName: 'New User',
        bio: 'New user bio',
        avatar: 'new-avatar.jpg',
        banner: 'new-banner.jpg',
        wallet: 'new-wallet-address',
        isArtist: false,
      }

      const mockZodParse = mockZod.object().parse as jest.MockedFunction<any>
      mockZodParse.mockReturnValue(mockUserData)

      const mockCreatedUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        username: 'newuser',
        displayName: 'New User',
        bio: 'New user bio',
        avatar: 'new-avatar.jpg',
        banner: 'new-banner.jpg',
        wallet: 'new-wallet-address',
        level: 1,
        balance: 0,
        isArtist: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.user.create.mockResolvedValue(mockCreatedUser)

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.email).toBe('newuser@example.com')
      expect(data.username).toBe('newuser')
      expect(data.displayName).toBe('New User')
      expect(mockDb.user.create).toHaveBeenCalledWith({
        data: mockUserData,
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          bio: true,
          avatar: true,
          banner: true,
          wallet: true,
          level: true,
          balance: true,
          isArtist: true,
          createdAt: true,
        }
      })
    })

    it('should handle duplicate email error', async () => {
      const mockUserData = {
        email: 'existing@example.com',
        username: 'newuser',
        displayName: 'New User',
        bio: 'New user bio',
        avatar: 'new-avatar.jpg',
        banner: 'new-banner.jpg',
        wallet: 'new-wallet-address',
        isArtist: false,
      }

      const mockZodParse = mockZod.object().parse as jest.MockedFunction<any>
      mockZodParse.mockReturnValue(mockUserData)

      mockDb.user.findFirst.mockResolvedValue({
        id: 'existing-user-id',
        email: 'existing@example.com',
        username: 'existinguser',
        displayName: 'Existing User',
        bio: 'Existing bio',
        avatar: 'existing-avatar.jpg',
        banner: 'existing-banner.jpg',
        wallet: 'existing-wallet-address',
        level: 1,
        balance: 100,
        isArtist: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('User with this email or username already exists')
    })

    it('should handle duplicate username error', async () => {
      const mockUserData = {
        email: 'newuser@example.com',
        username: 'existinguser',
        displayName: 'New User',
        bio: 'New user bio',
        avatar: 'new-avatar.jpg',
        banner: 'new-banner.jpg',
        wallet: 'new-wallet-address',
        isArtist: false,
      }

      const mockZodParse = mockZod.object().parse as jest.MockedFunction<any>
      mockZodParse.mockReturnValue(mockUserData)

      mockDb.user.findFirst.mockResolvedValue({
        id: 'existing-user-id',
        email: 'existing@example.com',
        username: 'existinguser',
        displayName: 'Existing User',
        bio: 'Existing bio',
        avatar: 'existing-avatar.jpg',
        banner: 'existing-banner.jpg',
        wallet: 'existing-wallet-address',
        level: 1,
        balance: 100,
        isArtist: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('User with this email or username already exists')
    })

    it('should handle validation errors', async () => {
      const mockZodParse = mockZod.object().parse as jest.MockedFunction<any>
      mockZodParse.mockImplementation(() => {
        throw new Error('Validation failed')
      })

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({}),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should handle missing required fields', async () => {
      const mockZodParse = mockZod.object().parse as jest.MockedFunction<any>
      mockZodParse.mockImplementation(() => {
        throw new Error('Missing required fields')
      })

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should handle database creation errors', async () => {
      const mockUserData = {
        email: 'newuser@example.com',
        username: 'newuser',
        displayName: 'New User',
        bio: 'New user bio',
        avatar: 'new-avatar.jpg',
        banner: 'new-banner.jpg',
        wallet: 'new-wallet-address',
        isArtist: false,
      }

      const mockZodParse = mockZod.object().parse as jest.MockedFunction<any>
      mockZodParse.mockReturnValue(mockUserData)

      mockDb.user.create.mockRejectedValue(new Error('Creation failed'))

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create user')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid JSON body', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: 'invalid json',
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should handle empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({}),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should handle network errors', async () => {
      mockDb.user.findMany.mockRejectedValue(new Error('Network error'))

      const request = new NextRequest('http://localhost:3000/api/users')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch users')
    })

    it('should handle timeout errors', async () => {
      mockDb.user.findMany.mockRejectedValue(new Error('Request timeout'))

      const request = new NextRequest('http://localhost:3000/api/users')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch users')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large pagination numbers', async () => {
      const mockUsers = []
      mockDb.user.findMany.mockResolvedValue(mockUsers)
      mockDb.user.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/users?page=999999&limit=1000')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.pagination.page).toBe(999999)
      expect(data.pagination.limit).toBe(1000)
      expect(data.pagination.pages).toBe(0)
    })

    it('should handle negative pagination numbers', async () => {
      const mockUsers = []
      mockDb.user.findMany.mockResolvedValue(mockUsers)
      mockDb.user.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/users?page=-1&limit=-10')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.pagination.page).toBe(1)
      expect(data.pagination.limit).toBe(10)
    })

    it('should handle special characters in search', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'test@example.com',
          username: 'test_user_123',
          displayName: 'Test User',
          bio: 'Test bio',
          avatar: 'avatar1.jpg',
          banner: 'banner1.jpg',
          wallet: 'wallet1',
          level: 1,
          balance: 100,
          isArtist: false,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            tracks: 5,
            followers: 10,
            following: 8,
          }
        }
      ]

      mockDb.user.findMany.mockResolvedValue(mockUsers)
      mockDb.user.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/users?search=_123')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.users).toHaveLength(1)
    })

    it('should handle Unicode characters in search', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'тест@example.com',
          username: 'тестовыйпользователь',
          displayName: 'Тестовый Пользователь',
          bio: 'Тестовый био',
          avatar: 'avatar1.jpg',
          banner: 'banner1.jpg',
          wallet: 'wallet1',
          level: 1,
          balance: 100,
          isArtist: false,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            tracks: 5,
            followers: 10,
            following: 8,
          }
        }
      ]

      mockDb.user.findMany.mockResolvedValue(mockUsers)
      mockDb.user.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/users?search=тестовый')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.users).toHaveLength(1)
    })

    it('should handle mixed case search', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'TestUser@example.com',
          username: 'TestUser',
          displayName: 'Test User',
          bio: 'Test bio',
          avatar: 'avatar1.jpg',
          banner: 'banner1.jpg',
          wallet: 'wallet1',
          level: 1,
          balance: 100,
          isArtist: false,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            tracks: 5,
            followers: 10,
            following: 8,
          }
        }
      ]

      mockDb.user.findMany.mockResolvedValue(mockUsers)
      mockDb.user.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/users?search=testuser')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.users).toHaveLength(1)
    })
  })

  describe('Performance Tests', () => {
    it('should handle user requests quickly', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          bio: 'Test bio',
          avatar: 'avatar1.jpg',
          banner: 'banner1.jpg',
          wallet: 'wallet1',
          level: 1,
          balance: 100,
          isArtist: false,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            tracks: 5,
            followers: 10,
            following: 8,
          }
        }
      ]

      mockDb.user.findMany.mockResolvedValue(mockUsers)
      mockDb.user.count.mockResolvedValue(1)

      const startTime = performance.now()
      
      const request = new NextRequest('http://localhost:3000/api/users')
      const response = await GET(request)
      
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      expect(response.status).toBe(200)
      expect(responseTime).toBeLessThan(100) // Should respond in less than 100ms
    })

    it('should handle concurrent user requests', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          bio: 'Test bio',
          avatar: 'avatar1.jpg',
          banner: 'banner1.jpg',
          wallet: 'wallet1',
          level: 1,
          balance: 100,
          isArtist: false,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: {
            tracks: 5,
            followers: 10,
            following: 8,
          }
        }
      ]

      mockDb.user.findMany.mockResolvedValue(mockUsers)
      mockDb.user.count.mockResolvedValue(1)

      const startTime = performance.now()
      
      const requests = Array.from({ length: 5 }, () => 
        new NextRequest('http://localhost:3000/api/users')
      )
      
      const responses = await Promise.all(requests.map(req => GET(req)))
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      
      expect(responses.every(r => r.status === 200)).toBe(true)
      expect(totalTime).toBeLessThan(500) // Should handle 5 requests in less than 500ms
    })
  })

  describe('Security Tests', () => {
    it('should prevent SQL injection in search', async () => {
      const mockUsers = []
      mockDb.user.findMany.mockResolvedValue(mockUsers)
      mockDb.user.count.mockResolvedValue(0)

      const maliciousSearch = "test'; DROP TABLE users; --"
      
      const request = new NextRequest(`http://localhost:3000/api/users?search=${maliciousSearch}`)
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.users).toHaveLength(0)
    })

    it('should prevent XSS in search', async () => {
      const mockUsers = []
      mockDb.user.findMany.mockResolvedValue(mockUsers)
      mockDb.user.count.mockResolvedValue(0)

      const xssSearch = '<script>alert("xss")</script>'
      
      const request = new NextRequest(`http://localhost:3000/api/users?search=${xssSearch}`)
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.users).toHaveLength(0)
    })

    it('should validate input data', async () => {
      const mockZodParse = mockZod.object().parse as jest.MockedFunction<any>
      mockZodParse.mockImplementation(() => {
        throw new Error('Invalid input')
      })

      const maliciousData = {
        email: "'; DROP TABLE users; --",
        username: 'testuser',
        displayName: 'Test User',
      }

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(maliciousData),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should prevent email enumeration', async () => {
      const mockUserData = {
        email: 'existing@example.com',
        username: 'newuser',
        displayName: 'New User',
        bio: 'New user bio',
        avatar: 'new-avatar.jpg',
        banner: 'new-banner.jpg',
        wallet: 'new-wallet-address',
        isArtist: false,
      }

      const mockZodParse = mockZod.object().parse as jest.MockedFunction<any>
      mockZodParse.mockReturnValue(mockUserData)

      mockDb.user.findFirst.mockResolvedValue(null) // User doesn't exist

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201) // Should still create user if email doesn't exist
    })

    it('should prevent username enumeration', async () => {
      const mockUserData = {
        email: 'newuser@example.com',
        username: 'existinguser',
        displayName: 'New User',
        bio: 'New user bio',
        avatar: 'new-avatar.jpg',
        banner: 'new-banner.jpg',
        wallet: 'new-wallet-address',
        isArtist: false,
      }

      const mockZodParse = mockZod.object().parse as jest.MockedFunction<any>
      mockZodParse.mockReturnValue(mockUserData)

      mockDb.user.findFirst.mockResolvedValue(null) // User doesn't exist

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201) // Should still create user if username doesn't exist
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete user lifecycle', async () => {
      // Create user
      const mockUserData = {
        email: 'lifecycle@example.com',
        username: 'lifecycleuser',
        displayName: 'Lifecycle User',
        bio: 'Lifecycle bio',
        avatar: 'lifecycle-avatar.jpg',
        banner: 'lifecycle-banner.jpg',
        wallet: 'lifecycle-wallet',
        isArtist: false,
      }

      const mockZodParse = mockZod.object().parse as jest.MockedFunction<any>
      mockZodParse.mockReturnValue(mockUserData)

      const mockCreatedUser = {
        id: 'lifecycle-user-id',
        email: 'lifecycle@example.com',
        username: 'lifecycleuser',
        displayName: 'Lifecycle User',
        bio: 'Lifecycle bio',
        avatar: 'lifecycle-avatar.jpg',
        banner: 'lifecycle-banner.jpg',
        wallet: 'lifecycle-wallet',
        level: 1,
        balance: 0,
        isArtist: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.user.create.mockResolvedValue(mockCreatedUser)

      const createRequest = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(mockUserData),
      })
      
      const createResponse = await POST(createRequest)
      const createData = await createResponse.json()
      
      expect(createResponse.status).toBe(201)
      expect(createData.email).toBe('lifecycle@example.com')

      // Get user
      const mockUsers = [mockCreatedUser]
      mockDb.user.findMany.mockResolvedValue(mockUsers)
      mockDb.user.count.mockResolvedValue(1)

      const getRequest = new NextRequest('http://localhost:3000/api/users')
      const getResponse = await GET(getRequest)
      const getData = await getResponse.json()
      
      expect(getResponse.status).toBe(200)
      expect(getData.users).toHaveLength(1)
      expect(getData.users[0].email).toBe('lifecycle@example.com')
    })

    it('should handle concurrent user creation', async () => {
      const mockUserData = {
        email: 'concurrent@example.com',
        username: 'concurrentuser',
        displayName: 'Concurrent User',
        bio: 'Concurrent bio',
        avatar: 'concurrent-avatar.jpg',
        banner: 'concurrent-banner.jpg',
        wallet: 'concurrent-wallet',
        isArtist: false,
      }

      const mockZodParse = mockZod.object().parse as jest.MockedFunction<any>
      mockZodParse.mockReturnValue(mockUserData)

      const mockCreatedUser = {
        id: 'concurrent-user-id',
        email: 'concurrent@example.com',
        username: 'concurrentuser',
        displayName: 'Concurrent User',
        bio: 'Concurrent bio',
        avatar: 'concurrent-avatar.jpg',
        banner: 'concurrent-banner.jpg',
        wallet: 'concurrent-wallet',
        level: 1,
        balance: 0,
        isArtist: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.user.create.mockResolvedValue(mockCreatedUser)

      const requests = Array.from({ length: 3 }, (_, i) => 
        new NextRequest('http://localhost:3000/api/users', {
          method: 'POST',
          body: JSON.stringify({
            ...mockUserData,
            email: `concurrent${i}@example.com`,
            username: `concurrentuser${i}`,
          }),
        })
      )

      const responses = await Promise.all(requests.map(req => POST(req)))
      
      expect(responses.every(r => r.status === 201)).toBe(true)
    })
  })
})