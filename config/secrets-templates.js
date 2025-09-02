/**
 * Secrets Templates for NORMALDANCE Vercel Environments
 * 
 * This file contains templates for environment secrets across dev, staging, and production.
 * These templates can be used to automatically configure secrets in Vercel.
 */

const SECRET_TEMPLATES = {
  // Development Environment Secrets
  dev: {
    name: 'Development',
    description: 'Development environment secrets for local development and testing',
    secrets: {
      // Core Application
      NEXTAUTH_SECRET: {
        type: 'string',
        required: true,
        description: 'NextAuth.js secret key for development',
        generator: () => this.generateSecret(32),
        validation: (value) => value.length >= 32
      },
      DATABASE_URL: {
        type: 'string',
        required: true,
        description: 'Database connection URL for development',
        default: 'file:./dev.db',
        validation: (value) => value.startsWith('file:') || value.includes('localhost')
      },
      SOLANA_RPC_URL: {
        type: 'string',
        required: true,
        description: 'Solana RPC URL for development',
        default: 'https://api.devnet.solana.com',
        validation: (value) => value.startsWith('https://')
      },
      REDIS_URL: {
        type: 'string',
        required: false,
        description: 'Redis connection URL for development',
        default: 'redis://localhost:6379',
        validation: (value) => value.startsWith('redis://')
      },
      LOG_LEVEL: {
        type: 'string',
        required: false,
        description: 'Logging level for development',
        default: 'debug',
        validation: (value) => ['debug', 'info', 'warn', 'error'].includes(value)
      },
      ENABLE_DEBUG: {
        type: 'boolean',
        required: false,
        description: 'Enable debug mode for development',
        default: 'true',
        validation: (value) => ['true', 'false'].includes(value)
      },
      ENABLE_MOCK_DATA: {
        type: 'boolean',
        required: false,
        description: 'Enable mock data for development',
        default: 'true',
        validation: (value) => ['true', 'false'].includes(value)
      },
      // Development-specific
      NODE_ENV: {
        type: 'string',
        required: false,
        description: 'Node environment',
        default: 'development',
        validation: (value) => value === 'development'
      },
      PORT: {
        type: 'string',
        required: false,
        description: 'Port for development server',
        default: '3000',
        validation: (value) => !isNaN(parseInt(value))
      },
      SOCKET_PORT: {
        type: 'string',
        required: false,
        description: 'Port for WebSocket server',
        default: '3000',
        validation: (value) => !isNaN(parseInt(value))
      }
    }
  },

  // Staging Environment Secrets
  staging: {
    name: 'Staging',
    description: 'Staging environment secrets for testing and pre-production',
    secrets: {
      // Core Application
      NEXTAUTH_SECRET: {
        type: 'string',
        required: true,
        description: 'NextAuth.js secret key for staging',
        generator: () => this.generateSecret(32),
        validation: (value) => value.length >= 32
      },
      DATABASE_URL: {
        type: 'string',
        required: true,
        description: 'Database connection URL for staging',
        validation: (value) => value.includes('staging') || value.includes('postgresql')
      },
      SOLANA_RPC_URL: {
        type: 'string',
        required: true,
        description: 'Solana RPC URL for staging',
        validation: (value) => value.startsWith('https://')
      },
      REDIS_URL: {
        type: 'string',
        required: true,
        description: 'Redis connection URL for staging',
        validation: (value) => value.startsWith('redis://')
      },
      LOG_LEVEL: {
        type: 'string',
        required: false,
        description: 'Logging level for staging',
        default: 'info',
        validation: (value) => ['debug', 'info', 'warn', 'error'].includes(value)
      },
      // Analytics and Monitoring
      ANALYTICS_ENABLED: {
        type: 'boolean',
        required: false,
        description: 'Enable analytics for staging',
        default: 'true',
        validation: (value) => ['true', 'false'].includes(value)
      },
      MONITORING_ENABLED: {
        type: 'boolean',
        required: false,
        description: 'Enable monitoring for staging',
        default: 'true',
        validation: (value) => ['true', 'false'].includes(value)
      },
      SENTRY_DSN: {
        type: 'string',
        required: false,
        description: 'Sentry DSN for error tracking',
        validation: (value) => value.startsWith('https://')
      },
      DATADOG_API_KEY: {
        type: 'string',
        required: false,
        description: 'Datadog API key for monitoring',
        validation: (value) => value.length >= 10
      },
      // Environment-specific
      NODE_ENV: {
        type: 'string',
        required: false,
        description: 'Node environment',
        default: 'staging',
        validation: (value) => value === 'staging'
      },
      NEXTAUTH_URL: {
        type: 'string',
        required: true,
        description: 'NextAuth URL for staging',
        default: 'https://staging.dnb1st.ru',
        validation: (value) => value.startsWith('https://')
      },
      // Security
      JWT_SECRET: {
        type: 'string',
        required: false,
        description: 'JWT secret key for staging',
        generator: () => this.generateSecret(32),
        validation: (value) => value.length >= 32
      }
    }
  },

  // Production Environment Secrets
  production: {
    name: 'Production',
    description: 'Production environment secrets for live deployment',
    secrets: {
      // Core Application
      NEXTAUTH_SECRET: {
        type: 'string',
        required: true,
        description: 'NextAuth.js secret key for production',
        generator: () => this.generateSecret(32),
        validation: (value) => value.length >= 32
      },
      DATABASE_URL: {
        type: 'string',
        required: true,
        description: 'Database connection URL for production',
        validation: (value) => value.includes('production') || value.includes('postgresql')
      },
      SOLANA_RPC_URL: {
        type: 'string',
        required: true,
        description: 'Solana RPC URL for production',
        validation: (value) => value.startsWith('https://')
      },
      REDIS_URL: {
        type: 'string',
        required: true,
        description: 'Redis connection URL for production',
        validation: (value) => value.startsWith('redis://')
      },
      LOG_LEVEL: {
        type: 'string',
        required: false,
        description: 'Logging level for production',
        default: 'warn',
        validation: (value) => ['debug', 'info', 'warn', 'error'].includes(value)
      },
      // Analytics and Monitoring
      ANALYTICS_ENABLED: {
        type: 'boolean',
        required: false,
        description: 'Enable analytics for production',
        default: 'true',
        validation: (value) => ['true', 'false'].includes(value)
      },
      MONITORING_ENABLED: {
        type: 'boolean',
        required: false,
        description: 'Enable monitoring for production',
        default: 'true',
        validation: (value) => ['true', 'false'].includes(value)
      },
      SENTRY_DSN: {
        type: 'string',
        required: true,
        description: 'Sentry DSN for error tracking',
        validation: (value) => value.startsWith('https://')
      },
      DATADOG_API_KEY: {
        type: 'string',
        required: true,
        description: 'Datadog API key for monitoring',
        validation: (value) => value.length >= 10
      },
      // Analytics Platforms
      GOOGLE_ANALYTICS_ID: {
        type: 'string',
        required: false,
        description: 'Google Analytics tracking ID',
        validation: (value) => value.startsWith('G-') || value.startsWith('UA-')
      },
      MIXPANEL_TOKEN: {
        type: 'string',
        required: false,
        description: 'Mixpanel token for analytics',
        validation: (value) => value.length >= 10
      },
      // Environment-specific
      NODE_ENV: {
        type: 'string',
        required: false,
        description: 'Node environment',
        default: 'production',
        validation: (value) => value === 'production'
      },
      NEXTAUTH_URL: {
        type: 'string',
        required: true,
        description: 'NextAuth URL for production',
        default: 'https://dnb1st.ru',
        validation: (value) => value.startsWith('https://')
      },
      // Security
      JWT_SECRET: {
        type: 'string',
        required: true,
        description: 'JWT secret key for production',
        generator: () => this.generateSecret(32),
        validation: (value) => value.length >= 32
      },
      ENCRYPTION_KEY: {
        type: 'string',
        required: true,
        description: 'Encryption key for sensitive data',
        generator: () => this.generateSecret(32),
        validation: (value) => value.length >= 32
      },
      // Cloud Services
      AWS_ACCESS_KEY_ID: {
        type: 'string',
        required: false,
        description: 'AWS access key ID',
        validation: (value) => value.length >= 16
      },
      AWS_SECRET_ACCESS_KEY: {
        type: 'string',
        required: false,
        description: 'AWS secret access key',
        validation: (value) => value.length >= 20
      },
      AWS_REGION: {
        type: 'string',
        required: false,
        description: 'AWS region',
        default: 'us-east-1',
        validation: (value) => ['us-east-1', 'us-west-2', 'eu-west-1'].includes(value)
      },
      // CDN and Infrastructure
      CLOUDFLARE_API_TOKEN: {
        type: 'string',
        required: false,
        description: 'Cloudflare API token',
        validation: (value) => value.length >= 20
      },
      // External Services
      PINATA_API_KEY: {
        type: 'string',
        required: false,
        description: 'Pinata API key for IPFS',
        validation: (value) => value.length >= 10
      },
      PINATA_SECRET_API_KEY: {
        type: 'string',
        required: false,
        description: 'Pinata secret API key',
        validation: (value) => value.length >= 10
      },
      // Email Service
      EMAIL_HOST: {
        type: 'string',
        required: false,
        description: 'Email service host',
        validation: (value) => value.includes('.')
      },
      EMAIL_PORT: {
        type: 'string',
        required: false,
        description: 'Email service port',
        default: '587',
        validation: (value) => !isNaN(parseInt(value))
      },
      EMAIL_USER: {
        type: 'string',
        required: false,
        description: 'Email service username',
        validation: (value) => value.length >= 3
      },
      EMAIL_PASS: {
        type: 'string',
        required: false,
        description: 'Email service password',
        validation: (value) => value.length >= 8
      }
    }
  }
};

