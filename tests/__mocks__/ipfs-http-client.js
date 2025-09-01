// Mock IPFS client for testing
const mockIpfsClient = {
  create: jest.fn(() => ({
    add: jest.fn().mockResolvedValue({ cid: 'test-cid' }),
    cat: jest.fn().mockImplementation(async function* () {
      yield new Uint8Array([1, 2, 3])
    }),
    object: {
      stat: jest.fn().mockResolvedValue({ size: 1000 }),
    },
  })),
}

module.exports = mockIpfsClient