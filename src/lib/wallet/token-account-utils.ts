import { 
  Connection, 
  PublicKey, 
  TransactionInstruction, 
  Transaction
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  AccountLayout
} from '@solana/spl-token';
import { logger } from '@/lib/utils/logger';
import { ExternalServiceError, ValidationError } from '@/lib/errors/AppError';

/**
 * Утилиты для автоматического создания和管理 токен аккаунтов
 */

export interface TokenAccountCreationParams {
  userWallet: PublicKey;
  tokenMint: PublicKey;
  payer: PublicKey;
}

export interface TokenAccountInfo {
  address: PublicKey;
  mint: PublicKey;
  owner: PublicKey;
  balance: number;
  delegate: PublicKey | null;
  isFrozen: boolean;
  isInitialized: boolean;
}

export class TokenAccountUtils {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Получить или создать ассоциированный токен аккаунт
   * Возвращает существующий аккаунт или инструкцию для создания нового
   */
  async getOrCreateTokenAccount(
    userWallet: PublicKey,
    tokenMint: PublicKey,
    payer?: PublicKey
  ): Promise<{
    account: PublicKey;
    exists: boolean;
    creationInstruction?: TransactionInstruction;
  }> {
    try {
      const accountPayer = payer || userWallet;
      const tokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        userWallet,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Проверяем существует ли аккаунт
      const accountInfo = await this.connection.getAccountInfo(tokenAccount);
      
      if (accountInfo) {
        // Аккаунт существует
        const parsedAccount = getAccount(this.connection, tokenAccount);
        
        return {
          account: tokenAccount,
          exists: true,
          // Проверяем совпадают ли mint и owner
          ...this.parseAccountInfo(parsedAccount)
        };
      }

      // Аккаунт не существует, создаем инструкцию для создания
      const createInstruction = createAssociatedTokenAccountInstruction(
        accountPayer,
        tokenAccount,
        userWallet,
        tokenMint
      );

      return {
        account: tokenAccount,
        exists: false,
        creationInstruction: createInstruction
      };
    } catch (error) {
      logger.error("Error getting/creating token account", error as Error, {
        userWallet: userWallet.toString(),
        tokenMint: tokenMint.toString()
      });
      throw new ExternalServiceError("token-account-creation", error as Error);
    }
  }

  /**
   * Создать транзакцию для создания нескольких токен аккаунтов
   */
  async createMultiTokenAccountsTransaction(
    tokenMints: PublicKey[],
    userWallet: PublicKey,
    payer?: PublicKey
  ): Promise<Transaction> {
    const transaction = new Transaction();
    const accountPayer = payer || userWallet;

    for (const mint of tokenMints) {
      const { account, exists, creationInstruction } = await this.getOrCreateTokenAccount(
        userWallet,
        mint,
        accountPayer
      );

      if (!exists && creationInstruction) {
        transaction.add(creationInstruction);
      }
    }

    return transaction;
  }

  /**
   * Проверить и при необходимости создать токен аккаунты для пользователя
   */
  async ensureTokenAccountsExist(
    userWallet: PublicKey,
    tokenMints: PublicKey[],
    payer?: PublicKey
  ): Promise<{
    requiredCreations: PublicKey[];
    transaction: Transaction;
  }> {
    const requiredCreations: PublicKey[] = [];
    const transaction = new Transaction();
    const accountPayer = payer || userWallet;

    for (const mint of tokenMints) {
      const { exists, creationInstruction } = await this.getOrCreateTokenAccount(
        userWallet,
        mint,
        accountPayer
      );

      if (!exists && creationInstruction) {
        requiredCreations.push(mint);
        transaction.add(creationInstruction);
      }
    }

    return {
      requiredCreations,
      transaction
    };
  }

  /**
   * Получить информацию о токен аккаунте
   */
  async getTokenAccountInfo(
    tokenAccount: PublicKey
  ): Promise<TokenAccountInfo | null> {
    try {
      const account = await getAccount(this.connection, tokenAccount);
      
      return {
        address: tokenAccount,
        mint: account.mint,
        owner: account.owner,
        balance: Number(account.amount),
        delegate: account.delegate,
        isFrozen: account.isFrozen,
        isInitialized: account.isInitialized
      };
    } catch (error) {
      logger.error("Error getting token account info", error as Error, {
        tokenAccount: tokenAccount.toString()
      });
      return null;
    }
  }

