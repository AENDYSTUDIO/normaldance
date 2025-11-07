import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintInstruction,
  createMintToInstruction,
  createTransferInstruction,
  createBurnInstruction,
  getAccount,
  getMint
} from '@solana/spl-token';
import { logger } from '@/lib/utils/logger';
import { AppError, ExternalServiceError, ValidationError } from '@/lib/errors/AppError';

export interface MusicTokenConfig {
  decimals: number;
  supply: number;
  enableFreeze: boolean;
  enableMintAuth: boolean;
  enableBurnAuth: boolean;
}

export interface TokenAccountInfo {
  address: PublicKey;
  balance: number;
  mint: PublicKey;
  owner: PublicKey;
  isInitialized: boolean;
}

export interface MusicAccessData {
  trackId: string;
  artistId: string;
  accessPrice: number;
  accessDuration: number; // в секундах
  maxAccesses: number;
}

export class MusicTokenManager {
  private connection: Connection;
  private mintPublicKey: PublicKey;
  private mintAuthority: Keypair;

  constructor(
    connection: Connection,
    mintAddress: PublicKey,
    mintAuthority: Keypair
  ) {
    this.connection = connection;
    this.mintPublicKey = mintAddress;
    this.mintAuthority = mintAuthority;
  }

  /**
   * Создание нового музыкального токена
   */
  async createMusicToken(
    payer: PublicKey,
    config: MusicTokenConfig
  ): Promise<{ mint: PublicKey; transaction: Transaction }> {
    try {
      const mintKeypair = Keypair.generate();
      const transaction = new Transaction();

      // Создание mint account
      const createMintInstruction = createMintInstruction(
        payer,
        mintKeypair.publicKey,
        payer, // mint authority
        null,  // freeze authority (null unless freeze enabled)
        config.decimals
      );

      transaction.add(createMintInstruction);

      // Добавление метаданных токена (если необходимо)
      const metadataInstruction = await this.createMetadataInstruction(
        mintKeypair.publicKey,
        payer,
        {
          name: "NormalDance Music Access Token",
          symbol: "NDT-MUSIC",
          uri: "https://normaldance.com/metadata/music-access.json",
        }
      );
      
      if (metadataInstruction) {
        transaction.add(metadataInstruction);
      }

      // Mint initial supply
      if (config.supply > 0) {
        const associatedTokenAccount = await getAssociatedTokenAddress(
          mintKeypair.publicKey,
          payer
        );
        
        transaction.add(
          createAssociatedTokenAccountInstruction(
            payer,
            associatedTokenAccount,
            payer,
            mintKeypair.publicKey
          )
        );
        
        transaction.add(
          createMintToInstruction(
            mintKeypair.publicKey,
            associatedTokenAccount,
            payer,
            config.supply * Math.pow(10, config.decimals)
          )
        );
      }

      return {
        mint: mintKeypair.publicKey,
        transaction
      };
    } catch (error) {
      logger.error("Error creating music token", error as Error);
      throw new ExternalServiceError("token-creation", error as Error);
    }
  }

