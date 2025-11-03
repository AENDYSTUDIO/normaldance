/**
 * Feature Flags Configuration
 *
 * This module provides a centralized system for managing feature flags
 * that allow toggling functionality on/off without code changes.
 *
 * Flags can be controlled via environment variables or database configuration.
 */

export interface FeatureFlags {
  // UI Features
  enableNewUI: boolean;
  enableDarkMode: boolean;
  enableMobilePWA: boolean;

  // Backend Features
  enableGraphQL: boolean;
  enableRedisCache: boolean;
  enableSentryMonitoring: boolean;

  // Web3 Features
  enableInvisibleWallet: boolean;
  enableMultiChainSupport: boolean;
  enableDeflationaryModel: boolean;

  // Social Features
  enableChat: boolean;
  enableNFTMarketplace: boolean;
  enableStaking: boolean;

  // Analytics & Performance
  enableAdvancedAnalytics: boolean;
  enablePerformanceMonitoring: boolean;

  // Experimental Features
  enableAIRecSys: boolean;
  enableTelegramMiniApp: boolean;
  enableCrossChainSwaps: boolean;
}

/**
 * Default feature flags configuration
 * These are the baseline flags used when no overrides are provided
 */
const DEFAULT_FLAGS: FeatureFlags = {
  // UI Features
  enableNewUI: true,
  enableDarkMode: true,
  enableMobilePWA: false,

  // Backend Features
  enableGraphQL: false,
  enableRedisCache: true,
  enableSentryMonitoring: true,

  // Web3 Features
  enableInvisibleWallet: true,
  enableMultiChainSupport: false,
  enableDeflationaryModel: true,

  // Social Features
  enableChat: true,
  enableNFTMarketplace: true,
  enableStaking: true,

  // Analytics & Performance
  enableAdvancedAnalytics: true,
  enablePerformanceMonitoring: true,

  // Experimental Features
  enableAIRecSys: false,
  enableTelegramMiniApp: true,
  enableCrossChainSwaps: false,
};

/**
 * Load feature flags from environment variables
 *
 * Environment variables should be prefixed with NEXT_PUBLIC_FF_ for client-side flags
 * and FF_ for server-side flags.
 *
 * Example: NEXT_PUBLIC_FF_ENABLE_GRAPHQL=true
 */
