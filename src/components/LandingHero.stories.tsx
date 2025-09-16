import type { Meta, StoryObj } from '@storybook/react'
import { LandingHero } from './landing-hero'

const meta: Meta<typeof LandingHero> = {
  title: 'Landing/Hero',
  component: LandingHero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: "NormalDance — Music NFTs. Real Monetization.",
    subtitle: "Mint music NFTs on Solana with 2% burn, stream via IPFS multi-gateway, and get paid.",
    ctaText: "Join Waitlist",
  },
}

export const WithCustomTitle: Story = {
  args: {
    title: "Mint. Stream. Burn.",
    subtitle: "The future of music monetization is here.",
    ctaText: "Get Started",
  },
}

export const Loading: Story = {
  args: {
    title: "NormalDance — Music NFTs. Real Monetization.",
    subtitle: "Mint music NFTs on Solana with 2% burn, stream via IPFS multi-gateway, and get paid.",
    ctaText: "Joining...",
    loading: true,
  },
}