class SecretsTemplateManager {
  constructor() {
    this.templates = SECRET_TEMPLATES;
  }

  // Get template for environment
  getTemplate(environment) {
    return this.templates[environment] || null;
  }

  // Get all templates
  getAllTemplates() {
    return this.templates;
  }

  // Get required secrets for environment
  getRequiredSecrets(environment) {
    const template = this.getTemplate(environment);
    if (!template) return [];
    
    return Object.entries(template.secrets)
      .filter(([_, config]) => config.required)
      .map(([key, _]) => key);
  }

  // Get optional secrets for environment
  getOptionalSecrets(environment) {
    const template = this.getTemplate(environment);
    if (!template) return [];
    
    return Object.entries(template.secrets)
      .filter(([_, config]) => !config.required)
      .map(([key, _]) => key);
  }

  // Generate a secure secret
  generateSecret(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Validate secret value against template
  validateSecret(environment, key, value) {
    const template = this.getTemplate(environment);
    if (!template) return false;
    
    const secretConfig = template.secrets[key];
    if (!secretConfig) return false;
    
    if (secretConfig.validation) {
      return secretConfig.validation(value);
    }
    
    return true;
  }

  // Generate secrets from template
  generateSecrets(environment, options = {}) {
    const template = this.getTemplate(environment);
    if (!template) return {};
    
    const secrets = {};
    
    for (const [key, config] of Object.entries(template.secrets)) {
      if (options.includeRequired !== false || config.required) {
        if (config.generator && !options.preserveExisting) {
          secrets[key] = config.generator();
        } else if (config.default) {
          secrets[key] = config.default;
        } else if (config.required) {
          secrets[key] = ''; // Will need to be provided
        }
      }
    }
    
    return secrets;
  }

  // Export template to JSON
  exportTemplate(environment) {
    const template = this.getTemplate(environment);
    if (!template) return null;
    
    return JSON.stringify(template, null, 2);
  }

  // Import template from JSON
  importTemplate(environment, json) {
    try {
      const template = JSON.parse(json);
      this.templates[environment] = template;
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get template differences between environments
  getTemplateDifferences(env1, env2) {
    const template1 = this.getTemplate(env1);
    const template2 = this.getTemplate(env2);
    
    if (!template1 || !template2) return null;
    
    const secrets1 = Object.keys(template1.secrets);
    const secrets2 = Object.keys(template2.secrets);
    
    const onlyIn1 = secrets1.filter(secret => !secrets2.includes(secret));
    const onlyIn2 = secrets2.filter(secret => !secrets1.includes(secret));
    const common = secrets1.filter(secret => secrets2.includes(secret));
    
    return {
      onlyInEnv1: onlyIn1,
      onlyInEnv2: onlyIn2,
      common: common,
      differences: common.filter(secret => {
        const config1 = template1.secrets[secret];
        const config2 = template2.secrets[secret];
        return JSON.stringify(config1) !== JSON.stringify(config2);
      })
    };
  }
}

// Export templates and manager
module.exports = {
  SECRET_TEMPLATES,
  SecretsTemplateManager
};

// Export individual templates
module.exports.dev = SECRET_TEMPLATES.dev;
module.exports.staging = SECRET_TEMPLATES.staging;
module.exports.production = SECRET_TEMPLATES.production;