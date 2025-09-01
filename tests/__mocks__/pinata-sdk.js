// Mock pinata-sdk for testing
const mockPinataSDK = {
  PinataSDK: jest.fn(() => ({
    pinFile: jest.fn().mockResolvedValue({ pinSize: 1000 }),
    pinList: jest.fn().mockResolvedValue({ count: 1 }),
  }))
}

module.exports = mockPinataSDK