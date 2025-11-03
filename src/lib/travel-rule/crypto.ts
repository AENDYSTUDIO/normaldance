import { SecureLogger } from '@/lib/security/secure-logger';
/**
 * 🔐 Travel Rule Crypto Service
 *
 * Сервис для шифрования, подписи и безопасности передачи данных
 * в соответствии с требованиями FATF и стандартами безопасности
 */

import { createHash, createHmac, randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { generateId } from "../aml-kyc/utils";

export interface TravelRuleSecurityConfig {
  encryption: {
    algorithm: string;
    keyRotationInterval: number; // в днях
  };
  signature: {
    algorithm: string;
    keyId: string;
  };
}

export interface EncryptionKey {
  keyId: string;
  algorithm: string;
  publicKey: string;
  privateKey?: string;
  validFrom: string;
  validUntil?: string;
}

export interface MessageSignature {
  signature: string;
  publicKey: string;
  algorithm: string;
  keyId: string;
}

export class TravelRuleCrypto {
  private config: TravelRuleSecurityConfig;
  private encryptionKeys: Map<string, EncryptionKey> = new Map();
  private signingKeys: Map<string, EncryptionKey> = new Map();

  constructor(config: TravelRuleSecurityConfig) {
    this.config = config;
    this.initializeKeys();
  }

  /**
   * Шифрование сообщения
   */
  async encryptMessage(
    message: any,
    recipientKey: EncryptionKey
  ): Promise<any> {
    try {
      const messageString = JSON.stringify(message);
      const messageBuffer = Buffer.from(messageString, 'utf8');

      // Генерация IV для AES-GCM
      const iv = randomBytes(16); // 128 бит IV для AES
      const key = this.getEncryptionKey();

      // Шифрование с использованием AES-256-GCM
      const cipher = createCipheriv('aes-256-gcm', Buffer.from(key.privateKey!, 'hex'), iv);
      
      let encrypted = cipher.update(messageBuffer);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      const authTag = cipher.getAuthTag();

      // Создание зашифрованного сообщения
      const encryptedMessage = {
        encryptedData: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        keyId: recipientKey.keyId,
        algorithm: 'AES-256-GCM',
        timestamp: new Date().toISOString(),
      };

      return encryptedMessage;
    } catch (error) {
      SecureLogger.error("Error encrypting message:", error);
      throw new Error(`Message encryption failed: ${error}`);
    }
  }

  /**
   * Расшифровка сообщения
   */
  async decryptMessage(encryptedMessage: any): Promise<any> {
    try {
      // Проверка формата зашифрованного сообщения
      if (!encryptedMessage.encryptedData || !encryptedMessage.iv || !encryptedMessage.authTag) {
        throw new Error("Invalid encrypted message format");
      }

      const keyId = encryptedMessage.keyId || this.config.signature.keyId;
      const key = this.getEncryptionKey(keyId);

      if (!key) {
        throw new Error(`Encryption key not found: ${keyId}`);
      }

      // Расшифровка с использованием AES-256-GCM
      const encryptedData = Buffer.from(encryptedMessage.encryptedData, 'base64');
      const iv = Buffer.from(encryptedMessage.iv, 'base64');
      const authTag = Buffer.from(encryptedMessage.authTag, 'base64');

      const decipher = createDecipheriv('aes-256-gcm', Buffer.from(key.privateKey!, 'hex'), iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      const messageString = decrypted.toString('utf8');
      return JSON.parse(messageString);
    } catch (error) {
      SecureLogger.error("Error decrypting message:", error);
      throw new Error(`Message decryption failed: ${error}`);
    }
  }

  /**
   * Подпись сообщения
   */
  async signMessage(message: any): Promise<MessageSignature> {
    try {
      const messageString = JSON.stringify(message);
      const messageHash = createHash('sha256').update(messageString).digest();
      
      const signingKey = this.getSigningKey();
      
      // В реальной системе здесь будет использоваться ECDSA или RSA
      // Для упрощения используем HMAC-SHA256
      const signature = createHmac('sha256', Buffer.from(signingKey.privateKey!, 'hex'))
        .update(messageHash)
        .digest('hex');

      return {
        signature,
        publicKey: signingKey.publicKey,
        algorithm: this.config.signature.algorithm,
        keyId: signingKey.keyId,
      };
    } catch (error) {
      SecureLogger.error("Error signing message:", error);
      throw new Error(`Message signing failed: ${error}`);
    }
  }

  /**
   * Проверка подписи сообщения
   */
  async verifySignature(
    message: any,
    signature: string,
    publicKey: string
  ): Promise<boolean> {
    try {
      const messageString = JSON.stringify(message);
      const messageHash = createHash('sha256').update(messageString).digest();
      
      // Проверка подписи с использованием HMAC-SHA256
      const expectedSignature = createHmac('sha256', Buffer.from(publicKey, 'hex'))
        .update(messageHash)
        .digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      SecureLogger.error("Error verifying signature:", error);
      return false;
    }
  }

  /**
   * Создание хэша сообщения
   */
  createMessageHash(message: any): string {
    const messageString = JSON.stringify(message);
    return createHash('sha256').update(messageString).digest('hex');
  }

  /**
   * Генерация нового ключа шифрования
   */
  generateEncryptionKey(): EncryptionKey {
    const keyId = generateId("enc_key");
    const privateKey = randomBytes(32).toString('hex'); // 256 бит ключ для AES
    const publicKey = this.derivePublicKey(privateKey);

    const now = new Date();
    const validUntil = new Date(now.getTime() + this.config.encryption.keyRotationInterval * 24 * 60 * 60 * 1000);

    const key: EncryptionKey = {
      keyId,
      algorithm: this.config.encryption.algorithm,
      publicKey,
      privateKey,
      validFrom: now.toISOString(),
      validUntil: validUntil.toISOString(),
    };

    this.encryptionKeys.set(keyId, key);
    return key;
  }

  /**
   * Генерация нового ключа подписи
   */
  generateSigningKey(): EncryptionKey {
    const keyId = generateId("sig_key");
    const privateKey = randomBytes(32).toString('hex'); // 256 бит ключ для HMAC
    const publicKey = this.derivePublicKey(privateKey);

    const now = new Date();
    const validUntil = new Date(now.getTime() + this.config.encryption.keyRotationInterval * 24 * 60 * 60 * 1000);

    const key: EncryptionKey = {
      keyId,
      algorithm: this.config.signature.algorithm,
      publicKey,
      privateKey,
      validFrom: now.toISOString(),
      validUntil: validUntil.toISOString(),
    };

    this.signingKeys.set(keyId, key);
    return key;
  }

  /**
   * Получение ключа шифрования
   */
  getEncryptionKey(keyId?: string): EncryptionKey {
    if (keyId) {
      const key = this.encryptionKeys.get(keyId);
      if (key) return key;
    }

    // Возвращаем первый доступный ключ
    const keys = Array.from(this.encryptionKeys.values());
    if (keys.length > 0) {
      return keys[0];
    }

    // Если ключей нет, генерируем новый
    return this.generateEncryptionKey();
  }

  /**
   * Получение ключа подписи
   */
  getSigningKey(keyId?: string): EncryptionKey {
    if (keyId) {
      const key = this.signingKeys.get(keyId);
      if (key) return key;
    }

    // Возвращаем ключ по умолчанию
    const defaultKey = this.signingKeys.get(this.config.signature.keyId);
    if (defaultKey) return defaultKey;

    // Если ключа нет, генерируем новый
    return this.generateSigningKey();
  }

  /**
   * Ротация ключей
   */
  async rotateKeys(): Promise<void> {
    try {
      SecureLogger.log("Starting key rotation...");

      // Генерация новых ключей
      const newEncryptionKey = this.generateEncryptionKey();
      const newSigningKey = this.generateSigningKey();

      // Удаление старых просроченных ключей
      this.removeExpiredKeys();

      SecureLogger.log("Key rotation completed successfully");
      SecureLogger.log(`New encryption key: ${newEncryptionKey.keyId}`);
      SecureLogger.log(`New signing key: ${newSigningKey.keyId}`);
    } catch (error) {
      SecureLogger.error("Error during key rotation:", error);
      throw new Error(`Key rotation failed: ${error}`);
    }
  }

  /**
   * Получение всех активных ключей
   */
  getActiveKeys(): {
    encryption: EncryptionKey[];
    signing: EncryptionKey[];
  } {
    const now = new Date();
    
    const activeEncryptionKeys = Array.from(this.encryptionKeys.values()).filter(
      key => new Date(key.validFrom) <= now && (!key.validUntil || new Date(key.validUntil) > now)
    );

    const activeSigningKeys = Array.from(this.signingKeys.values()).filter(
      key => new Date(key.validFrom) <= now && (!key.validUntil || new Date(key.validUntil) > now)
    );

    return {
      encryption: activeEncryptionKeys,
      signing: activeSigningKeys,
    };
  }

  /**
   * Валидация ключа
   */
  validateKey(key: EncryptionKey): boolean {
    try {
      const now = new Date();
      const validFrom = new Date(key.validFrom);
      const validUntil = key.validUntil ? new Date(key.validUntil) : null;

      if (validFrom > now) {
        return false; // Ключ еще не действителен
      }

      if (validUntil && validUntil <= now) {
        return false; // Ключ истек
      }

      if (!key.publicKey) {
        return false; // Отсутствует публичный ключ
      }

      return true;
    } catch (error) {
      SecureLogger.error("Error validating key:", error);
      return false;
    }
  }

  /**
   * Создание безопасного токена сессии
   */
  createSessionToken(data: any, expiresIn: number = 3600): string {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + expiresIn;

    const tokenData = {
      data,
      iat: now,
      exp: expiresAt,
      jti: generateId("token"),
    };

    const tokenString = JSON.stringify(tokenData);
    const signature = createHmac('sha256', Buffer.from(this.getSigningKey().privateKey!, 'hex'))
      .update(tokenString)
      .digest('hex');

    return Buffer.from(`${tokenString}.${signature}`).toString('base64');
  }

  /**
   * Проверка безопасного токена сессии
   */
  verifySessionToken(token: string): any {
    try {
      const tokenBuffer = Buffer.from(token, 'base64');
      const tokenString = tokenBuffer.toString('utf8');
      const [dataString, signature] = tokenString.split('.');

      if (!dataString || !signature) {
        throw new Error("Invalid token format");
      }

      // Проверка подписи
      const expectedSignature = createHmac('sha256', Buffer.from(this.getSigningKey().privateKey!, 'hex'))
        .update(dataString)
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new Error("Invalid token signature");
      }

      const tokenData = JSON.parse(dataString);
      const now = Math.floor(Date.now() / 1000);

      if (tokenData.exp && tokenData.exp < now) {
        throw new Error("Token expired");
      }

      return tokenData.data;
    } catch (error) {
      SecureLogger.error("Error verifying session token:", error);
      throw new Error(`Token verification failed: ${error}`);
    }
  }

  // Приватные методы

  /**
   * Инициализация ключей
   */
  private initializeKeys(): void {
    // Генерация начальных ключей
    this.generateEncryptionKey();
    this.generateSigningKey();

    // Установка периодической ротации ключей
    setInterval(() => {
      this.rotateKeys();
    }, this.config.encryption.keyRotationInterval * 24 * 60 * 60 * 1000); // Преобразование дней в миллисекунды
  }

  /**
   * Вывод публичного ключа из приватного
   */
  private derivePublicKey(privateKey: string): string {
    // В реальной системе здесь будет использоваться криптографическая библиотека
    // Для упрощения используем хэш от приватного ключа
    return createHash('sha256').update(privateKey).digest('hex');
  }

  /**
   * Удаление просроченных ключей
   */
  private removeExpiredKeys(): void {
    const now = new Date();

    // Удаление просроченных ключей шифрования
    for (const [keyId, key] of this.encryptionKeys) {
      if (key.validUntil && new Date(key.validUntil) <= now) {
        this.encryptionKeys.delete(keyId);
        SecureLogger.log(`Removed expired encryption key: ${keyId}`);
      }
    }

    // Удаление просроченных ключей подписи
    for (const [keyId, key] of this.signingKeys) {
      if (key.validUntil && new Date(key.validUntil) <= now) {
        this.signingKeys.delete(keyId);
        SecureLogger.log(`Removed expired signing key: ${keyId}`);
      }
    }
  }
}

// Экспорт сервиса
export { TravelRuleCrypto };