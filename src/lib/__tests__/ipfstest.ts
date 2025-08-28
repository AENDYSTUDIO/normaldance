import { uploadToIPFS, getIPFSFile, createIPFSUrl, checkFileAvailability, IPFSTrackMetadata } from '../ipfs-enhanced'

// Mock IPFS client
jest.mock('ipfs-http-client')
jest.mock('pinata-sdk')
jest.mock('file-type')
jest.mock('mime-types')

const mockIPFSClient = {
  add: jest.fn(),
  cat: jest.fn(),
  object: {
    stat: jest.fn(),
  },
}

const mockPinata = {
  pinFile: jest.fn(),
  pinList: jest.fn(),
}

const mockFileType = {
  fileTypeFromBuffer: jest.fn(),
}

const mockMimeTypes = {
  lookup: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  require('ipfs-http-client').create.mockReturnValue(mockIPFSClient)
  require('pinata-sdk').PinataSDK.mockReturnValue(mockPinata)
  require('file-type').fileTypeFromBuffer.mockResolvedValue({ mime: 'audio/mpeg', ext: 'mp3' })
  require('mime-types').lookup.mockReturnValue('audio/mpeg')
})

describe('IPFS Integration', () => {
  const mockMetadata: IPFSTrackMetadata = {
    title: 'Test Track',
    artist: 'Test Artist',
    genre: 'Electronic',
    duration: 180,
    releaseDate: '2024-01-01',
    isExplicit: false,
    fileSize: 1024000,
    mimeType: 'audio/mpeg',
  }

  const mockFile = new File(['test audio content'], 'test.mp3', {
    type: 'audio/mpeg',
  })

  describe('uploadToIPFS', () => {
    it('should upload file to IPFS successfully', async () => {
      const mockResult = {
        cid: 'test-cid-123',
        size: 1024000,
      }
      
      mockIPFSClient.add.mockResolvedValue(mockResult)
      mockPinata.pinFile.mockResolvedValue({ pinSize: 1024000 })

      const result = await uploadToIPFS(mockFile, mockMetadata)

      expect(result).toEqual({
        cid: 'test-cid-123',
        size: 1024000,
        pinSize: 1024000,
        timestamp: expect.any(Date),
        metadata: mockMetadata,
      })

      expect(mockIPFSClient.add).toHaveBeenCalledWith(expect.any(FormData), {
        pin: true,
        wrapWithDirectory: false,
        progress: expect.any(Function),
      })

      expect(mockPinata.pinFile).toHaveBeenCalledWith('test-cid-123')
    })

    it('should handle IPFS upload failure', async () => {
      mockIPFSClient.add.mockRejectedValue(new Error('Upload failed'))

      await expect(uploadToIPFS(mockFile, mockMetadata)).rejects.toThrow(
        'Failed to upload file to IPFS: Upload failed'
      )
    })

    it('should handle Pinata pinning failure gracefully', async () => {
      const mockResult = {
        cid: 'test-cid-123',
        size: 1024000,
      }
      
      mockIPFSClient.add.mockResolvedValue(mockResult)
      mockPinata.pinFile.mockRejectedValue(new Error('Pinata failed'))

      const result = await uploadToIPFS(mockFile, mockMetadata)

      expect(result).toEqual({
        cid: 'test-cid-123',
        size: 1024000,
        timestamp: expect.any(Date),
        metadata: mockMetadata,
      })
    })
  })

  describe('getIPFSFile', () => {
    it('should retrieve file from IPFS successfully', async () => {
      const mockContent = new Uint8Array([1, 2, 3, 4, 5])
      
      mockIPFSClient.cat.mockImplementation(async function* () {
        yield mockContent
      })

      const result = await getIPFSFile('test-cid')

      expect(result).toEqual({
        content: mockContent,
        metadata: undefined,
      })

      expect(mockIPFSClient.cat).toHaveBeenCalledWith('test-cid')
    })

    it('should retrieve file with metadata', async () => {
      const mockContent = new Uint8Array([1, 2, 3, 4, 5])
      const mockMetadata = { title: 'Test Track' }
      
      mockIPFSClient.cat.mockImplementation(async function* () {
        yield mockContent
      })
      
      // Mock metadata file
      mockIPFSClient.cat.mockImplementationOnce(async function* () {
        yield new TextEncoder().encode(JSON.stringify(mockMetadata))
      }).mockImplementationOnce(async function* () {
        yield mockContent
      })

      const result = await getIPFSFile('test-cid')

      expect(result).toEqual({
        content: mockContent,
        metadata: mockMetadata,
      })
    })

    it('should handle IPFS retrieval failure', async () => {
      mockIPFSClient.cat.mockRejectedValue(new Error('Retrieval failed'))

      await expect(getIPFSFile('test-cid')).rejects.toThrow(
        'Failed to retrieve file from IPFS: Retrieval failed'
      )
    })
  })

  describe('createIPFSUrl', () => {
    it('should create IPFS URL with default gateway', () => {
      const url = createIPFSUrl('test-cid')
      expect(url).toBe('https://ipfs.io/ipfs/test-cid')
    })

    it('should create IPFS URL with Pinata gateway', () => {
      const url = createIPFSUrl('test-cid', 'pinata')
      expect(url).toBe('https://gateway.pinata.cloud/ipfs/test-cid')
    })

    it('should create IPFS URL with Infura gateway', () => {
      const url = createIPFSUrl('test-cid', 'infura')
      expect(url).toBe('https://ipfs.infura-ipfs.io/ipfs/test-cid')
    })

    it('should create IPFS URL with custom gateway', () => {
      const url = createIPFSUrl('test-cid', 'custom-gateway.com')
      expect(url).toBe('https://custom-gateway.com/ipfs/test-cid')
    })
  })

  describe('checkFileAvailability', () => {
    it('should check file availability successfully', async () => {
      mockIPFSClient.object.stat.mockResolvedValue({ size: 1024000 })
      mockPinata.pinList.mockResolvedValue({ count: 1 })

      const result = await checkFileAvailability('test-cid')

      expect(result).toEqual({
        available: true,
        size: 1024000,
        pins: 1,
      })

      expect(mockIPFSClient.object.stat).toHaveBeenCalledWith('test-cid')
      expect(mockPinata.pinList).toHaveBeenCalledWith({ status: 'pinned' })
    })

    it('should handle file not available', async () => {
      mockIPFSClient.object.stat.mockRejectedValue(new Error('File not found'))

      const result = await checkFileAvailability('test-cid')

      expect(result).toEqual({
        available: false,
      })
    })

    it('should handle Pinata API failure gracefully', async () => {
      mockIPFSClient.object.stat.mockResolvedValue({ size: 1024000 })
      mockPinata.pinList.mockRejectedValue(new Error('API error'))

      const result = await checkFileAvailability('test-cid')

      expect(result).toEqual({
        available: true,
        size: 1024000,
        pins: 0,
      })
    })
  })
})