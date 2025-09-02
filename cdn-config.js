// CDN Configuration for NormalDance
// This file contains CDN optimization and HTTP to HTTPS redirection configuration

const CDN_CONFIG = {
  // Cloudflare CDN Configuration
  cloudflare: {
    enabled: true,
    domain: 'dnb1st.ru',
    subdomain: 'cdn',
    cacheRules: {
      // Static assets - long cache
      static: {
        pattern: '/(assets|images|fonts|icons)/(.*)',
        cacheLevel: 'cache_everything',
        edgeTTL: 31536000, // 1 year
        browserTTL: 31536000,
        cacheKeyFields: {
          cookie: 'no',
          querystring: 'ignore',
          header: ['accept-encoding']
        }
      },
      // API responses - no cache
      api: {
        pattern: '/api/(.*)',
        cacheLevel: 'bypass',
        edgeTTL: 0,
        browserTTL: 0
      },
      // HTML pages - short cache
      html: {
        pattern: '/(.*)',
        cacheLevel: 'basic',
        edgeTTL: 3600, // 1 hour
        browserTTL: 0,
        cacheKeyFields: {
          cookie: 'all',
          querystring: 'all',
          header: ['accept-encoding', 'user-agent']
        }
      }
    },
    security: {
      // Enable Always Use HTTPS
      alwaysUseHTTPS: true,
      // Enable HTTP Strict Transport Security (HSTS)
      hsts: {
        enabled: true,
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      },
      // Enable Auto Minify
      autoMinify: {
        css: true,
        js: true,
        html: true
      },
      // Enable Security Headers
      securityHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.solana.com https://*.quiknode.pro; media-src 'self' data: blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self';"
      }
    }
  },

  // AWS CloudFront Configuration
  cloudfront: {
    enabled: true,
    distributionConfig: {
      aliases: ['cdn.dnb1st.ru'],
      defaultRootObject: 'index.html',
      defaultCacheBehavior: {
        targetOriginId: 'normaldance-origin',
        viewerProtocolPolicy: 'redirect-to-https',
        allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
        cachedMethods: ['GET', 'HEAD'],
        compress: true,
        forwardedValues: {
          queryString: true,
          cookies: {
            forward: 'none'
          },
          headers: ['Origin']
        },
        minTTL: 0,
        defaultTTL: 3600,
        maxTTL: 31536000,
        cachePolicy: {
          name: 'CachingOptimized',
          minTTL: 0,
          maxTTL: 31536000,
          defaultTTL: 3600,
          parametersInCacheKeyAndForwardedToOrigin: {
            enableAcceptEncodingGzip: true,
            enableAcceptEncodingBrotli: true,
            headersConfig: {
              headerBehavior: 'whitelist',
              headers: {
                items: ['Origin', 'Accept-Encoding']
              }
            },
            cookiesConfig: {
              cookieBehavior: 'none'
            },
            queryStringsConfig: {
              queryStringBehavior: 'all'
            }
          }
        }
      },
      priceClass: 'PriceClass_100',
      enabled: true,
      viewerCertificate: {
        acmCertificateArn: 'arn:aws:acm:region:account-id:certificate/certificate-id',
        sslSupportMethod: 'sni-only',
        minimumProtocolVersion: 'TLSv1.2_2021'
      }
    }
  },

  // HTTP to HTTPS Redirection
  httpRedirect: {
    enabled: true,
    redirectType: '301', // Permanent redirect
    targetDomain: 'dnb1st.ru',
    includeSubdomains: true,
    redirectPath: '/'
  },

  // Performance Optimization
  performance: {
    // Enable Brotli compression
    brotli: true,
    // Enable Gzip compression
    gzip: true,
    // Enable HTTP/2
    http2: true,
    // Enable HTTP/3 (QUIC)
    http3: true,
    // Enable Caching
    caching: {
      staticAssets: {
        ttl: 31536000, // 1 year
        revalidate: false
      },
      html: {
        ttl: 3600, // 1 hour
        revalidate: true
      },
      api: {
        ttl: 0,
        revalidate: false
      }
    },
    // Enable Image Optimization
    imageOptimization: {
      formats: ['webp', 'avif', 'jpeg', 'png'],
      quality: 85,
      sizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 1024, 2048],
      responsive: true,
      lazyLoad: true
    }
  },

  // Security Configuration
  security: {
    // Enable DDoS Protection
    ddosProtection: true,
    // Enable Web Application Firewall (WAF)
    waf: {
      enabled: true,
        rules: [
          'AWSManagedRulesCommonRuleSet',
          'AWSManagedRulesKnownBadInputsRuleSet',
          'AWSManagedRulesSQLiRuleSet',
          'AWSManagedRulesLinuxRuleSet',
          'AWSManagedRulesUnixRuleSet'
        ]
    },
    // Enable Rate Limiting
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 1000,
      burstLimit: 2000
    },
    // Enable Bot Management
    botManagement: {
      enabled: true,
      allowKnownBots: true,
      blockUnknownBots: true
    }
  },

  // Analytics and Monitoring
  analytics: {
    // Enable Real User Monitoring (RUM)
    rum: {
      enabled: true,
      sampleRate: 0.1, // 10% of users
      sessionSampleRate: 0.2 // 20% of sessions
    },
    // Enable Performance Monitoring
    performance: {
      enabled: true,
      metrics: [
        'first-contentful-paint',
        'largest-contentful-paint',
        'first-input-delay',
        'cumulative-layout-shift',
        'time-to-first-byte'
      ]
    },
    // Error Tracking
    errorTracking: {
      enabled: true,
      services: ['sentry', 'datadog']
    }
  }
};

// Export configuration
module.exports = CDN_CONFIG;

// Helper functions for CDN management
const CDNManager = {
  // Initialize CDN configuration
  initialize: () => {
    console.log('Initializing CDN configuration...');
    // Implementation for CDN initialization
  },

  // Update CDN rules
  updateRules: (rules) => {
    console.log('Updating CDN rules:', rules);
    // Implementation for updating CDN rules
  },

  // Purge CDN cache
  purgeCache: (paths) => {
    console.log('Purging CDN cache for paths:', paths);
    // Implementation for cache purging
  },

  // Get CDN status
  getStatus: () => {
    console.log('Getting CDN status...');
    // Implementation for getting CDN status
  },

  // Monitor CDN performance
  monitorPerformance: () => {
    console.log('Monitoring CDN performance...');
    // Implementation for performance monitoring
  }
};

module.exports.CDNManager = CDNManager;