import { Metadata } from 'next'
import { organizationSchema, webSiteSchema, generateMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = generateMetadata(
  'Normal Dance - Децентрализованная музыкальная платформа Web3',
  'Normal Dance - инновационная Web3-платформа для музыкального творчества с прозрачными роялти, токенизацией музыки и Invisible Wallet для комфортного использования',
  'https://normaldance.ru/og-homepage.png'
)

export const structuredData = {
  organization: organizationSchema,
  website: webSiteSchema
}
