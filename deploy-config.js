// Конфигурация для деплоя
export const deployConfig = {
  // Vercel конфигурация
  vercel: {
    name: 'normaldance',
    version: 2,
    builds: [
      { src: 'package.json', use: '@vercel/next' }
    ],
    env: {
      DATABASE_URL: '@database_url',
      NEXTAUTH_SECRET: '@nextauth_secret',
      SUPABASE_URL: '@supabase_url',
      SUPABASE_ANON_KEY: '@supabase_anon_key'
    }
  },
  
  // Railway конфигурация
  railway: {
    services: {
      web: {
        source: {
          repo: 'NORMALDANCE/AENDY_STUDIO'
        },
        variables: {
          NODE_ENV: 'production',
          PORT: '${{ PORT }}'
        }
      }
    }
  },
  
  // Supabase миграции
  supabase: {
    migrations: './prisma/migrations',
    seed: './prisma/seed.js'
  }
}