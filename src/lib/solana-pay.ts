import { SecureLogger } from '@/lib/security/secure-logger';
import { createQR, encodeURL, validateTransfer } from '@solana/pay';
import { Connection, PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export interface SolanaPayConfig {
  recipient: string;
  amount: number;
  label?: string;
  message?: string;
  memo?: string;
  splToken?: string;
}

export class PaymentError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class SolanaPayService {
  private connection: Connection;
  private rpcUrl: string;
  private platformWallet: string;
  private retryConfig = { maxRetries: 3, backoffMs: 1000 };

  constructor(rpcUrl: string, platformWallet: string) {
    if (!rpcUrl || !platformWallet) {
      throw new PaymentError('RPC URL and platform wallet are required');
    }
    this.rpcUrl = rpcUrl;
    this.platformWallet = platformWallet;
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  generatePaymentURL(config: SolanaPayConfig): string {
    try {
      this.validateConfig(config);
      
      const url = encodeURL({
        recipient: new PublicKey(config.recipient || this.platformWallet),
        amount: new BigNumber(config.amount),
        ...(config.label && { label: config.label }),
        ...(config.message && { message: config.message }),
        ...(config.memo && { memo: config.memo }),
        ...(config.splToken && { splToken: new PublicKey(config.splToken) })
      });

      return url.toString();
    } catch (error) {
      SecureLogger.error('Payment URL generation failed:', error);
      throw new PaymentError('Failed to generate payment URL', error as Error);
    }
  }

  createPaymentQR(config: SolanaPayConfig, size: number = 200): string {
    try {
      const url = this.generatePaymentURL(config);
      return createQR(url, size);
    } catch (error) {
      throw new PaymentError('Failed to create QR code', error as Error);
    }
  }

  async validatePaymentWithRetry(signature: string, config: SolanaPayConfig): Promise<boolean> {
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await this.validatePayment(signature, config);
      } catch (error) {
        if (attempt === this.retryConfig.maxRetries) {
          throw new PaymentError('Payment validation failed after retries', error as Error);
        }
        await this.delay(this.retryConfig.backoffMs * attempt);
      }
    }
    return false;
  }

  private async validatePayment(signature: string, config: SolanaPayConfig): Promise<boolean> {
    this.validateConfig(config);
    
    const validated = await validateTransfer(
      this.connection,
      signature,
      {
        recipient: new PublicKey(config.recipient || this.platformWallet),
        amount: new BigNumber(config.amount),
        ...(config.splToken && { splToken: new PublicKey(config.splToken) })
      }
    );

    return validated;
  }

  private validateConfig(config: SolanaPayConfig): void {
    if (!config.amount || config.amount <= 0) {
      throw new PaymentError('Amount must be greater than zero');
    }

    const recipient = config.recipient || this.platformWallet;
    if (!this.isValidSolanaAddress(recipient)) {
      throw new PaymentError('Invalid Solana wallet address');
    }

    if (config.splToken && !this.isValidSolanaAddress(config.splToken)) {
      throw new PaymentError('Invalid SPL token address');
    }
  }

  private isValidSolanaAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  createPaymentRequest(config: SolanaPayConfig): { url: string; qr: string; } {
    const url = this.generatePaymentURL(config);
    const qr = this.createPaymentQR(config);
    return { url, qr };
  }
}