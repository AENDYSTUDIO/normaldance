/**
 * Bridge Client - Secure Communication with Commercial IP Services
 * 
 * This bridge provides secure communication between the open source
 * frontend and private commercial backend services.
 */

import crypto from 'crypto';

export interface BridgeRequestOptions {
  timeout?: number;
  retries?: number;
  service?: 'grave' | 'telegram' | 'ai' | 'privacy' | 'mobile';
}

export interface BridgeResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
  timestamp?: number;
}

export interface ZKProofRequest {
  userId?: string;
  trackIds: string[];
  listeningDuration: number;
  timestamp: number;
}

export interface AIRecommendationRequest {
  userId: string;
  listenHistory: string[];
  preferences?: {
    genres?: string[];
    artists?: string[];
    bpm?: { min: number; max: number };
  };
  context?: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    mood?: 'energetic' | 'relaxed' | 'focused' | 'party';
  };
}

export interface GraveMemorialRequest {
  artistName: string;
  ipfsHash: string;
  heirs: string[];
  message?: string;
  creatorId: string;
}

export interface TelegramMiniAppRequest {
  userId: number;
  action: 'purchase' | 'create_memorial' | 'recommendations' | 'donate';
  payload: any;
  telegramInitData?: string;
}

export class BridgeApiClient {
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly bridgeApiKey: string;
  private tokenCache = new Map<string, { token: string; expires: number }>();

  constructor() {
    this.baseUrl = process.env.PRIVATE_API_BRIDGE_URL || 'https://api.private.normaldance.com';
    this.clientId = process.env.BRIDGE_CLIENT_ID || 'normaldance-frontend';
    this.clientSecret = process.env.BRIDGE_CLIENT_SECRET || '';
    this.bridgeApiKey = process.env.BRIDGE_API_KEY || '';
    
    if (!this.clientSecret) {
      console.warn('Bridge client secret not configured - private features will be unavailable');
    }
  }

