import { FilecoinService } from '../filecoin-service'

// Mock Filecoin API
const mockFilecoinAPI = {
  uploadFile: jest.fn(),
  getFile: jest.fn(),
  deleteFile: jest.fn(),
  getStorageInfo: jest.fn(),
}

describe('Filecoin Service', () => {
  let filecoinService: FilecoinService

  beforeEach(() => {
    filecoinService = new FilecoinService(mockFilecoinAPI as any)
    jest.clearAllMocks()
  })

  describe('uploadFile', () => {
    it('should upload file to Filecoin successfully', async () => {
      const mockFile = new File(['test content'], 'test.txt')
      const mockCid = 'bafybeigdyrzt5s7f7nyrccx7x823zsbpnf7d57ijotbe6r6ey6h2w5z2kua'
      
      mockFilecoinAPI.uploadFile.mockResolvedValue({
        cid: mockCid,
        size: mockFile.size,
        timestamp: Date.now(),
        storageProviders: ['provider1', 'provider2']
      })

      const result = await filecoinService.uploadFile(mockFile, {
        name: 'test.txt',
        description: 'Test file'
      })

      expect(result).toEqual({
        cid: mockCid,
        size: mockFile.size,
        timestamp: expect.any(Number),
        storageProviders: ['provider1', 'provider2']
      })
      expect(mockFilecoinAPI.uploadFile).toHaveBeenCalledWith(mockFile, {
        name: 'test.txt',
        description: 'Test file'
      })
    })

    it('should handle upload failure', async () => {
      const mockFile = new File(['test content'], 'test.txt')
      mockFilecoinAPI.uploadFile.mockRejectedValue(new Error('Upload failed'))

      await expect(filecoinService.uploadFile(mockFile, {
        name: 'test.txt',
        description: 'Test file'
      })).rejects.toThrow('Upload failed')
    })
  })

  describe('getFile', () => {
    it('should retrieve file from Filecoin successfully', async () => {
      const mockCid = 'bafybeigdyrzt5s7f7nyrccx7x823zsbpnf7d57ijotbe6r6ey6h2w5z2kua'
      const mockContent = new Uint8Array([1, 2, 3, 4, 5])
      
      mockFilecoinAPI.getFile.mockResolvedValue({
        content: mockContent,
        size: mockContent.length,
        timestamp: Date.now()
      })

      const result = await filecoinService.getFile(mockCid)

      expect(result).toEqual({
        content: mockContent,
        size: mockContent.length,
        timestamp: expect.any(Number)
      })
      expect(mockFilecoinAPI.getFile).toHaveBeenCalledWith(mockCid)
    })

    it('should handle file not found', async () => {
      const mockCid = 'bafybeigdyrzt5s7f7nyrccx7x823zsbpnf7d57ijotbe6r6ey6h2w5z2kua'
      mockFilecoinAPI.getFile.mockRejectedValue(new Error('File not found'))

      await expect(filecoinService.getFile(mockCid)).rejects.toThrow('File not found')
    })
  })

  describe('deleteFile', () => {
    it('should delete file from Filecoin successfully', async () => {
      const mockCid = 'bafybeigdyrzt5s7f7nyrccx7x823zsbpnf7d57ijotbe6r6ey6h2w5z2kua'
      
      mockFilecoinAPI.deleteFile.mockResolvedValue({
        success: true,
        message: 'File deleted successfully'
      })

      const result = await filecoinService.deleteFile(mockCid)

      expect(result).toEqual({
        success: true,
        message: 'File deleted successfully'
      })
      expect(mockFilecoinAPI.deleteFile).toHaveBeenCalledWith(mockCid)
    })

    it('should handle deletion failure', async () => {
      const mockCid = 'bafybeigdyrzt5s7f7nyrccx7x823zsbpnf7d57ijotbe6r6ey6h2w5z2kua'
      mockFilecoinAPI.deleteFile.mockRejectedValue(new Error('Deletion failed'))

      await expect(filecoinService.deleteFile(mockCid)).rejects.toThrow('Deletion failed')
    })
  })

  describe('getStorageInfo', () => {
    it('should retrieve storage information successfully', async () => {
      const mockStorageInfo = {
        totalStorage: 1000000000, // 1GB
        usedStorage: 500000000,   // 500MB
        availableStorage: 500000000, // 500MB
        storageProviders: 5,
        replicationFactor: 3
      }
      
      mockFilecoinAPI.getStorageInfo.mockResolvedValue(mockStorageInfo)

      const result = await filecoinService.getStorageInfo()

      expect(result).toEqual(mockStorageInfo)
      expect(mockFilecoinAPI.getStorageInfo).toHaveBeenCalled()
    })

    it('should handle storage info retrieval failure', async () => {
      mockFilecoinAPI.getStorageInfo.mockRejectedValue(new Error('Failed to get storage info'))

      await expect(filecoinService.getStorageInfo()).rejects.toThrow('Failed to get storage info')
    })
  })

  describe('calculateStorageCost', () => {
    it('should calculate storage cost correctly', () => {
      const fileSize = 1000000 // 1MB
      const duration = 30 // days
      const cost = filecoinService.calculateStorageCost(fileSize, duration)

      expect(cost).toBeGreaterThan(0)
      expect(cost).toBeLessThan(fileSize * duration * 0.0001) // Should be reasonable
    })

    it('should handle zero file size', () => {
      const fileSize = 0
      const duration = 30
      const cost = filecoinService.calculateStorageCost(fileSize, duration)

      expect(cost).toBe(0)
    })

    it('should handle zero duration', () => {
      const fileSize = 1000000
      const duration = 0
      const cost = filecoinService.calculateStorageCost(fileSize, duration)

      expect(cost).toBe(0)
    })
  })

  describe('getReplicationStatus', () => {
    it('should return replication status for a CID', async () => {
      const mockCid = 'bafybeigdyrzt5s7f7nyrccx7x823zsbpnf7d57ijotbe6r6ey6h2w5z2kua'
      const mockStatus = {
        cid: mockCid,
        replicationFactor: 3,
        currentReplicas: 3,
        storageProviders: ['provider1', 'provider2', 'provider3'],
        lastUpdated: Date.now()
      }
      
      mockFilecoinAPI.getFile.mockImplementation(async (cid: string) => {
        if (cid === mockCid) {
          return {
            content: new Uint8Array([1, 2, 3]),
            size: 3,
            timestamp: Date.now()
          }
        }
        throw new Error('File not found')
      })

      const result = await filecoinService.getReplicationStatus(mockCid)

      expect(result).toEqual(mockStatus)
    })

    it('should handle insufficient replication', async () => {
      const mockCid = 'bafybeigdyrzt5s7f7nyrccx7x823zsbpnf7d57ijotbe6r6ey6h2w5z2kua'
      
      mockFilecoinAPI.getFile.mockRejectedValue(new Error('File not found'))

      const result = await filecoinService.getReplicationStatus(mockCid)

      expect(result.replicationFactor).toBe(0)
      expect(result.currentReplicas).toBe(0)
      expect(result.storageProviders).toEqual([])
    })
  })

  describe('healthCheck', () => {
    it('should return healthy status when Filecoin is available', async () => {
      mockFilecoinAPI.getStorageInfo.mockResolvedValue({
        totalStorage: 1000000000,
        usedStorage: 500000000,
        availableStorage: 500000000,
        storageProviders: 5,
        replicationFactor: 3
      })

      const result = await filecoinService.healthCheck()

      expect(result.healthy).toBe(true)
      expect(result.status).toBe('healthy')
      expect(result.storageUsed).toBe(500000000)
      expect(result.storageAvailable).toBe(500000000)
    })

    it('should return unhealthy status when Filecoin is not available', async () => {
      mockFilecoinAPI.getStorageInfo.mockRejectedValue(new Error('Connection failed'))

      const result = await filecoinService.healthCheck()

      expect(result.healthy).toBe(false)
      expect(result.status).toBe('unhealthy')
      expect(result.error).toBeDefined()
    })
  })
})