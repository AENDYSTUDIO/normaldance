import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
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
  ethereumAddress: varchar("ethereumAddress", { length: 64 }),
  tonAddress: varchar("tonAddress", { length: 64 }),
  
  // Telegram integration
  telegramId: varchar("telegramId", { length: 64 }),
  telegramUsername: varchar("telegramUsername", { length: 64 }),
  
  // User level and stats
  userLevel: mysqlEnum("userLevel", ["BRONZE", "SILVER", "GOLD", "PLATINUM"]).default("BRONZE").notNull(),
  totalListens: int("totalListens").default(0).notNull(),
  totalUploads: int("totalUploads").default(0).notNull(),
  
  // Token balances (stored as integers to avoid decimal issues, divide by 1000000 for display)
  ndtBalance: int("ndtBalance").default(0).notNull(),
  
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
  userId: int("userId").notNull(),
  
  // IPFS storage
  ipfsCid: varchar("ipfsCid", { length: 128 }),
  ipfsMetadataCid: varchar("ipfsMetadataCid", { length: 128 }),
  
  // Track metadata
  duration: int("duration").default(0).notNull(), // in seconds
  genre: varchar("genre", { length: 64 }),
  coverImageUrl: text("coverImageUrl"),
  
  // Stats
  playCount: int("playCount").default(0).notNull(),
  likeCount: int("likeCount").default(0).notNull(),
  
  // Status
  isPublic: boolean("isPublic").default(true).notNull(),
  
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
  userId: int("userId").notNull(),
  coverImageUrl: text("coverImageUrl"),
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
  position: int("position").default(0).notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

/**
 * NFTs table
 */
export const nfts = mysqlTable("nfts", {
  id: int("id").autoincrement().primaryKey(),
  trackId: int("trackId"),
  ownerId: int("ownerId").notNull(),
  creatorId: int("creatorId").notNull(),
  
  // NFT metadata
  tokenId: varchar("tokenId", { length: 128 }),
  contractAddress: varchar("contractAddress", { length: 128 }),
  blockchain: mysqlEnum("blockchain", ["ethereum", "solana", "polygon"]).notNull(),
  
  // Pricing (stored as integers, divide by 1000000 for display)
  mintPrice: int("mintPrice").default(0).notNull(),
  currentPrice: int("currentPrice").default(0).notNull(),
  
  // Metadata
  metadataUri: text("metadataUri"),
  imageUrl: text("imageUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NFT = typeof nfts.$inferSelect;
export type InsertNFT = typeof nfts.$inferInsert;

/**
 * Staking table
 */
export const stakingPositions = mysqlTable("stakingPositions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Staking details (amounts stored as integers)
  stakedAmount: int("stakedAmount").default(0).notNull(),
  rewardAmount: int("rewardAmount").default(0).notNull(),
  
  // Staking period
  stakingPeriod: mysqlEnum("stakingPeriod", ["30days", "90days", "180days", "365days"]).notNull(),
  apy: int("apy").default(0).notNull(), // stored as percentage * 100 (e.g., 1250 = 12.50%)
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate").notNull(),
  lastClaimDate: timestamp("lastClaimDate"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StakingPosition = typeof stakingPositions.$inferSelect;
export type InsertStakingPosition = typeof stakingPositions.$inferInsert;

/**
 * G.Rave Memorial System
 */
export const graveMemorials = mysqlTable("graveMemorials", {
  id: int("id").autoincrement().primaryKey(),
  trackId: int("trackId").notNull(),
  creatorId: int("creatorId").notNull(),
  
  // Memorial metadata
  dedicatedTo: varchar("dedicatedTo", { length: 255 }).notNull(),
  message: text("message"),
  
  // 3D visualization data
  vinylColor: varchar("vinylColor", { length: 7 }).default("#8B5CF6").notNull(),
  candleCount: int("candleCount").default(27).notNull(),
  
  // Blockchain data
  smartContractAddress: varchar("smartContractAddress", { length: 128 }),
  ipfsMetadataUri: text("ipfsMetadataUri"),
  
  // Donation tracking (stored as integers)
  totalDonations: int("totalDonations").default(0).notNull(),
  platformFee: int("platformFee").default(0).notNull(), // 2% of donations
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GraveMemorial = typeof graveMemorials.$inferSelect;
export type InsertGraveMemorial = typeof graveMemorials.$inferInsert;

/**
 * Wallet transactions
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Transaction details
  type: mysqlEnum("type", ["deposit", "withdrawal", "transfer", "stake", "unstake", "nft_purchase", "donation"]).notNull(),
  amount: int("amount").default(0).notNull(),
  currency: varchar("currency", { length: 16 }).default("NDT").notNull(),
  
  // Blockchain details
  txHash: varchar("txHash", { length: 128 }),
  blockchain: varchar("blockchain", { length: 32 }),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  
  // Related entities
  relatedEntityType: varchar("relatedEntityType", { length: 32 }),
  relatedEntityId: int("relatedEntityId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * User activity/statistics
 */
export const userActivity = mysqlTable("userActivity", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  trackId: int("trackId"),
  
  activityType: mysqlEnum("activityType", ["play", "like", "share", "comment", "upload"]).notNull(),
  
  // Additional metadata
  metadata: text("metadata"), // JSON string for flexible data
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserActivity = typeof userActivity.$inferSelect;
export type InsertUserActivity = typeof userActivity.$inferInsert;