  /**
   * Secure API call to private commercial services
   */
  async callCommercialService<T>(
    service: string,
    endpoint: string,
    data?: any,
    options: BridgeRequestOptions = {}
  ): Promise<BridgeResponse<T>> {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    
    try {
      const bridgeToken = await this.getBridgeToken(service, options.service);
      
      const response = await fetch(`${this.baseUrl}/api/${service}/${endpoint}`, {
        method: data ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bridgeToken}`,
          'X-Service-ID': this.clientId,
          'X-Request-ID': requestId,
          'X-Timestamp': Date.now().toString(),
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(options.timeout || 30000),
      });

      if (response.status === 403) {
        // Token might be expired, refresh and retry once
        if (!options.retries) {
          console.warn('Bridge token expired, refreshing and retrying...');
          return this.callCommercialService<T>(service, endpoint, data, { ...options, retries: 1 });
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new BridgeAPIError(
          `API call failed: ${response.status} ${response.statusText}`,
          response.status,
          errorData.error
        );
      }

      const responseData = await response.json();
      
      console.debug('Private API call completed', {
        requestId,
        service,
        endpoint,
        duration: Date.now() - startTime,
        success: responseData.success
      });

      return {
        ...responseData,
        requestId,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('Bridge API call failed', { 
        requestId, 
        service, 
        endpoint, 
        error: error.message 
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Generate or retrieve cached bridge token
   */
  private async getBridgeToken(service: string, scope?: string): Promise<string> {
    const cacheKey = `${service}_${scope || 'default'}`;
    const cached = this.tokenCache.get(cacheKey);
    
    // Check if we have a valid cached token
    if (cached && cached.expires > Date.now()) {
      return cached.token;
    }

    try {
      const token = await this.generateNewBridgeToken(service, scope);
      
      // Cache token for 10 minutes (slightly less than server's 15 minute expiry)
      this.tokenCache.set(cacheKey, {
        token,
        expires: Date.now() + (10 * 60 * 1000)
      });

      return token;
    } catch (error) {
      console.error('Failed to generate bridge token', { error: error.message });
      throw new BridgeAPIError('Authentication failed with private services');
    }
  }

  /**
   * Generate new bridge token from private API
   */
  private async generateNewBridgeToken(service: string, scope?: string): Promise<string> {
    const payload = {
      clientId: this.clientId,
      timestamp: Date.now(),
      service,
      scope: scope || [service],
      // Include user agent for additional security
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    };

    // Generate HMAC-SHA256 signature
    const signature = crypto
      .createHmac('sha256', this.clientSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    try {
      const response = await fetch(`${this.baseUrl}/auth/bridge-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.bridgeApiKey,
        },
        body: JSON.stringify({ payload, signature }),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`);
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Token exchange failed', { error: error.message });
      throw error;
    }
  }

  /**
   * G.Rave Memorial Service Bridge
   */
  async createGraveMemorial(params: GraveMemorialRequest): Promise<BridgeResponse<any>> {
    return this.callCommercialService('grave', 'memorial', params, {
      service: 'grave',
      timeout: 60000, // Memorial creation might take longer
    });
  }

  async donateToMemorial(memorialId: string, amount: number, donorInfo?: any): Promise<BridgeResponse> {
    return this.callCommercialService('grave', `memorial/${memorialId}/donate`, {
      amount,
      donorInfo,
      timestamp: Date.now()
    }, {
      service: 'grave',
      timeout: 45000,
    });
  }

  async getMemorialDetails(memorialId: string): Promise<BridgeResponse> {
    return this.callCommercialService('grave', `memorial/${memorialId}`, undefined, {
      service: 'grave'
    });
  }

  /**
   * AI Recommendations Service Bridge
   */
  async getAIRecommendations(params: AIRecommendationRequest): Promise<BridgeResponse<any[]>> {
    return this.callCommercialService('ai', 'recommendations', params, {
      service: 'ai',
      timeout: 30000,
    });
  }

  async trackAIEffectiveness(userId: string, recommendations: any[], userActions: any[]): Promise<BridgeResponse> {
    return this.callCommercialService('ai', 'track-effectiveness', {
      userId,
      recommendations,
      userActions
    }, {
      service: 'ai'
    });
  }

  /**
   * ZK-Privacy Service Bridge
   */
  async generatePrivateListeningProof(request: ZKProofRequest): Promise<BridgeResponse<any>> {
    return this.callCommercialService('privacy', 'generate-listening-proof', request, {
      service: 'privacy',
      timeout: 45000, // ZK proof generation can be computationally intensive
    });
  }

  async verifyListeningProof(proof: any): Promise<BridgeResponse> {
    return this.callCommercialService('privacy', 'verify-listening-proof', proof, {
      service: 'privacy'
    });
  }

  /**
   * Mobile Optimization Service Bridge
   */
  async optimizeForMobile(deviceInfo: any, userPreferences: any): Promise<BridgeResponse<any>> {
    return this.callCommercialService('mobile', 'optimize', {
      deviceInfo,
      userPreferences
    }, {
      service: 'mobile'
    });
  }

  /**
   * Telegram Mini App Bridge
   */
  async handleTelegramAction(params: TelegramMiniAppRequest): Promise<BridgeResponse> {
    return this.callCommercialService('telegram', 'mini-app/action', params, {
      service: 'telegram',
      timeout: 30000,
    });
  }

  async processTelegramStarsPayment(userId: number, productId: string, amount: number): Promise<BridgeResponse> {
    return this.callCommercialService('telegram', 'payments/stars', {
      userId,
      productId,
      amount,
      timestamp: Date.now()
    }, {
      service: 'telegram'
    });
  }

  /**
   * Health check for private services
   */
  async checkServiceHealth(service: string): Promise<BridgeResponse> {
    return this.callCommercialService(service, 'health', undefined, {
      service: service as any,
      timeout: 10000,
    });
  }

  /**
   * Batch health check for all services
   */
  async checkAllServicesHealth(): Promise<Record<string, BridgeResponse>> {
    const services = ['grave', 'telegram', 'ai', 'privacy', 'mobile'];
    const results: Record<string, BridgeResponse> = {};

    await Promise.allSettled(
      services.map(async (service) => {
        results[service] = await this.checkServiceHealth(service);
      })
    );

    return results;
  }

  /**
   * Clear token cache (useful for testing or token rotation)
   */
  clearTokenCache(): void {
    this.tokenCache.clear();
  }

  /**
   * Get bridge connectivity status
   */
  async getConnectivityStatus(): Promise<{
    connected: boolean;
    services: Record<string, boolean>;
    lastConnected?: number;
  }> {
    try {
      const healthChecks = await this.checkAllServicesHealth();
      const serviceStatus = Object.fromEntries(
        Object.entries(healthChecks).map(([service, check]) => [service, check.success])
      );

      return {
        connected: Object.values(serviceStatus).some(Boolean),
        services: serviceStatus,
        lastConnected: Date.now()
      };
    } catch (error) {
      console.error('Connectivity check failed', error);
      return {
        connected: false,
        services: {
          grave: false,
          telegram: false,
          ai: false,
          privacy: false,
          mobile: false
        }
      };
    }
  }
}

export class BridgeAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public apiError?: string
  ) {
    super(message);
    this.name = 'BridgeAPIError';
  }
}

// Singleton instance for use throughout the application
export const bridgeClient = new BridgeApiClient();
