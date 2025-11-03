import { SecureLogger } from '@/lib/security/secure-logger';
import { 
  createQR, 
  encodeURL, 
  TransactionRequestURLFields,
  validateTransfer, 
  findReference, 
  ValidateTransferParams
} from '@solana/pay'
import { 
  Connection, 
  PublicKey, 
  Keypair,
  Transaction,
  SystemProgram
} from '@solana/web3.js'
import BigNumber from 'bignumber.js'
import * as Sentry from '@sentry/nextjs'

export interface EnhancedSolanaPayConfig {
  recipient: string;
  amount: number;
  label?: string;
  message?: string;
  memo?: string;
  splToken?: string;
  webhook?: string;
  timeout?: number;
}

export interface PaymentResult {
  success: boolean;
  signature?: string;
  error?: string;
  transaction?: Record<string, unknown>;
  fee?: string;
}

export interface TelegramPaymentConfig extends EnhancedSolanaPayConfig {
  enableTelegramVerification?: boolean;
  customVerificationParams?: Record<string, unknown>;
}

export class EnhancedSolanaPayService {
  private connection: Connection;
  private platformWallet: string;
  private webhookUrl?: string;

  constructor(rpcUrl: string, platformWallet: string, webhookUrl?: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.platformWallet = platformWallet;
    this.webhookUrl = webhookUrl;
  }

  /**
   * Generate payment request with enhanced features
   */
  async createEnhancedPaymentRequest(config: EnhancedSolanaPayConfig): Promise<{
    url: string;
    qrCode: string;
    reference: string;
    expiresAt: Date;
    timeout: number;
  }> {
    const {
      recipient,
      amount,
      label = "NormalDance",
      message = `Payment of ${amount} SOL`,
      memo,
      splToken,
      timeout = 300000, // 5 minutes default
    } = config;

    // Generate reference for tracking
    const reference = Keypair.generate();
    
    // Calculate expiration
    const expiresAt = new Date(Date.now() + timeout);

    const transactionRequest: TransactionRequestURLFields = {
      recipient: new PublicKey(recipient),
      amount: new BigNumber(amount),
      label,
      message,
      memo,
      reference: reference.publicKey,
    };

    const encodedURL = encodeURL(transactionRequest);
    const qrCode = createQR(encodedURL, {
      width: 400,
      margin: 0,
      color: {
        dark: "#FFFFFF",
        light: "#2B2D2B",
        transparent: "#0000"
      }
    });

    return {
      url: encodedURL,
      qrCode,
      reference: reference.publicKey.toString(),
      expiresAt,
      timeout
    };
  }

  /**
   * Verify payment using reference tracking
   */
  async verifyPayment(
    reference: string,
    recipient: string,
    expectedAmount?: number,
    splToken?: string
  ): Promise<PaymentResult> {
    try {
      const span = Sentry.startSpan({ name: 'solanaPay.verifyPayment' })
      // Use reference to find a confirmed transaction
      const referenceKey = new PublicKey(reference)
      const recipientKey = new PublicKey(recipient)

      const { signature } = await findReference(this.connection, referenceKey, { finality: 'confirmed' })

      // Validate transfer against expected parameters
      const params: ValidateTransferParams = {
        recipient: recipientKey,
        amount: expectedAmount ? new BigNumber(expectedAmount) : undefined,
        reference: referenceKey,
        splToken: splToken ? new PublicKey(splToken) : undefined,
      }
      await validateTransfer(this.connection, signature, params)

      // Optionally fetch transaction details
      const transaction = await this.connection.getTransaction(signature, { maxSupportedTransactionVersion: 0 })

      if (this.webhookUrl) {
        await this.sendWebhookNotification({
          type: 'payment_verified',
          signature,
          recipient,
          amount: expectedAmount,
          timestamp: new Date().toISOString()
        })
      }

      const result = { success: true, signature, transaction: (transaction as any) || undefined }
      span.end()
      return result
    } catch (error) {
      SecureLogger.error('Payment verification failed:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Find transaction by reference
   */
  private async findTransactionByReference(): Promise<string> {
    throw new Error('Deprecated: use verifyPayment which uses @solana/pay findReference')
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(data: Record<string, unknown>): Promise<void> {
    if (!this.webhookUrl) return;

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }
    } catch (error) {
      SecureLogger.error('Webhook notification failed:', error);
      // Don't throw error to avoid blocking payment flow
    }
  }

  /**
   * Monitor payment status with polling
   */
  async monitorPayment(
    reference: string,
    options: {
      recipient?: string;
      expectedAmount?: number;
      pollingInterval?: number;
      timeout?: number;
      onStatusChange?: (status: PaymentResult) => void;
    } = {}
  ): Promise<PaymentResult> {
    const {
      recipient,
      expectedAmount,
      pollingInterval = 3000,
      timeout = 300000,
      onStatusChange
    } = options;

    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = Math.floor(timeout / pollingInterval);

    while (attempts < maxAttempts) {
      try {
        const result = await this.verifyPayment(
          reference,
          recipient || this.platformWallet,
          expectedAmount
        );

        if (result.success) {
          onStatusChange?.(result);
          return result;
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
      } catch (error) {
        SecureLogger.error(`Payment verification attempt ${attempts} failed:`, error);
        
        // Return failure after too many attempts
        if (attempts >= maxAttempts) {
          return {
            success: false,
            error: `Verification timeout after ${maxAttempts} attempts`,
          };
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
      }
    }

    return {
      success: false,
      error: 'Payment verification failed'
    };
  }

  /**
   * Calculate transaction fee
   */
  async calculateFee(amount: number): Promise<string> {
    try {
      const fee = amount * 0.000005; // 0.05% of amount in SOL
      return fee.toFixed(6);
    } catch (error) {
      SecureLogger.error('Fee calculation failed:', error);
      return '0.000005';
    }
  }

  /**
   * Create Telegram Mini App enhanced payment
   */
  async createTelegramPayment(config: TelegramPaymentConfig): Promise<{
    qrCode: string;
    url: string;
    reference: string;
    expiresAt: Date;
    needsConfirmation: boolean;
  }> {
    const enhancedConfig = await this.createEnhancedPaymentRequest(config);

      return {
        ...enhancedConfig,
        needsConfirmation: true // Telegram Mini App always needs manual confirmation
      };
  }
}

export const enhancedSolanaPayService = new EnhancedSolanaPayService(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
  process.env.NEXT_PUBLIC_PLATFORM_WALLET || process.env.SECRET_KEY,
  process.env.SOLANA_PAY_WEBHOOK_URL
);
