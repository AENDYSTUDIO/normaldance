// Environment Configuration for NormalDance
// This file contains configuration for different environments: dev, staging, production

const ENVIRONMENTS = {
  // Development Environment
  development: {
    name: 'development',
    domain: 'dev.dnb1st.ru',
    color: '#4ade80',
    features: {
      debug: true,
      verboseLogging: true,
      hotReload: true,
      mockData: true,
      experimentalFeatures: true,
      analytics: false,
      monitoring: false,
      security: {
        enabled: false,
        rateLimiting: false,
        cors: {
          origin: ['http://localhost:3000', 'http://localhost:3001'],
          credentials: true
        }
      }
    },
    build: {
      optimization: false,
      minification: false,
      sourceMaps: 'cheap-module-source-map',
      analyze: false
    },
    deployment: {
      autoDeploy: true,
      previewDeployments: true,
      deploymentTimeout: 300, // 5 minutes
      healthCheckInterval: 30
    },
    database: {
      type: 'sqlite',
      url: 'file:./dev.db',
      logging: true,
      migrations: true,
      seeds: true
    },
    cache: {
      enabled: false,
      ttl: 300,
      maxSize: 1000
    },
    api: {
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true
      },
      rateLimit: {
        enabled: false,
        windowMs: 60000,
        max: 1000
      }
    }
  },

  // Staging Environment
  staging: {
    name: 'staging',
    domain: 'staging.dnb1st.ru',
    color: '#fbbf24',
    features: {
      debug: false,
      verboseLogging: false,
      hotReload: false,
      mockData: false,
      experimentalFeatures: true,
      analytics: true,
      monitoring: true,
      security: {
        enabled: true,
        rateLimiting: true,
        cors: {
          origin: ['https://staging.dnb1st.ru', 'https://dnb1st.ru'],
          credentials: true
        }
      }
    },
    build: {
      optimization: true,
      minification: true,
      sourceMaps: false,
      analyze: true
    },
    deployment: {
      autoDeploy: true,
      previewDeployments: false,
      deploymentTimeout: 600, // 10 minutes
      healthCheckInterval: 60
    },
    database: {
      type: 'postgresql',
      url: process.env.DATABASE_URL_STAGING,
      logging: false,
      migrations: true,
      seeds: false
    },
    cache: {
      enabled: true,
      ttl: 3600,
      maxSize: 10000
    },
    api: {
      cors: {
        origin: ['https://staging.dnb1st.ru', 'https://dnb1st.ru'],
        credentials: true
      },
      rateLimit: {
        enabled: true,
        windowMs: 60000,
        max: 100
      }
    },
    monitoring: {
      sentry: {
        enabled: true,
        environment: 'staging',
        sampleRate: 0.5
      },
      datadog: {
        enabled: true,
        environment: 'staging',
        sampleRate: 0.3
      }
    }
  },

  // Production Environment
  production: {
    name: 'production',
    domain: 'dnb1st.ru',
    color: '#ef4444',
    features: {
      debug: false,
      verboseLogging: false,
      hotReload: false,
      mockData: false,
      experimentalFeatures: false,
      analytics: true,
      monitoring: true,
      security: {
        enabled: true,
        rateLimiting: true,
        cors: {
          origin: ['https://dnb1st.ru', 'https://www.dnb1st.ru'],
          credentials: true
        },
        helmet: {
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", "data:", "https:", "blob:"],
              fontSrc: ["'self'", "data:"],
              connectSrc: ["'self'", "https://*.solana.com", "https://*.quiknode.pro"],
              mediaSrc: ["'self'", "data:", "blob:"],
              objectSrc: ["'none'"],
              baseUri: ["'self'"],
              formAction: ["'self'"],
              frameAncestors: ["'none'"]
            }
          }
        }
      }
    },
    build: {
      optimization: true,
      minification: true,
      sourceMaps: false,
      analyze: false
    },
    deployment: {
      autoDeploy: true,
      previewDeployments: false,
      deploymentTimeout: 900, // 15 minutes
      healthCheckInterval: 120,
      rollbackOnFailure: true,
      blueGreen: true
    },
    database: {
      type: 'postgresql',
      url: process.env.DATABASE_URL_PRODUCTION,
      logging: false,
      migrations: true,
      seeds: false,
      backup: {
        enabled: true,
        schedule: '0 2 * * *', // Daily at 2 AM
        retention: 30
      }
    },
    cache: {
      enabled: true,
      ttl: 86400, // 24 hours
      maxSize: 100000
    },
    api: {
      cors: {
        origin: ['https://dnb1st.ru', 'https://www.dnb1st.ru'],
        credentials: true
      },
      rateLimit: {
        enabled: true,
        windowMs: 60000,
        max: 50
      }
    },
    monitoring: {
      sentry: {
        enabled: true,
        environment: 'production',
        sampleRate: 1.0
      },
      datadog: {
        enabled: true,
        environment: 'production',
        sampleRate: 0.5
      }
    },
    cdn: {
      enabled: true,
      provider: 'cloudflare',
      domain: 'cdn.dnb1st.ru',
      cacheRules: {
        static: {
          ttl: 31536000, // 1 year
          compression: true
        },
        html: {
          ttl: 3600, // 1 hour
          compression: true
        },
        api: {
          ttl: 0,
          compression: true
        }
      }
    },
    ssl: {
      enabled: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      redirect: {
        enabled: true,
        statusCode: 301
      }
    }
  }
};

