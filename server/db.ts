import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  tracks, InsertTrack, Track,
  playlists, InsertPlaylist, Playlist,
  playlistTracks, InsertPlaylistTrack,
  memorials, InsertMemorial, Memorial,
  donations, InsertDonation,
  recommendations, InsertRecommendation,
  listeningHistory, InsertListeningHistory,
  telegramTransactions, InsertTelegramTransaction
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER OPERATIONS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "solanaAddress", "tonAddress", "ethereumAddress", "telegramUserId", "telegramUsername"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== TRACK OPERATIONS ====================

export async function createTrack(track: InsertTrack): Promise<Track> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tracks).values(track);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(tracks).where(eq(tracks.id, insertedId)).limit(1);
  return inserted[0];
}

export async function getTrackById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tracks).where(eq(tracks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllTracks(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tracks).orderBy(desc(tracks.createdAt)).limit(limit).offset(offset);
}

export async function searchTracks(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tracks)
    .where(
      sql`${tracks.title} LIKE ${`%${query}%`} OR ${tracks.artist} LIKE ${`%${query}%`} OR ${tracks.album} LIKE ${`%${query}%`}`
    )
    .limit(limit);
}

export async function incrementPlayCount(trackId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(tracks)
    .set({ playCount: sql`${tracks.playCount} + 1` })
    .where(eq(tracks.id, trackId));
}

// ==================== PLAYLIST OPERATIONS ====================

export async function createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(playlists).values(playlist);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(playlists).where(eq(playlists.id, insertedId)).limit(1);
  return inserted[0];
}

export async function getUserPlaylists(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(playlists)
    .where(eq(playlists.userId, userId))
    .orderBy(desc(playlists.updatedAt));
}

export async function addTrackToPlaylist(playlistId: number, trackId: number, position: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(playlistTracks).values({
    playlistId,
    trackId,
    position,
  });
}

// ==================== MEMORIAL OPERATIONS ====================

export async function createMemorial(memorial: InsertMemorial): Promise<Memorial> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(memorials).values(memorial);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(memorials).where(eq(memorials.id, insertedId)).limit(1);
  return inserted[0];
}

export async function getAllMemorials(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(memorials)
    .orderBy(desc(memorials.createdAt))
    .limit(limit);
}

export async function getMemorialById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(memorials).where(eq(memorials.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== DONATION OPERATIONS ====================

export async function createDonation(donation: InsertDonation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(donations).values(donation);
  return Number(result[0].insertId);
}

export async function getMemorialDonations(memorialId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(donations)
    .where(eq(donations.memorialId, memorialId))
    .orderBy(desc(donations.createdAt));
}

// ==================== AI RECOMMENDATION OPERATIONS ====================

export async function createRecommendation(recommendation: InsertRecommendation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(recommendations).values(recommendation);
}

export async function getUserRecommendations(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(recommendations)
    .where(eq(recommendations.userId, userId))
    .orderBy(desc(recommendations.score))
    .limit(limit);
}

// ==================== LISTENING HISTORY OPERATIONS ====================

export async function recordListeningHistory(history: InsertListeningHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(listeningHistory).values(history);
}

export async function getUserListeningHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(listeningHistory)
    .where(eq(listeningHistory.userId, userId))
    .orderBy(desc(listeningHistory.playedAt))
    .limit(limit);
}

// ==================== TELEGRAM OPERATIONS ====================

export async function createTelegramTransaction(transaction: InsertTelegramTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(telegramTransactions).values(transaction);
  return Number(result[0].insertId);
}
