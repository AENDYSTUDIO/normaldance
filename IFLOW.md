# iFlow Configuration

This file defines the iFlow CLI configuration for the NORMALDANCE project.

## Project Overview

NORMALDANCE is a decentralized music platform built with a modern tech stack including Next.js, React, TypeScript, and various Web3 technologies. The platform integrates with blockchain networks like Solana and TON, and features advanced capabilities such as NFT memorials, invisible wallets, and telegram mini-apps.

## Configuration

```json
{
  "project": {
    "name": "NORMALDANCE",
    "version": "0.5.0",
    "description": "Децентрализованная музыкальная платформа"
  },
  "workflows": {
    "development": {
      "start": "npm run dev",
      "build": "npm run build",
      "test": "npm run test",
      "lint": "npm run lint"
    },
    "deployment": {
      "production": "npm run deploy:production",
      "staging": "npm run deploy:staging",
      "check": "npm run deploy:check"
    },
    "git": {
      "feature": "npm run workflow:feature",
      "hotfix": "npm run workflow:hotfix",
      "promote": "npm run workflow:promote",
      "release": "npm run workflow:release"
    },
    "security": {
      "scan": "npm run security:scan",
      "validate": "npm run security:validate",
      "check": "npm run security:check",
      "audit": "npm audit"
    },
    "database": {
      "generate": "npm run db:generate",
      "migrate": "npm run db:migrate",
      "studio": "npm run db:studio",
      "seed": "npm run db:seed"
    },
    "mcp": {
      "start": "npm run mcp:start",
      "dev": "npm run mcp:dev",
      "test": "npm run mcp:test"
    },
    "blockchain": {
      "deploy:nft": "npm run deploy:grave",
      "test:nft": "npm run test:grave",
      "deploy:ton": "npm run deploy:ton",
      "deploy:solana": "npm run deploy:solana"
    },
    "monitoring": {
      "start": "npm run monitoring",
      "analyze": "npm run analyze"
    },
    "docker": {
      "build": "npm run docker:build",
      "run": "npm run docker:run",
      "test": "npm run docker:test"
    }
  },
  "scripts": {
    "test": {
      "unit": "npm run test:unit",
      "integration": "npm run test:integration",
      "e2e": "npm run test:e2e",
      "all": "npm run test:all",
      "coverage": "npm run test:coverage"
    },
    "github": {
      "secrets": "npm run github:secrets:set",
      "actions": "npm run github:actions:test"
    },
    "version": {
      "major": "npm run version:major",
      "minor": "npm run version:minor",
      "patch": "npm run version:patch"
    },
    "storybook": {
      "start": "npm run storybook",
      "build": "npm run build-storybook",
      "test": "npm run test:storybook"
    },
    "ci": {
      "setup": "npm run ci:setup",
      "run": "npm run ci:run"
    }
  },
  "integrations": {
    "telegram": {
      "miniapp": "npm run telegram:miniapp",
      "bot": "npm run telegram:bot"
    },
    "figma": {
      "tokens": "npm run figma:tokens",
      "sync": "npm run figma:sync"
    },
    "vercel": {
      "deploy": "npm run vercel:deploy",
      "preview": "npm run vercel:preview"
    }
  }
}
```

## Customization Instructions

The iFlow CLI can use this configuration to understand how to interact with the NORMALDANCE project. The workflows section defines common development tasks, while the scripts section provides access to specific functionalities. The integrations section defines third-party service connections.

## iFlow Interaction Patterns

iFlow CLI can leverage the following patterns when working with NORMALDANCE:

1. **Development Workflow**: Standard development cycle with hot-reloading
2. **Feature Branching**: Git workflow for feature development
3. **Security Scanning**: Automated security checks
4. **Blockchain Integration**: NFT deployment and testing
5. **Monitoring**: Application performance monitoring
6. **Storybook**: Component development environment
7. **Third-party Integrations**: Telegram mini-apps and Figma tokens
8. **Docker Operations**: Containerized development and deployment
9. **CI/CD Automation**: Continuous integration and deployment

## Tech Stack Integration

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: MariaDB, Prisma
- **Blockchain**: Solana, TON, Solidity
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **MCP**: Model Context Protocol integration
- **UI Components**: Radix UI, React Hook Form, Framer Motion
- **State Management**: Zustand
- **Testing**: Jest, Playwright, Storybook
- **Monitoring**: Sentry, Vercel Analytics

## Common iFlow Commands

### Core Development
- `iflow dev` - Start development server
- `iflow test` - Run tests
- `iflow build` - Build the application
- `iflow deploy` - Deploy to production

### Git Workflows
- `iflow workflow:feature <name>` - Create a new feature branch
- `iflow workflow:hotfix <name>` - Create a hotfix branch
- `iflow workflow:promote` - Promote changes through environments
- `iflow workflow:release` - Create a release branch

### Security & Quality
- `iflow security:scan` - Run security scan
- `iflow security:validate` - Validate security configurations
- `iflow security:audit` - Run npm audit
- `iflow lint` - Run code linting

### Database
- `iflow db:migrate` - Run database migrations
- `iflow db:studio` - Open Prisma Studio
- `iflow db:seed` - Seed database with initial data

### Blockchain
- `iflow blockchain:deploy:nft` - Deploy NFT contracts
- `iflow blockchain:test:nft` - Test NFT functionality
- `iflow blockchain:deploy:ton` - Deploy to TON blockchain
- `iflow blockchain:deploy:solana` - Deploy to Solana blockchain

### Integrations
- `iflow mcp:dev` - Start MCP development server
- `iflow storybook` - Start Storybook component development
- `iflow telegram:miniapp` - Start Telegram mini-app development
- `iflow figma:tokens` - Sync Figma design tokens

### Docker Operations
- `iflow docker:build` - Build Docker images
- `iflow docker:run` - Run Docker containers
- `iflow docker:test` - Run tests in Docker environment

### Monitoring & Maintenance
- `iflow monitoring` - Start application monitoring
- `iflow analyze` - Analyze bundle and performance
- `iflow version:major` - Bump major version
- `iflow version:minor` - Bump minor version
- `iflow version:patch` - Bump patch version

### CI/CD
- `iflow ci:setup` - Setup CI environment
- `iflow ci:run` - Run CI pipeline locally
- `iflow github:actions:test` - Test GitHub Actions workflows