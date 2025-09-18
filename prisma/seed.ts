import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo users
  const user1 = await prisma.user.create({
    data: {
      username: 'demo_artist',
      displayName: 'Demo Artist',
      email: 'artist@demo.com',
      walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      bio: 'Electronic music producer and Web3 enthusiast',
      isArtist: true,
      level: 'GOLD',
      balance: 1000,
    }
  })

  const user2 = await prisma.user.create({
    data: {
      username: 'music_lover',
      displayName: 'Music Lover',
      email: 'listener@demo.com',
      walletAddress: 'FNnt6zUCkKhPRoZKjTNZNjTjdqF8gBFjZKjTNZNjTjdq',
      bio: 'Love discovering new music on Web3',
      isArtist: false,
      level: 'SILVER',
      balance: 500,
    }
  })

  // Create demo tracks
  const track1 = await prisma.track.create({
    data: {
      title: 'Crypto Dreams',
      artist: 'Demo Artist',
      genre: 'electronic',
      duration: 240,
      description: 'A journey through the digital realm',
      ipfsHash: 'QmDemo1Hash1234567890abcdef',
      fileSize: 8500000,
      mimeType: 'audio/mpeg',
      isExplicit: false,
      isPublished: true,
      status: 'PUBLISHED',
      releaseDate: new Date('2024-01-15'),
      publishedAt: new Date('2024-01-15'),
      userId: user1.id,
      playCount: 150,
      likeCount: 25,
    }
  })

  const track2 = await prisma.track.create({
    data: {
      title: 'Blockchain Beats',
      artist: 'Demo Artist',
      genre: 'techno',
      duration: 320,
      description: 'Heavy beats for the decentralized future',
      ipfsHash: 'QmDemo2Hash1234567890abcdef',
      fileSize: 12000000,
      mimeType: 'audio/mpeg',
      isExplicit: false,
      isPublished: true,
      status: 'PUBLISHED',
      releaseDate: new Date('2024-01-20'),
      publishedAt: new Date('2024-01-20'),
      userId: user1.id,
      playCount: 89,
      likeCount: 12,
    }
  })

  // Create demo playlist
  const playlist1 = await prisma.playlist.create({
    data: {
      name: 'Web3 Vibes',
      description: 'The best of decentralized music',
      isPublic: true,
      userId: user2.id,
      playCount: 45,
    }
  })

  // Add tracks to playlist
  await prisma.playlistTrack.create({
    data: {
      playlistId: playlist1.id,
      trackId: track1.id,
      position: 1,
    }
  })

  await prisma.playlistTrack.create({
    data: {
      playlistId: playlist1.id,
      trackId: track2.id,
      position: 2,
    }
  })

  // Create demo likes
  await prisma.like.create({
    data: {
      userId: user2.id,
      trackId: track1.id,
    }
  })

  // Create demo follow
  await prisma.follow.create({
    data: {
      followerId: user2.id,
      followingId: user1.id,
    }
  })

  // Create demo play history
  await prisma.playHistory.create({
    data: {
      userId: user2.id,
      trackId: track1.id,
      duration: 240,
      completed: true,
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Created users: ${user1.username}, ${user2.username}`)
  console.log(`🎵 Created tracks: ${track1.title}, ${track2.title}`)
  console.log(`📝 Created playlist: ${playlist1.name}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })