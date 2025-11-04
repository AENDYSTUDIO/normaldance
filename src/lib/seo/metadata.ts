/**
 * SEO Metadata and Schema.org configurations for Normal Dance
 * Implements structured data for music content according to brif.md requirements
 */

import { Metadata } from 'next'

// Organization Schema for Normal Dance
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Normal Dance',
  url: 'https://normaldance.ru',
  logo: 'https://normaldance.ru/logo.png',
  description: 'Децентрализованная музыкальная платформа с Web3-интеграцией',
  sameAs: [
    'https://twitter.com/normaldance',
    'https://instagram.com/normaldance',
    'https://github.com/AENDYSTUDIO/NORMALDANCE-REVOLUTION'
  ],
  foundingDate: '2024',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'RU',
    addressLocality: 'Moscow'
  }
}

// Music Recording Schema
export const musicRecordingSchema = (trackId: string, title: string, artistName: string, duration: number, isrc?: string) => ({
  '@context': 'https://schema.org',
  '@type': 'MusicRecording',
  name: title,
  byArtist: {
    '@type': 'MusicGroup',
    name: artistName
  },
  duration: `PT${Math.floor(duration / 60)}M${duration % 60}S`,
  isrcCode: isrc,
  url: `https://normaldance.ru/tracks/${trackId}`,
  album: {
    '@type': 'MusicAlbum',
    name: title,
    releaseDate: new Date().toISOString().split('T')[0]
  },
  recordingOf: {
    '@type': 'MusicComposition',
    name: title,
    composer: {
      '@type': 'Person',
      name: artistName
    }
  }
})

// Music Album Schema
export const musicAlbumSchema = (albumId: string, title: string, tracks: Array<{title: string, artistName: string, duration: number}> ) => ({
  '@context': 'https://schema.org',
  '@type': 'MusicAlbum',
  name: title,
  albumProductionType: 'StudioAlbum',
  url: `https://normaldance.ru/albums/${albumId}`,
  releaseDate: new Date().toISOString().split('T')[0],
  genre: ['Electronic', 'Experimental', 'Web3'],
  byArtist: tracks.length > 0 ? {
    '@type': 'MusicGroup',
    name: tracks[0].artistName
  } : undefined,
  track: tracks.map((track, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'MusicRecording',
      name: track.title,
      duration: `PT${Math.floor(track.duration / 60)}M${track.duration % 60}S`,
      url: `https://normaldance.ru/tracks/${albumId}-${index}`
    }
  }))
})

// WebSite Schema
export const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Normal Dance',
  url: 'https://normaldance.ru',
  description: 'Децентрализованная музыкальная платформа с инновационными Web3-технологиями для артистов и слушателей',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://normaldance.ru/search?q={search_term_string}',
    queryInput: 'required name=search_term_string'
  },
  mainEntity: organizationSchema
}

// Person Schema (Artist)
export const personSchema = (artistName: string, tracks?: Array<{title: string, playCount: number}>) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: artistName,
  jobTitle: 'Musician',
  description: `Артист платформы Normal Dance`,
  worksFor: {
    '@type': 'Organization',
    name: 'Normal Dance'
  },
  knowsAbout: ['Music', 'Web3', 'Blockchain'],
  awarded: tracks && tracks.some(t => t?.playCount > 1000) ? {
    '@type': 'Award',
    name: 'Popular Track'
  } : undefined
})

// Music Playlist Schema
export const musicPlaylistSchema = (playlistName: string, tracks: Array<{title: string, artistName: string, url: string}>) => ({
  '@context': 'https://schema.org',
  '@type': 'MusicPlaylist',
  name: playlistName,
  description: `Плейлист на Normal Dance`,
  numTracks: tracks.length,
  track: tracks.map((track, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'MusicRecording',
      name: track.title,
      byArtist: {
        '@type': 'MusicGroup',
        name: track.artistName
      },
      url: track.url
    }
  }))
})

// Generate base metadata with SEO optimization
export const generateMetadata = (title?: string, description?: string, imageUrl?: string, trackId?: string): Metadata => {
  const baseTitle = title || 'Normal Dance - Децентрализованная музыкальная платформа'
  const baseDescription = description || 'Normal Dance - инновационная Web3-платформа для музыкального творчества с прозрачными роялти и токенизацией контента'
  const baseImage = imageUrl || 'https://normaldance.ru/og-image.png'
  const url = trackId ? `https://normaldance.ru/tracks/${trackId}` : 'https://normaldance.ru'

  return {
    title: baseTitle,
    description: baseDescription,
    keywords: [
      'музыка',
      'Web3',
      'блокчейн',
      'NFT',
      'SOL',
      'криптовалюта',
      'роялти',
      'артисты',
      'стриминг',
      'децентрализованная платформа'
    ].join(', '),
    authors: [{ name: 'Normal Dance Team' }],
    creator: 'Normal Dance',
    publisher: 'Normal Dance',
    
    // Open Graph
    openGraph: {
      type: trackId ? 'music.song' : 'website',
      siteName: 'Normal Dance',
      locale: 'ru_RU',
      title: baseTitle,
      description: baseDescription,
      url,
      images: [
        {
          url: baseImage,
          width: 1200,
          height: 630,
          alt: baseTitle
        }
      ]
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: '@normaldance',
      creator: '@normaldance',
      title: baseTitle,
      description: baseDescription,
      images: [baseImage]
    },

    // App Links
    alternates: {
      canonical: url
    },

    // Additional SEO
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },

    // Verification and other tags
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    }
  }
}

// JSON-LD Schema integration
export const generateStructuredData = (schema: any) => {
  return JSON.stringify(schema)
}

// Generate breadcrumbs for navigation
export const breadcrumbSchema = (breadcrumbs: Array<{ name: string, url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: crumb.url
  }))
})
