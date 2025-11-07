import { MusicTokenManager, createMusicTokenManager, musicTokenUtils } from '@/lib/wallet/music-token-manager';
import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';

// Mock dependencies
jest.mock('@solana/web3.js');
jest.mock('@solana/spl-token');

// Mock logger
const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

jest.mock('@/lib/utils/logger', () => ({
  logger: mockLogger
}));

// Mock errors
const mockAppError = {
  ExternalServiceError: class extends Error {
    constructor(service: string, originalError?: Error) {
      super(`Service error: ${service}`);
      this.name = 'ExternalServiceError';
    }
  },
  ValidationError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ValidationError';
    }
  }
};

jest.mock('@/lib/errors/AppError', () => mockAppError);

describe('MusicTokenManager', () => {
  let connection: jest.Mocked<Connection>;
  let mintAddress: PublicKey;
  let mintAuthority: Keypair;
  let musicTokenManager: MusicTokenManager;
  let userWallet: PublicKey;

  beforeEach(() => {
    // Setup mocks
    connection = {
      getAccountInfo: jest.fn(),
      getParsedAccountInfo: jest.fn(),
      getProgramAccounts: jest.fn()
    } as unknown as jest.Mocked<Connection>;

    mintAddress = new PublicKey('11111111111111111111111111111112');
    mintAuthority = Keypair.generate();
    userWallet = new PublicKey('22222222222222222222222222222222');

    // Create instance
    musicTokenManager = createMusicTokenManager(
      connection,
      mintAddress,
      mintAuthority
    );

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Token Account Management', () => {
    it('should create token account transaction for new user', async () => {
      // Mock account not existing
      connection.getAccountInfo.mockResolvedValue(null);

      // Mock getAssociatedTokenAddress
      const mockTokenAccount = new PublicKey('33333333333333333333333333333333');
      const getAssociatedTokenAddressSpy = jest.spyOn(
        require('@solana/spl-token'),
        'getAssociatedTokenAddress'
      );
      getAssociatedTokenAddressSpy.mockResolvedValue(mockTokenAccount);

      const result = await musicTokenManager.getOrCreateTokenAccount(userWallet);

      expect(result.address).toBe(mockTokenAccount);
      expect(result.transaction).toBeDefined();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should return existing token account if it exists', async () => {
      // Mock existing account
      const mockAccountInfo = {
        owner: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        data: Buffer.from('mock'),
        executable: false,
        lamports: 1000
      };
      connection.getAccountInfo.mockResolvedValue(mockAccountInfo);

      const mockTokenAccount = new PublicKey('33333333333333333333333333333333');
      const getAssociatedTokenAddressSpy = jest.spyOn(
        require('@solana/spl-token'),
        'getAssociatedTokenAddress'
      );
      getAssociatedTokenAddressSpy.mockResolvedValue(mockTokenAccount);

      const result = await musicTokenManager.getOrCreateTokenAccount(userWallet);

      expect(result.address).toBe(mockTokenAccount);
      expect(result.transaction).toBeUndefined();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle token account creation errors', async () => {
      // Mock network error
      connection.getAccountInfo.mockRejectedValue(new Error('Network error'));

      await expect(musicTokenManager.getOrCreateTokenAccount(userWallet))
        .rejects.toThrow('ExternalServiceError');
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error getting/creating token account',
        expect.any(Error)
      );
    });

    it('should return zero balance for non-existent account', async () => {
      // Mock getAccount to throw "Could not find account" error
      const mockGetAccount = jest.spyOn(require('@solana/spl-token'), 'getAccount');
      mockGetAccount.mockRejectedValue(new Error('Could not find account'));

      const balance = await musicTokenManager.getTokenBalance(userWallet);

      expect(balance).toBe(0);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle token balance requests correctly', async () => {
      // Mock existing account with balance
      const mockAccount = {
        amount: BigInt(1000000000), // 1 token with 9 decimals
        mint: new PublicKey('11111111111111111111111111111112'),
        owner: userWallet,
        isFrozen: false,
        isInitialized: true,
        delegate: null,
        delegatedAmount: BigInt(0)
      };
      const mockGetAccount = jest.spyOn(require('@solana/spl-token'), 'getAccount');
      mockGetAccount.mockResolvedValue(mockAccount);

      const balance = await musicTokenManager.getTokenBalance(userWallet);

      expect(balance).toBe(1000000000);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  describe('Track Access Management', () => {
    let accessData: any;

    beforeEach(() => {
      accessData = {
        trackId: 'test-track-123',
        artistId: 'test-artist-456',
        accessPrice: 1000000, // 0.001 NDT
        accessDuration: 3600, // 1 hour
        maxAccesses: 1
      };
    });

    it('should allow access when user has sufficient balance', async () => {
      // Mock user with sufficient balance
      const mockGetAccount = jest.spyOn(require('@solana/spl-token'), 'getAccount');
      mockGetAccount.mockResolvedValue({
        amount: BigInt(5000000), // 5 tokens
        mint: new PublicKey('11111111111111111111111111111112'),
        owner: userWallet,
        isFrozen: false,
        isInitialized: true
      });

      const hasAccess = await musicTokenManager.checkTrackAccess(
        userWallet,
        'test-track-123',
        accessData
      );

      expect(hasAccess).toBe(true);
    });

    it('should deny access when user has insufficient balance', async () => {
      // Mock user with insufficient balance
      const mockGetAccount = jest.spyOn(require('@solana/spl-token'), 'getAccount');
      mockGetAccount.mockResolvedValue({
        amount: BigInt(500000), // 0.5 tokens (less than 1 token required)
        mint: new PublicKey('11111111111111111111111111111112'),
        owner: userWallet,
        isFrozen: false,
        isInitialized: true
      });

      const hasAccess = await musicTokenManager.checkTrackAccess(
        userWallet,
        'test-track-123',
        accessData
      );

      expect(hasAccess).toBe(false);
    });

    it('should create purchase transaction for track access', async () => {
      // Mock account checks
      connection.getAccountInfo.mockResolvedValue(null);
      const mockTransaction = new Transaction();
      mockTransaction.feePayer = userWallet;

      const result = await musicTokenManager.purchaseTrackAccess(
        userWallet,
        'test-track-123',
        accessData
      );

      expect(result).toBeInstanceOf(Transaction);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle already purchased track', async () => {
      // Mock user already has access
      const mockGetAccount = jest.spyOn(require('@solana/spl-token'), 'getAccount');
      mockGetAccount.mockResolvedValue({
        amount: BigInt(5000000),
        mint: new PublicKey('11111111111111111111111111111112'),
        owner: userWallet,
        isFrozen: false,
        isInitialized: true
      });

      await expect(musicTokenManager.purchaseTrackAccess(
        userWallet,
        'test-track-123',
        accessData
      )).rejects.toThrow('ValidationError');
    });
  });

  describe('Token Operations', () => {
    it('should create mint to user transaction', async () => {
      const amount = 1000000000; // 1 token
      const result = await musicTokenManager.mintToUser(userWallet, amount);

      expect(result).toBeInstanceOf(Transaction);
      expect(result.instructions.length).toBeGreaterThanOrEqual(1);
    });

    it('should create transfer transaction', async () => {
      const toWallet = new PublicKey('44444444444444444444444444444444');
      const amount = 1000000000; // 1 token
      const result = await musicTokenManager.transferTokens(
        userWallet,
        toWallet,
        amount
      );

      expect(result).toBeInstanceOf(Transaction);
    });

    it('should create burn transaction', async () => {
      const amount = 500000000; // 0.5 token
      const result = await musicTokenManager.burnTokens(userWallet, amount);

      expect(result).toBeInstanceOf(Transaction);
    });
  });

  describe('Token Creation', () => {
    it('should create new music token', async () => {
      const payer = new PublicKey('55555555555555555555555555555555');
      const config = {
        decimals: 9,
        supply: 1000000000,
        enableFreeze: false,
        enableMintAuth: false,
        enableBurnAuth: true
      };

      const result = await musicTokenManager.createMusicToken(payer, config);

      expect(result.mint).toBeInstanceOf(PublicKey);
      expect(result.transaction).toBeInstanceOf(Transaction);
    });

    it('should handle token creation errors', async () => {
      const payer = new PublicKey('55555555555555555555555555555555');
      const config = {
        decimals: 9,
        supply: 1000000000,
        enableFreeze: false,
        enableMintAuth: false,
        enableBurnAuth: true
      };

      // Mock error in token creation
      const getAssociatedTokenAddressSpy = jest.spyOn(
        require('@solana/spl-token'),
        'getAssociatedTokenAddress'
      );
      getAssociatedTokenAddressSpy.mockRejectedValue(new Error('Invalid parameter'));

      await expect(musicTokenManager.createMusicToken(payer, config))
        .rejects.toThrow('ExternalServiceError');
    });
  });
});

describe('Music Token Utils', () => {
  it('should format token amounts correctly', () => {
    expect(musicTokenUtils.formatTokenAmount(1000000000)).toBe('1,00');
    expect(musicTokenUtils.formatTokenAmount(1500000000)).toBe('1,50');
    expect(musicTokenUtils.formatTokenAmount(1234567890)).toBe('1,23');
  });

  it('should validate token amounts', () => {
    expect(musicTokenUtils.validateTokenAmount(100)).toBe(true);
    expect(musicTokenUtils.validateTokenAmount(0)).toBe(false);
    expect(musicTokenUtils.validateTokenAmount(-1)).toBe(false);
  });

  it('should calculate access price correctly', () => {
    const basePrice = 1000000; // 0.001 NDT
    const durationMinutes = 30;
    const artistPremium = 1.2;

    const price = musicTokenUtils.calculateAccessPrice(basePrice, durationMinutes, artistPremium);

    expect(price).toBe(basePrice * (durationMinutes / 30) * artistPremium);
  });

  it('should convert between tokens and SOL', () => {
    const tokenAmount = 1000000000; // 1 token
    const tokenPrice = 0.01; // 0.01 SOL per token

    const solAmount = musicTokenUtils.tokensToSol(tokenAmount, tokenPrice);
    expect(solAmount).toBe(10);

    const backToTokens = musicTokenUtils.solToTokens(solAmount, tokenPrice);
    expect(backToTokens).toBe(1000000000);
  });

  it('should generate music token ID correctly', () => {
    const trackId = 'test-track-123';
    const userId = 'user-456';
    const id = musicTokenUtils.generateMusicTokenId(trackId, userId);

    expect(id).toMatch(/^music_test-track-123_user-456_\d+$/);
  });
});

describe('Factory Functions', () => {
  it('should create MusicTokenManager with default values', () => {
    const mockConnection = {} as Connection;
    const manager = createMusicTokenManager(mockConnection);

    expect(manager).toBeInstanceOf(MusicTokenManager);
  });

  it('should create MusicTokenManager with custom values', () => {
    const mockConnection = {} as Connection;
    const customMint = new PublicKey('11111111111111111111111111111113');
    const customAuthority = Keypair.generate();

    const manager = createMusicTokenManager(
      mockConnection,
      customMint,
      customAuthority
    );

    expect(manager).toBeInstanceOf(MusicTokenManager);
  });
});
