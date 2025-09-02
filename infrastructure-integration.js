// Infrastructure Integration for NormalDance
// This file contains integration with existing infrastructure and backward compatibility

const InfrastructureIntegration = {
  // Kubernetes Integration
  kubernetes: {
    // Helm chart configuration
    helm: {
      chartPath: './helm/normaldance',
      values: {
        production: './helm/normaldance/values-production.yaml',
        staging: './helm/normaldance/values-staging.yaml',
        development: './helm/normaldance/values-development.yaml'
      },
      namespaces: {
        production: 'production',
        staging: 'staging',
        development: 'development'
      },
      deployments: {
        app: {
          name: 'normaldance-app',
          replicas: {
            production: 3,
            staging: 2,
            development: 1
          },
          resources: {
            production: {
              limits: { cpu: '2', memory: '4Gi' },
              requests: { cpu: '1', memory: '2Gi' }
            },
            staging: {
              limits: { cpu: '1', memory: '2Gi' },
              requests: { cpu: '500m', memory: '1Gi' }
            },
            development: {
              limits: { cpu: '500m', memory: '1Gi' },
              requests: { cpu: '250m', memory: '512Mi' }
            }
          }
        },
        api: {
          name: 'normaldance-api',
          replicas: {
            production: 3,
            staging: 2,
            development: 1
          },
          resources: {
            production: {
              limits: { cpu: '1', memory: '2Gi' },
              requests: { cpu: '500m', memory: '1Gi' }
            },
            staging: {
              limits: { cpu: '500m', memory: '1Gi' },
              requests: { cpu: '250m', memory: '512Mi' }
            },
            development: {
              limits: { cpu: '250m', memory: '512Mi' },
              requests: { cpu: '125m', memory: '256Mi' }
            }
          }
        },
        websocket: {
          name: 'normaldance-websocket',
          replicas: {
            production: 2,
            staging: 1,
            development: 1
          },
          resources: {
            production: {
              limits: { cpu: '500m', memory: '1Gi' },
              requests: { cpu: '250m', memory: '512Mi' }
            },
            staging: {
              limits: { cpu: '250m', memory: '512Mi' },
              requests: { cpu: '125m', memory: '256Mi' }
            },
            development: {
              limits: { cpu: '125m', memory: '256Mi' },
              requests: { cpu: '64m', memory: '128Mi' }
            }
          }
        }
      }
    },

    // Kubernetes deployment scripts
    deployment: {
      // Deploy to production
      deployProduction: async () => {
        console.log('Deploying to production...');
        const { execSync } = require('child_process');
        
        try {
          // Update Helm chart
          execSync('helm upgrade --install normaldance-prod ./helm/normaldance \
            --namespace production \
            --create-namespace \
            --set image.tag=${{ github.sha }} \
            --set image.tag-api=${{ github.sha }} \
            --set image.tag-websocket=${{ github.sha }} \
            --set env.NODE_ENV=production \
            --set env.DATABASE_URL="${{ secrets.DATABASE_URL_PRODUCTION }}" \
            --set env.SOLANA_RPC_URL="${{ secrets.SOLANA_RPC_URL_PRODUCTION }}" \
            --set env.NEXTAUTH_URL="${{ secrets.NEXTAUTH_URL_PRODUCTION }}" \
            --set env.NEXTAUTH_SECRET="${{ secrets.NEXTAUTH_SECRET_PRODUCTION }}" \
            --wait \
            --timeout=600s', { stdio: 'inherit' });
          
          console.log('Production deployment completed successfully');
        } catch (error) {
          console.error('Production deployment failed:', error);
          throw error;
        }
      },

      // Deploy to staging
      deployStaging: async () => {
        console.log('Deploying to staging...');
        const { execSync } = require('child_process');
        
        try {
          // Update Helm chart
          execSync('helm upgrade --install normaldance-staging ./helm/normaldance \
            --namespace staging \
            --create-namespace \
            --set image.tag=${{ github.sha }} \
            --set image.tag-api=${{ github.sha }} \
            --set image.tag-websocket=${{ github.sha }} \
            --set env.NODE_ENV=staging \
            --set env.DATABASE_URL="${{ secrets.DATABASE_URL_STAGING }}" \
            --set env.SOLANA_RPC_URL="${{ secrets.SOLANA_RPC_URL_STAGING }}" \
            --set env.NEXTAUTH_URL="${{ secrets.NEXTAUTH_URL_STAGING }}" \
            --set env.NEXTAUTH_SECRET="${{ secrets.NEXTAUTH_SECRET_STAGING }}" \
            --wait \
            --timeout=600s', { stdio: 'inherit' });
          
          console.log('Staging deployment completed successfully');
        } catch (error) {
          console.error('Staging deployment failed:', error);
          throw error;
        }
      },

      // Rollback deployment
      rollback: async (environment, revision) => {
        console.log(`Rolling back ${environment} deployment to revision ${revision}...`);
        const { execSync } = require('child_process');
        
        try {
          execSync(`helm rollback normaldance-${environment} ${revision}`, { stdio: 'inherit' });
          console.log(`${environment} rollback completed successfully`);
        } catch (error) {
          console.error(`${environment} rollback failed:`, error);
          throw error;
        }
      }
    }
  },

  // Docker Integration
  docker: {
    // Docker image configuration
    images: {
      app: {
        name: 'normaldance/app',
        platforms: ['linux/amd64', 'linux/arm64'],
        buildArgs: {
          NODE_ENV: 'production',
          BUILDKIT_INLINE_CACHE: '1'
        }
      },
      api: {
        name: 'normaldance/api',
        platforms: ['linux/amd64', 'linux/arm64'],
        buildArgs: {
          NODE_ENV: 'production',
          BUILDKIT_INLINE_CACHE: '1'
        }
      },
      websocket: {
        name: 'normaldance/websocket',
        platforms: ['linux/amd64', 'linux/arm64'],
        buildArgs: {
          NODE_ENV: 'production',
          BUILDKIT_INLINE_CACHE: '1'
        }
      }
    },

    // Docker build and push
    buildAndPush: async (imageType, tag) => {
      console.log(`Building and pushing ${imageType} image with tag ${tag}...`);
      const { execSync } = require('child_process');
      
      try {
        const imageConfig = InfrastructureIntegration.docker.images[imageType];
        const buildCommand = `docker buildx build --platform ${imageConfig.platforms.join(',')} \
          --build-arg NODE_ENV=${imageConfig.buildArgs.NODE_ENV} \
          --build-arg BUILDKIT_INLINE_CACHE=${imageConfig.buildArgs.BUILDKIT_INLINE_CACHE} \
          -t ${imageConfig.name}:${tag} \
          -f ./Dockerfile.${imageType} \
          --push .`;
        
        execSync(buildCommand, { stdio: 'inherit' });
        console.log(`${imageType} image built and pushed successfully`);
      } catch (error) {
        console.error(`${imageType} image build failed:`, error);
        throw error;
      }
    }
  },

  // Monitoring Integration
  monitoring: {
    // Prometheus configuration
    prometheus: {
      configPath: './monitoring/prometheus.yml',
      rulesPath: './monitoring/prometheus/alert_rules.yml',
      alerts: {
        highErrorRate: {
          name: 'High Error Rate',
          condition: 'rate(http_requests_total{status=~"5.."}[5m]) > 0.1',
          duration: '5m',
          severity: 'critical'
        },
        highResponseTime: {
          name: 'High Response Time',
          condition: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1',
          duration: '5m',
          severity: 'warning'
        },
        lowAvailability: {
          name: 'Low Availability',
          condition: 'up == 0',
          duration: '1m',
          severity: 'critical'
        }
      }
    },

    // Grafana configuration
    grafana: {
      dashboards: [
        {
          name: 'NormalDance Overview',
          path: './monitoring/grafana/dashboards/overview.json'
        },
        {
          name: 'API Performance',
          path: './monitoring/grafana/dashboards/api-performance.json'
        },
        {
          name: 'User Analytics',
          path: './monitoring/grafana/dashboards/user-analytics.json'
        }
      ],
      datasources: [
        {
          name: 'Prometheus',
          type: 'prometheus',
          url: 'http://prometheus:9090',
          access: 'proxy'
        },
        {
          name: 'Loki',
          type: 'loki',
          url: 'http://loki:3100',
          access: 'proxy'
        }
      ]
    },

    // Alertmanager configuration
    alertmanager: {
      configPath: './monitoring/alertmanager/alertmanager.yml',
      routes: [
        {
          match: ['severity=critical'],
          receiver: 'critical-alerts',
          groupBy: ['alertname', 'severity']
        },
        {
          match: ['severity=warning'],
          receiver: 'warning-alerts',
          groupBy: ['alertname', 'severity']
        }
      ],
      receivers: [
        {
          name: 'critical-alerts',
          email_configs: [
            {
              to: 'admin@normaldance.com',
              subject: 'CRITICAL: {{ .GroupLabels.alertname }}',
              body: '{{ .CommonAnnotations.description }}'
            }
          ],
          slack_configs: [
            {
              api_url: '${{ secrets.SLACK_WEBHOOK }}',
              channel: '#alerts-critical',
              title: 'CRITICAL Alert',
              text: '{{ .CommonAnnotations.description }}'
            }
          ]
        },
        {
          name: 'warning-alerts',
          slack_configs: [
            {
              api_url: '${{ secrets.SLACK_WEBHOOK }}',
              channel: '#alerts-warning',
              title: 'WARNING Alert',
              text: '{{ .CommonAnnotations.description }}'
            }
          ]
        }
      ]
    }
  },

  // Database Integration
  database: {
    // Prisma configuration
    prisma: {
      schemaPath: './prisma/schema.prisma',
      migrations: {
        generate: 'prisma generate',
        deploy: 'prisma migrate deploy',
        create: 'prisma migrate create',
        reset: 'prisma migrate reset',
        studio: 'prisma studio'
      },
      seeds: {
        run: 'tsx prisma/seed.ts',
        path: './prisma/seed.ts'
      }
    },

    // Database backup
    backup: {
      schedule: '0 2 * * *', // Daily at 2 AM
      retention: 30, // Keep 30 days of backups
      storage: {
        provider: 's3',
        bucket: 'normaldance-backups',
        region: 'us-east-1'
      },
      compression: true,
      encryption: true
    }
  },

  // CI/CD Integration
  cicd: {
    // GitHub Actions integration
    github: {
      workflows: [
        'ci-cd-optimized.yml',
        'version-management.yml',
        'mobile-app.yml',
        'docs.yml'
      ],
      secrets: [
        'GITHUB_TOKEN',
        'VERCEL_TOKEN',
        'VERCEL_ORG_ID',
        'VERCEL_PROJECT_ID',
        'SENTRY_DSN',
        'DATADOG_API_KEY',
        'DATABASE_URL_PRODUCTION',
        'DATABASE_URL_STAGING',
        'SOLANA_RPC_URL_PRODUCTION',
        'SOLANA_RPC_URL_STAGING',
        'NEXTAUTH_SECRET_PRODUCTION',
        'NEXTAUTH_SECRET_STAGING',
        'SLACK_WEBHOOK'
      ]
    },

    // Vercel integration
    vercel: {
      projectId: process.env.VERCEL_PROJECT_ID,
      orgId: process.env.VERCEL_ORG_ID,
      domains: [
        'dnb1st.ru',
        'dnb1st.store',
        'normaldance.com',
        'www.normaldance.com'
      ],
      environments: [
        'production',
        'preview',
        'development'
      ]
    }
  },

  // Backward Compatibility
  compatibility: {
    // Version compatibility matrix
    versions: {
      '1.0.0': {
        supported: true,
        features: ['basic', 'nft', 'streaming'],
        deprecated: ['old-api'],
        removed: []
      },
      '1.0.1': {
        supported: true,
        features: ['basic', 'nft', 'streaming', 'analytics', 'mobile'],
        deprecated: [],
        removed: ['old-api']
      },
      '1.1.0': {
        supported: false,
        features: ['basic', 'nft', 'streaming', 'analytics', 'mobile', 'ai'],
        deprecated: ['old-api'],
        removed: []
      }
    },

    // API versioning
    api: {
      versions: {
        'v1': {
          path: '/api/v1',
          supported: true,
          deprecated: false
        },
        'v2': {
          path: '/api/v2',
          supported: true,
          deprecated: false
        },
        'v3': {
          path: '/api/v3',
          supported: false,
          deprecated: true
        }
      }
    },

    // Database schema migration
    database: {
      migrations: {
        '1.0.0_to_1.0.1': {
          script: './migrations/1.0.0_to_1.0.1.sql',
          rollback: './migrations/1.0.0_to_1.0.1_rollback.sql'
        },
        '1.0.1_to_1.1.0': {
          script: './migrations/1.0.1_to_1.1.0.sql',
          rollback: './migrations/1.0.1_to_1.1.0_rollback.sql'
        }
      }
    },

    // Feature flags
    featureFlags: {
      'old-api': {
        enabled: false,
        description: 'Legacy API endpoints',
        removalDate: '2024-12-31'
      },
      'new-analytics': {
        enabled: true,
        description: 'New analytics system',
        beta: true
      },
      'mobile-app': {
        enabled: true,
        description: 'Mobile application support'
      }
    }
  }
};

// Export configuration
module.exports = InfrastructureIntegration;

// Helper functions
const InfrastructureHelper = {
  // Initialize infrastructure
  initialize: async () => {
    console.log('Initializing infrastructure...');
    // Implementation for infrastructure initialization
  },

  // Check infrastructure health
  checkHealth: async () => {
    console.log('Checking infrastructure health...');
    // Implementation for health check
  },

  // Scale infrastructure
  scale: async (service, replicas) => {
    console.log(`Scaling ${service} to ${replicas} replicas...`);
    // Implementation for scaling
  },

  // Backup infrastructure
  backup: async () => {
    console.log('Creating infrastructure backup...');
    // Implementation for backup
  },

  // Restore infrastructure
  restore: async (backupId) => {
    console.log(`Restoring infrastructure from backup ${backupId}...`);
    // Implementation for restore
  }
};

module.exports.InfrastructureHelper = InfrastructureHelper;