function loadFlagsFromEnv(): Partial<FeatureFlags> {
  const envFlags: Partial<FeatureFlags> = {};

  // UI Features
  if (process.env.NEXT_PUBLIC_FF_ENABLE_NEW_UI !== undefined) {
    envFlags.enableNewUI = process.env.NEXT_PUBLIC_FF_ENABLE_NEW_UI === 'true';
  }
  if (process.env.NEXT_PUBLIC_FF_ENABLE_DARK_MODE !== undefined) {
    envFlags.enableDarkMode = process.env.NEXT_PUBLIC_FF_ENABLE_DARK_MODE === 'true';
  }
  if (process.env.NEXT_PUBLIC_FF_ENABLE_MOBILE_PWA !== undefined) {
    envFlags.enableMobilePWA = process.env.NEXT_PUBLIC_FF_ENABLE_MOBILE_PWA === 'true';
  }

  // Backend Features
  if (process.env.FF_ENABLE_GRAPHQL !== undefined) {
    envFlags.enableGraphQL = process.env.FF_ENABLE_GRAPHQL === 'true';
  }
  if (process.env.FF_ENABLE_REDIS_CACHE !== undefined) {
    envFlags.enableRedisCache = process.env.FF_ENABLE_REDIS_CACHE === 'true';
  }
  if (process.env.FF_ENABLE_SENTRY_MONITORING !== undefined) {
    envFlags.enableSentryMonitoring = process.env.FF_ENABLE_SENTRY_MONITORING === 'true';
  }

  // Web3 Features
  if (process.env.NEXT_PUBLIC_FF_ENABLE_INVISIBLE_WALLET !== undefined) {
    envFlags.enableInvisibleWallet = process.env.NEXT_PUBLIC_FF_ENABLE_INVISIBLE_WALLET === 'true';
  }
  if (process.env.NEXT_PUBLIC_FF_ENABLE_MULTI_CHAIN_SUPPORT !== undefined) {
    envFlags.enableMultiChainSupport = process.env.NEXT_PUBLIC_FF_ENABLE_MULTI_CHAIN_SUPPORT === 'true';
  }
  if (process.env.NEXT_PUBLIC_FF_ENABLE_DEFLATIONARY_MODEL !== undefined) {
    envFlags.enableDeflationaryModel = process.env.NEXT_PUBLIC_FF_ENABLE_DEFLATIONARY_MODEL === 'true';
  }

  // Social Features
  if (process.env.NEXT_PUBLIC_FF_ENABLE_CHAT !== undefined) {
    envFlags.enableChat = process.env.NEXT_PUBLIC_FF_ENABLE_CHAT === 'true';
  }
  if (process.env.NEXT_PUBLIC_FF_ENABLE_NFT_MARKETPLACE !== undefined) {
    envFlags.enableNFTMarketplace = process.env.NEXT_PUBLIC_FF_ENABLE_NFT_MARKETPLACE === 'true';
  }
  if (process.env.NEXT_PUBLIC_FF_ENABLE_STAKING !== undefined) {
    envFlags.enableStaking = process.env.NEXT_PUBLIC_FF_ENABLE_STAKING === 'true';
  }

  // Analytics & Performance
  if (process.env.FF_ENABLE_ADVANCED_ANALYTICS !== undefined) {
    envFlags.enableAdvancedAnalytics = process.env.FF_ENABLE_ADVANCED_ANALYTICS === 'true';
  }
  if (process.env.FF_ENABLE_PERFORMANCE_MONITORING !== undefined) {
    envFlags.enablePerformanceMonitoring = process.env.FF_ENABLE_PERFORMANCE_MONITORING === 'true';
  }

  // Experimental Features
  if (process.env.NEXT_PUBLIC_FF_ENABLE_AI_REC_SYS !== undefined) {
    envFlags.enableAIRecSys = process.env.NEXT_PUBLIC_FF_ENABLE_AI_REC_SYS === 'true';
  }
  if (process.env.NEXT_PUBLIC_FF_ENABLE_TELEGRAM_MINI_APP !== undefined) {
    envFlags.enableTelegramMiniApp = process.env.NEXT_PUBLIC_FF_ENABLE_TELEGRAM_MINI_APP === 'true';
  }
  if (process.env.NEXT_PUBLIC_FF_ENABLE_CROSS_CHAIN_SWAPS !== undefined) {
    envFlags.enableCrossChainSwaps = process.env.NEXT_PUBLIC_FF_ENABLE_CROSS_CHAIN_SWAPS === 'true';
  }

  return envFlags;
}

/**
 * Get the current feature flags configuration
 * Merges defaults with environment overrides
 */
export function getFeatureFlags(): FeatureFlags {
  const envFlags = loadFlagsFromEnv();

  return {
    ...DEFAULT_FLAGS,
    ...envFlags,
  };
}

/**
 * Feature flags singleton instance
 * Cached to avoid repeated environment parsing
 */
let cachedFlags: FeatureFlags | null = null;

/**
 * Get cached feature flags
 * Use this for performance-critical code paths
 */
export function getCachedFeatureFlags(): FeatureFlags {
  if (!cachedFlags) {
    cachedFlags = getFeatureFlags();
  }
  return cachedFlags;
}

/**
 * Check if a specific feature is enabled
 * Convenience function for single flag checks
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getCachedFeatureFlags();
  return flags[feature];
}

/**
 * React hook for using feature flags
 * Re-renders when flags change (in development)
 */
export function useFeatureFlags(): FeatureFlags {
  return getCachedFeatureFlags();
}

/**
 * Clear cached flags (useful for testing or dynamic flag updates)
 */
export function clearFeatureFlagCache(): void {
  cachedFlags = null;
}

/**
 * Export type for use in other modules
 */
export type { FeatureFlags as FeatureFlagsType };