// Helper functions for environment management
const EnvironmentManager = {
  // Get current environment
  getCurrentEnvironment: () => {
    const nodeEnv = process.env.NODE_ENV || 'development';
    return ENVIRONMENTS[nodeEnv] || ENVIRONMENTS.development;
  },

  // Get environment by name
  getEnvironment: (name) => {
    return ENVIRONMENTS[name] || null;
  },

  // Validate environment configuration
  validateEnvironment: (envName) => {
    const env = ENVIRONMENTS[envName];
    if (!env) {
      throw new Error(`Environment '${envName}' not found`);
    }

    // Validate required fields
    const requiredFields = ['name', 'domain', 'features', 'build', 'deployment'];
    for (const field of requiredFields) {
      if (!env[field]) {
        throw new Error(`Required field '${field}' missing in environment '${envName}'`);
      }
    }

    return true;
  },

  // Get environment-specific configuration
  getEnvironmentConfig: (envName) => {
    const env = ENVIRONMENTS[envName];
    if (!env) {
      throw new Error(`Environment '${envName}' not found`);
    }

    // Validate environment
    EnvironmentManager.validateEnvironment(envName);

    return env;
  },

  // Update environment configuration
  updateEnvironment: (envName, updates) => {
    const env = ENVIRONMENTS[envName];
    if (!env) {
      throw new Error(`Environment '${envName}' not found`);
    }

    // Merge updates
    Object.assign(env, updates);

    // Validate updated environment
    EnvironmentManager.validateEnvironment(envName);

    return env;
  },

  // List all environments
  listEnvironments: () => {
    return Object.keys(ENVIRONMENTS);
  },

  // Get environment variables for deployment
  getEnvironmentVariables: (envName) => {
    const env = ENVIRONMENTS[envName];
    if (!env) {
      throw new Error(`Environment '${envName}' not found`);
    }

    const variables = {
      NODE_ENV: envName,
      DOMAIN: env.domain,
      DATABASE_URL: env.database.url,
      API_URL: `https://${env.domain}/api`,
      NEXTAUTH_URL: `https://${env.domain}`,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      SENTRY_DSN: process.env.SENTRY_DSN,
      DATADOG_API_KEY: process.env.DATADOG_API_KEY,
      SOLANA_RPC_URL: process.env[`SOLANA_RPC_URL_${envName.toUpperCase()}`],
      REDIS_URL: process.env.REDIS_URL,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
      CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
      VERCEL_TOKEN: process.env.VERCEL_TOKEN,
      VERCEL_ORG_ID: process.env.VERCEL_ORG_ID,
      VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID
    };

    // Add environment-specific variables
    if (env.features.analytics) {
      variables.GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID;
      variables.MIXPANEL_TOKEN = process.env.MIXPANEL_TOKEN;
    }

    if (env.features.security.enabled) {
      variables.JWT_SECRET = process.env.JWT_SECRET;
      variables.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
    }

    return variables;
  },

  // Get deployment configuration
  getDeploymentConfig: (envName) => {
    const env = ENVIRONMENTS[envName];
    if (!env) {
      throw new Error(`Environment '${envName}' not found`);
    }

    return {
      environment: envName,
      domain: env.domain,
      features: env.features,
      build: env.build,
      deployment: env.deployment,
      database: env.database,
      cache: env.cache,
      api: env.api,
      monitoring: env.monitoring,
      cdn: env.cdn,
      ssl: env.ssl
    };
  }
};

// Export configuration
module.exports = {
  ENVIRONMENTS,
  EnvironmentManager
};

// Export for different environments
module.exports.development = ENVIRONMENTS.development;
module.exports.staging = ENVIRONMENTS.staging;
module.exports.production = ENVIRONMENTS.production;