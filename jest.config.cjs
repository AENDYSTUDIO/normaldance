module.exports = {
  projects: [
    {
      displayName: 'Unit Tests (Node)',
      preset: 'ts-jest',
      testEnvironment: 'node',
      setupFiles: ['<rootDir>/tests/setup.js'],
      testMatch: [
        '**/__tests__/**/*.(ts|tsx|js)',
        '**/*.(test|spec).(ts|tsx|js)',
        '!**/tests/unit/components/**',
        '!**/tests/unit/**/*.component.(ts|tsx|js)',
        '!**/tests/unit/**/*.(test|spec).(tsx|jsx)'
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
      ],
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          {
            tsconfig: 'tsconfig.json',
          }
        ],
      },
      transformIgnorePatterns: [
        'node_modules/(?!(node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill|isomorphic-dompurify|@solana|@toruslabs|@babel/runtime|@walletconnect|@solana/wallet-adapter|@solana/web3.js|@solana/wallet-adapter-base|@solana/wallet-adapter-react|@solana/wallet-adapter-react-ui|@solana/wallet-adapter-wallets|@solana/pay|@solana/spl-token|@solana/wallet-adapter-phantom|@solana/wallet-adapter-bitkeep|@solana/wallet-adapter-bitpie|@solana/wallet-adapter-blocto|@solana/wallet-adapter-clover|@solana/wallet-adapter-coin98|@solana/wallet-adapter-coinbase|@solana/wallet-adapter-coinhub|@solana/wallet-adapter-exodus|@solana/wallet-adapter-glow|@solana/wallet-adapter-huobi|@solana/wallet-adapter-hyperpay|@solana/wallet-adapter-keystone|@solana/wallet-adapter-krystal|@solana/wallet-adapter-ledger|@solana/wallet-adapter-mathwallet|@solana/wallet-adapter-neko|@solana/wallet-adapter-nightly|@solana/wallet-adapter-nufi|@solana/wallet-adapter-onto|@solana/wallet-adapter-particle|@solana/wallet-adapter-phantom|@solana/wallet-adapter-safepal|@solana/wallet-adapter-saifu|@solana/wallet-adapter-salmon|@solana/wallet-adapter-sky|@solana/wallet-adapter-solflare|@solana/wallet-adapter-sollet|@solana/wallet-adapter-solong|@solana/wallet-adapter-spot|@solana/wallet-adapter-tokenary|@solana/wallet-adapter-tokenpocket|@solana/wallet-adapter-torus|@solana/wallet-adapter-trust|@solana/wallet-adapter-unsafe-burner|@solana/wallet-adapter-walletconnect|@solana/wallet-adapter-xdefi)/)'
      ],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      testPathIgnorePatterns: [
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
        '<rootDir>/tests/e2e/',
        '<rootDir>/tests/unit/components/'
      ],
    },
    {
      displayName: 'Component Tests (JSDOM)',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
      testMatch: [
        '**/tests/unit/components/**/*.(ts|tsx|js)',
        '**/tests/unit/**/*.component.(ts|tsx|js)',
        '**/tests/unit/**/*.(test|spec).(tsx|jsx)'
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
      ],
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          {
            tsconfig: 'tsconfig.json',
          }
        ],
      },
      transformIgnorePatterns: [
        'node_modules/(?!(node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill|isomorphic-dompurify|@solana|@toruslabs|@babel/runtime|@walletconnect|@solana/wallet-adapter|@solana/web3.js|@solana/wallet-adapter-base|@solana/wallet-adapter-react|@solana/wallet-adapter-react-ui|@solana/wallet-adapter-wallets|@solana/pay|@solana/spl-token|@solana/wallet-adapter-phantom|@solana/wallet-adapter-bitkeep|@solana/wallet-adapter-bitpie|@solana/wallet-adapter-blocto|@solana/wallet-adapter-clover|@solana/wallet-adapter-coin98|@solana/wallet-adapter-coinbase|@solana/wallet-adapter-coinhub|@solana/wallet-adapter-exodus|@solana/wallet-adapter-glow|@solana/wallet-adapter-huobi|@solana/wallet-adapter-hyperpay|@solana/wallet-adapter-keystone|@solana/wallet-adapter-krystal|@solana/wallet-adapter-ledger|@solana/wallet-adapter-mathwallet|@solana/wallet-adapter-neko|@solana/wallet-adapter-nightly|@solana/wallet-adapter-nufi|@solana/wallet-adapter-onto|@solana/wallet-adapter-particle|@solana/wallet-adapter-phantom|@solana/wallet-adapter-safepal|@solana/wallet-adapter-saifu|@solana/wallet-adapter-salmon|@solana/wallet-adapter-sky|@solana/wallet-adapter-solflare|@solana/wallet-adapter-sollet|@solana/wallet-adapter-solong|@solana/wallet-adapter-spot|@solana/wallet-adapter-tokenary|@solana/wallet-adapter-tokenpocket|@solana/wallet-adapter-torus|@solana/wallet-adapter-trust|@solana/wallet-adapter-unsafe-burner|@solana/wallet-adapter-walletconnect|@solana/wallet-adapter-xdefi)/)'
      ],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      testPathIgnorePatterns: [
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
        '<rootDir>/tests/e2e/'
      ],
    }
 ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
};
