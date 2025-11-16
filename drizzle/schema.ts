import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with Web3 and platform-specific fields.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Web3 wallet addresses
  solanaAddress: varchar("solanaAddress", { length: 64 }),
  tonAddress: varchar("tonAddress", { length: 64 }),
  ethereumAddress: varchar("ethereumAddress", { length: 64 }),
  
  // Telegram integration
  telegramUserId: varchar("telegramUserId", { length: 64 }),
  telegramUsername: varchar("telegramUsername", { length: 64 }),
  
  // User preferences
  preferredWallet: mysqlEnum("preferredWallet", ["solana", "ton", "ethereum"]),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Music tracks table
 */
export const tracks = mysqlTable("tracks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }).notNull(),
  album: varchar("album", { length: 255 }),
  duration: int("duration").notNull(), // in seconds
  
  // IPFS storage
  ipfsCid: varchar("ipfsCid", { length: 128 }).notNull(),
  coverImageUrl: text("coverImageUrl"),
  
  // Metadata
  genre: varchar("genre", { length: 64 }),
  releaseYear: int("releaseYear"),
  description: text("description"),
  
  // Upload info
  uploadedBy: int("uploadedBy").notNull(),
  
  // Stats
  playCount: int("playCount").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = typeof tracks.$inferInsert;

/**
 * Playlists table
 */
export const playlists = mysqlTable("playlists", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  coverImageUrl: text("coverImageUrl"),
  
  userId: int("userId").notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = typeof playlists.$inferInsert;

/**
 * Playlist tracks junction table
 */
export const playlistTracks = mysqlTable("playlistTracks", {
  id: int("id").autoincrement().primaryKey(),
  playlistId: int("playlistId").notNull(),
  trackId: int("trackId").notNull(),
  position: int("position").notNull(),
  
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type PlaylistTrack = typeof playlistTracks.$inferSelect;
export type InsertPlaylistTrack = typeof playlistTracks.$inferInsert;

/**
 * G.Rave Memorial System - Digital memorials for artists
 */
export const memorials = mysqlTable("memorials", {
  id: int("id").autoincrement().primaryKey(),
  
  // Memorial info
  artistName: varchar("artistName", { length: 255 }).notNull(),
  artistBio: text("artistBio"),
  birthDate: timestamp("birthDate"),
  deathDate: timestamp("deathDate"),
  
  // Visual elements
  vinylImageUrl: text("vinylImageUrl"),
  profileImageUrl: text("profileImageUrl"),
  
  // Blockchain
  smartContractAddress: varchar("smartContractAddress", { length: 128 }),
  blockchainNetwork: mysqlEnum("blockchainNetwork", ["ethereum", "polygon", "solana"]),
  
  // IPFS metadata
  metadataIpfsCid: varchar("metadataIpfsCid", { length: 128 }),
  
  // Stats
  totalDonations: int("totalDonations").default(0).notNull(), // in cents
  donationCount: int("donationCount").default(0).notNull(),
  
  // Creator
  createdBy: int("createdBy").notNull(),
  
  // Beneficiaries (98% goes to heirs, 2% to platform)
  beneficiaryAddresses: text("beneficiaryAddresses"), // JSON array of addresses
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Memorial = typeof memorials.$inferSelect;
export type InsertMemorial = typeof memorials.$inferInsert;

/**
 * Donations to memorials
 */
export const donations = mysqlTable("donations", {
  id: int("id").autoincrement().primaryKey(),
  
  memorialId: int("memorialId").notNull(),
  donorUserId: int("donorUserId"),
  
  // Payment info
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  
  // Transaction details
  transactionHash: varchar("transactionHash", { length: 128 }),
  paymentMethod: mysqlEnum("paymentMethod", ["crypto", "telegram_stars", "card"]).notNull(),
  walletAddress: varchar("walletAddress", { length: 128 }),
  
  // Message
  message: text("message"),
  donorName: varchar("donorName", { length: 255 }),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;

/**
 * AI Recommendations tracking
 */
export const recommendations = mysqlTable("recommendations", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull(),
  trackId: int("trackId").notNull(),
  
  // Recommendation metadata
  score: int("score").notNull(), // 0-100
  reason: text("reason"),
  
  // User interaction
  wasPlayed: boolean("wasPlayed").default(false).notNull(),
  wasLiked: boolean("wasLiked").default(false).notNull(),
  wasSkipped: boolean("wasSkipped").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = typeof recommendations.$inferInsert;

/**
 * User listening history for AI training
 */
export const listeningHistory = mysqlTable("listeningHistory", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull(),
  trackId: int("trackId").notNull(),
  
  // Playback info
  playedDuration: int("playedDuration").notNull(), // seconds actually played
  completionRate: int("completionRate").notNull(), // percentage 0-100
  
  // Context
  source: varchar("source", { length: 64 }), // "search", "playlist", "recommendation", etc.
  
  playedAt: timestamp("playedAt").defaultNow().notNull(),
});

export type ListeningHistory = typeof listeningHistory.$inferSelect;
export type InsertListeningHistory = typeof listeningHistory.$inferInsert;

/**
 * Telegram Stars transactions
 */
export const telegramTransactions = mysqlTable("telegramTransactions", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull(),
  telegramUserId: varchar("telegramUserId", { length: 64 }).notNull(),
  
  // Transaction details
  amount: int("amount").notNull(), // in Telegram Stars
  purpose: varchar("purpose", { length: 128 }).notNull(),
  
  // Related entities
  relatedMemorialId: int("relatedMemorialId"),
  relatedTrackId: int("relatedTrackId"),
  
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TelegramTransaction = typeof telegramTransactions.$inferSelect;
export type InsertTelegramTransaction = typeof telegramTransactions.$inferInsert;