  /**
   * Получить все токен аккаунты пользователя
   */
  async getUserTokenAccounts(
    userWallet: PublicKey
  ): Promise<TokenAccountInfo[]> {
    try {
      // Используем getProgramAccounts для поиска всех токен аккаунтов
      const tokenAccounts = await this.connection.getProgramAccounts(
        TOKEN_PROGRAM_ID,
        {
          filters: [
            {
              dataSize: AccountLayout.span, // Размер аккаунта
            },
            {
              memcmp: {
                offset: AccountLayout.offsets.owner, // Смещение для owner
                bytes: userWallet.toBase58(), // Публичный ключ пользователя
              },
            },
          ],
        }
      );

      const accounts: TokenAccountInfo[] = [];

      for (const { pubkey, account } of tokenAccounts) {
        try {
          const parsedAccount = AccountLayout.decode(account.data);
          accounts.push({
            address: pubkey,
            mint: new PublicKey(parsedAccount.mint),
            owner: new PublicKey(parsedAccount.owner),
            balance: Number(parsedAccount.amount),
            delegate: parsedAccount.delegateOption ? new PublicKey(parsedAccount.delegate) : null,
            isFrozen: parsedAccount.state === 2, // Frozen state
            isInitialized: parsedAccount.state !== 0
          });
        } catch (parseError) {
          logger.warn("Failed to parse token account", parseError as Error, {
            account: pubkey.toString()
          });
        }
      }

      return accounts;
    } catch (error) {
      logger.error("Error getting user token accounts", error as Error, {
        userWallet: userWallet.toString()
      });
      throw new ExternalServiceError("user-token-accounts", error as Error);
    }
  }

  /**
   * Проверить баланс токенов
   */
  async getTokenBalance(
    userWallet: PublicKey,
    tokenMint: PublicKey
  ): Promise<number> {
    try {
      const tokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        userWallet
      );

      const account = await getAccount(this.connection, tokenAccount);
      return Number(account.amount);
    } catch (error) {
      // Если аккаунт не существует, баланс 0
      if (error instanceof Error && error.message.includes("Could not find account")) {
        return 0;
      }
      throw new ExternalServiceError("token-balance", error as Error);
    }
  }

  /**
   * Проверить активность токен аккаунта
   */
  async isAccountActive(tokenAccount: PublicKey): Promise<boolean> {
    try {
      const account = await getAccount(this.connection, tokenAccount);
      return account.isInitialized && !account.isFrozen;
    } catch (error) {
      return false;
    }
  }

  /**
   * Получить количество токен аккаунтов пользователя
   */
  async getTokenAccountCount(userWallet: PublicKey): Promise<number> {
    try {
      const accounts = await this.getUserTokenAccounts(userWallet);
      return accounts.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Создать инструкцию для инициализации токен аккаунта (не ассоциированного)
   */
  createInitializeAccountInstruction(
    account: PublicKey,
    userWallet: PublicKey,
    tokenMint: PublicKey,
    payer: PublicKey
  ): TransactionInstruction {
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: account, isSigner: false, isWritable: true },
        { pubkey: userWallet, isSigner: false, isWritable: false },
        { pubkey: tokenMint, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: TOKEN_PROGRAM_ID,
      data: Buffer.from([1]) // Initialize account instruction
    });

    return instruction;
  }
}

/**
 * Фабрика для создания TokenAccountUtils
 */
export function createTokenAccountUtils(connection: Connection): TokenAccountUtils {
  return new TokenAccountUtils(connection);
}

/**
 * Глобальные утилиты для работы с токен аккаунтами
 */
export const tokenAccountUtils = {
  /**
   * Форматирование адреса токен аккаунта
   */
  formatTokenAccountAddress(address: PublicKey): string {
    const str = address.toBase58();
    return `${str.slice(0, 8)}...${str.slice(-8)}`;
  },

  /**
   * Валидация адреса токен аккаунта
   */
  isValidTokenAccount(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Конвертация баланса токенов для отображения
   */
  formatTokenBalance(
    balance: number, 
    decimals: number = 9, 
    showAllDecimals: boolean = false
  ): string {
    const formatted = balance / Math.pow(10, decimals);
    
    if (showAllDecimals) {
      return formatted.toLocaleString('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
      });
    }
    
    return formatted.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: Math.min(6, decimals)
    });
  },

  /**
   * Проверить достаточно ли токенов для операции
   */
  hasEnoughTokens(
    balance: number, 
    required: number, 
    includeFee: number = 0
  ): boolean {
    return balance >= required + includeFee;
  },

  /**
   * Рассчитать комиссию за операцию
   */
  calculateTransactionFee(
    amount: number, 
    feeBps: number = 25 // 0.25% по умолчанию
  ): number {
    return Math.floor((amount * feeBps) / 10000);
  }
};

export default TokenAccountUtils;