  /**
   * Получить или создать токен аккаунт пользователя
   */
  async getOrCreateTokenAccount(
    userWallet: PublicKey,
    mint: PublicKey = this.mintPublicKey
  ): Promise<{ address: PublicKey; transaction?: Transaction }> {
    try {
      const tokenAccount = await getAssociatedTokenAddress(
        mint,
        userWallet,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Проверка существования аккаунта
      const accountInfo = await this.connection.getAccountInfo(tokenAccount);
      
      if (accountInfo) {
        return { address: tokenAccount };
      }

      // Создание транзакции для создания аккаунта
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          userWallet,  // payer
          tokenAccount, // associated token account
          userWallet,  // owner
          mint         // token mint
        )
      );

      return { address: tokenAccount, transaction };
    } catch (error) {
      logger.error("Error getting/creating token account", error as Error);
      throw new ExternalServiceError("token-account", error as Error);
    }
  }

  /**
   * Проверить баланс токенов пользователя
   */
  async getTokenBalance(
    userWallet: PublicKey,
    mint: PublicKey = this.mintPublicKey
  ): Promise<number> {
    try {
      const tokenAccount = await getAssociatedTokenAddress(
        mint,
        userWallet,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const accountInfo = await getAccount(this.connection, tokenAccount);
      return Number(accountInfo.amount);
    } catch (error) {
      // Если аккаунт не существует, возвращаем 0
      if (error instanceof Error && error.message.includes("Could not find account")) {
        return 0;
      }
      throw new ExternalServiceError("token-balance", error as Error);
    }
  }

  /**
   * Mint токены пользователю (для покупки или наград)
   */
  async mintToUser(
    userWallet: PublicKey,
    amount: number,
    mint: PublicKey = this.mintPublicKey
  ): Promise<Transaction> {
    try {
      const { address: tokenAccount, transaction } = await this.getOrCreateTokenAccount(
        userWallet,
        mint
      );

      const finalTransaction = transaction || new Transaction();

      // Mint токены
      const mintInstruction = createMintToInstruction(
        mint,
        tokenAccount,
        this.mintAuthority.publicKey,
        amount
      );

      finalTransaction.add(mintInstruction);

      return finalTransaction;
    } catch (error) {
      logger.error("Error minting tokens to user", error as Error);
      throw new ExternalServiceError("token-mint", error as Error);
    }
  }

  /**
   * Transfer токенов между пользователями
   */
  async transferTokens(
    fromWallet: PublicKey,
    toWallet: PublicKey,
    amount: number,
    mint: PublicKey = this.mintPublicKey
  ): Promise<Transaction> {
    try {
      const fromTokenAccount = await getAssociatedTokenAddress(
        mint,
        fromWallet,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const toTokenAccount = await getAssociatedTokenAddress(
        mint,
        toWallet,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction();

      // Проверка и создание аккаунта получателя
      const toAccountInfo = await this.connection.getAccountInfo(toTokenAccount);
      if (!toAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            fromWallet,
            toTokenAccount,
            toWallet,
            mint
          )
        );
      }

      // Transfer инструкция
      transaction.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          fromWallet,
          amount
        )
      );

      return transaction;
    } catch (error) {
      logger.error("Error transferring tokens", error as Error);
      throw new ExternalServiceError("token-transfer", error as Error);
    }
  }

  /**
   * Burn токенов (для дефляции или отмены доступа)
   */
  async burnTokens(
    userWallet: PublicKey,
    amount: number,
    mint: PublicKey = this.mintPublicKey
  ): Promise<Transaction> {
    try {
      const tokenAccount = await getAssociatedTokenAddress(
        mint,
        userWallet,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction().add(
        createBurnInstruction(
          tokenAccount,
          mint,
          userWallet,
          amount
        )
      );

      return transaction;
    } catch (error) {
      logger.error("Error burning tokens", error as Error);
      throw new ExternalServiceError("token-burn", error as Error);
    }
  }

  /**
   * Проверить доступ трека для пользователя
   */
  async checkTrackAccess(
    userWallet: PublicKey,
    trackId: string,
    accessData: MusicAccessData
  ): Promise<boolean> {
    try {
      const balance = await this.getTokenBalance(userWallet);
      const tokenPrice = accessData.accessPrice;

      // Проверяем баланс токенов
      if (balance < tokenPrice) {
        return false;
      }

      // Здесь можно добавить проверку времени доступа, если токены временные
      return true;
    } catch (error) {
      logger.error("Error checking track access", error as Error);
      return false;
    }
  }

  /**
   * Купить доступ к треку с использованием NDT токенов
   */
  async purchaseTrackAccess(
    userWallet: PublicKey,
    trackId: string,
    accessData: MusicAccessData
  ): Promise<Transaction> {
    try {
      // Проверка доступности трека
      const hasAccess = await this.checkTrackAccess(userWallet, trackId, accessData);
      if (hasAccess) {
        throw new ValidationError("User already has access to this track");
      }

      // Создание транзакции покупки
      return await this.transferTokens(
        userWallet,
        new PublicKey("11111111111111111111111111111111"), // Treasury адрес
        accessData.accessPrice
      );
    } catch (error) {
      logger.error("Error purchasing track access", error as Error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ExternalServiceError("track-access-purchase", error as Error);
    }
  }

  /**
   * Создание инструкций для метаданных токена
   */
  private async createMetadataInstruction(
    mint: PublicKey,
    authority: PublicKey,
    metadata: {
      name: string;
      symbol: string;
      uri: string;
    }
  ): Promise<TransactionInstruction | null> {
    try {
      // В реальной реализации здесь будет взаимодействие с Metaplex
      // Для демонстрации возвращаем null
      return null;
    } catch (error) {
      logger.error("Error creating metadata instruction", error as Error);
      return null;
    }
  }

  /**
   * Получить информацию о токене
   */
  async getTokenInfo(mint: PublicKey = this.mintPublicKey): Promise<any> {
    try {
      const mintInfo = await getMint(this.connection, mint);
      return {
        address: mint,
        supply: Number(mintInfo.supply),
        decimals: mintInfo.decimals,
        mintAuthority: mintInfo.mintAuthority?.toString(),
        freezeAuthority: mintInfo.freezeAuthority?.toString(),
        isInitialized: mintInfo.isInitialized,
      };
    } catch (error) {
      logger.error("Error getting token info", error as Error);
      throw new ExternalServiceError("token-info", error as Error);
    }
  }

  /**
   * Статистика токена
   */
  async getTokenStats(mint: PublicKey = this.mintPublicKey): Promise<{
    totalSupply: number;
    totalHolders: number;
    maxSupply: number;
    currentPrice: number;
  }> {
    try {
      const tokenInfo = await this.getTokenInfo(mint);
      
      // В реальной системе здесь была бы логика для получения числа холдеров
      const totalHolders = 0;
      const maxSupply = 1000000000; // 1B токенов по умолчанию
      const currentPrice = 0.01; // Базовая цена в SOL

      return {
        totalSupply: tokenInfo.supply,
        totalHolders,
        maxSupply,
        currentPrice,
      };
    } catch (error) {
      logger.error("Error getting token stats", error as Error);
      throw new ExternalServiceError("token-stats", error as Error);
    }
  }

  /**
   * Получить список токенов пользователя
   */
  async getUserTokenAccounts(
    userWallet: PublicKey
  ): Promise<TokenAccountInfo[]> {
    try {
      const tokenAccounts: TokenAccountInfo[] = [];
      
      // Здесь будет логика получения всех токен аккаунтов пользователя
      // В реальной реализации используется getProgramAccounts для поиска
      
      return tokenAccounts;
    } catch (error) {
      logger.error("Error getting user token accounts", error as Error);
      throw new ExternalServiceError("user-token-accounts", error as Error);
    }
  }
}

/**
 * Фабрика для создания MusicTokenManager
 */
export function createMusicTokenManager(
  connection: Connection,
  mintAddress?: PublicKey,
  mintAuthority?: Keypair
): MusicTokenManager {
  const defaultMintAddress = new PublicKey(
    process.env.NEXT_PUBLIC_MUSIC_TOKEN_MINT || 
    "DNMToken111111111111111111111111111111111"
  );
  
  const defaultMintAuthority = Keypair.generate(); // В продакшене должен быть безопасно сохранен

  return new MusicTokenManager(
    connection,
    mintAddress || defaultMintAddress,
    mintAuthority || defaultMintAuthority
  );
}

/**
 * Утилиты для работы с музыкальными токенами
 */
export const musicTokenUtils = {
  /**
   * Форматирование количества токенов для отображения
   */
  formatTokenAmount(amount: number, decimals: number = 9): string {
    const formatted = amount / Math.pow(10, decimals);
    return new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    }).format(formatted);
  },

  /**
   * Конвертация токенов в SOL
   */
  tokensToSol(tokenAmount: number, tokenPrice: number): number {
    return tokenAmount * tokenPrice;
  },

  /**
   * Конвертация SOL в токены
   */
  solToTokens(solAmount: number, tokenPrice: number): number {
    return solAmount / tokenPrice;
  },

  /**
   * Расчет стоимости доступа к музыке
   */
  calculateAccessPrice(
    basePrice: number,
    durationMinutes: number,
    artistPremium: number = 1.0
  ): number {
    return Math.floor(basePrice * (durationMinutes / 30) * artistPremium);
  },

  /**
   * Валидация количества токенов
   */
  validateTokenAmount(amount: number): boolean {
    return amount > 0 && amount <= Number.MAX_SAFE_INTEGER;
  },

  /**
   * Генерация ID для музыкального токена
   */
  generateMusicTokenId(trackId: string, userId: string): string {
    return `music_${trackId}_${userId}_${Date.now()}`;
  },
};
