// Mock file-type for testing
const mockFileType = {
  fileTypeFromBuffer: jest.fn().mockResolvedValue({ mime: 'audio/mpeg', ext: 'mp3' })
}

module.exports = mockFileType