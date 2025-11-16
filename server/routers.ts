import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Track operations
  tracks: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        const { limit = 50, offset = 0 } = input || {};
        return await db.getAllTracks(limit, offset);
      }),

    search: publicProcedure
      .input(z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ input }) => {
        return await db.searchTracks(input.query, input.limit);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTrackById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        artist: z.string().min(1).max(255),
        album: z.string().max(255).optional(),
        duration: z.number().min(1),
        ipfsCid: z.string().min(1).max(128),
        coverImageUrl: z.string().url().optional(),
        genre: z.string().max(64).optional(),
        releaseYear: z.number().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createTrack({
          ...input,
          uploadedBy: ctx.user.id,
        });
      }),

    play: publicProcedure
      .input(z.object({ trackId: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementPlayCount(input.trackId);
        return { success: true };
      }),

    recordHistory: protectedProcedure
      .input(z.object({
        trackId: z.number(),
        playedDuration: z.number(),
        completionRate: z.number().min(0).max(100),
        source: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.recordListeningHistory({
          userId: ctx.user.id,
          trackId: input.trackId,
          playedDuration: input.playedDuration,
          completionRate: input.completionRate,
          source: input.source,
        });
        return { success: true };
      }),
  }),

  // Playlist operations
  playlists: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserPlaylists(ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        coverImageUrl: z.string().url().optional(),
        isPublic: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createPlaylist({
          ...input,
          userId: ctx.user.id,
        });
      }),

    addTrack: protectedProcedure
      .input(z.object({
        playlistId: z.number(),
        trackId: z.number(),
        position: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.addTrackToPlaylist(input.playlistId, input.trackId, input.position);
        return { success: true };
      }),
  }),

  // Memorial operations
  memorials: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(20),
      }).optional())
      .query(async ({ input }) => {
        const { limit = 20 } = input || {};
        return await db.getAllMemorials(limit);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getMemorialById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        artistName: z.string().min(1).max(255),
        artistBio: z.string().optional(),
        birthDate: z.date().optional(),
        deathDate: z.date().optional(),
        vinylImageUrl: z.string().url().optional(),
        profileImageUrl: z.string().url().optional(),
        smartContractAddress: z.string().max(128).optional(),
        blockchainNetwork: z.enum(["ethereum", "polygon", "solana"]).optional(),
        metadataIpfsCid: z.string().max(128).optional(),
        beneficiaryAddresses: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createMemorial({
          ...input,
          createdBy: ctx.user.id,
        });
      }),

    donate: protectedProcedure
      .input(z.object({
        memorialId: z.number(),
        amount: z.number().min(1),
        currency: z.string().default("USD"),
        paymentMethod: z.enum(["crypto", "telegram_stars", "card"]),
        walletAddress: z.string().max(128).optional(),
        message: z.string().optional(),
        donorName: z.string().max(255).optional(),
        isAnonymous: z.boolean().default(false),
        transactionHash: z.string().max(128).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const donationId = await db.createDonation({
          ...input,
          donorUserId: ctx.user.id,
          status: "pending",
        });
        return { donationId, success: true };
      }),

    getDonations: publicProcedure
      .input(z.object({ memorialId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMemorialDonations(input.memorialId);
      }),
  }),

  // AI Recommendations
  recommendations: router({
    get: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(10),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { limit = 10 } = input || {};
        return await db.getUserRecommendations(ctx.user.id, limit);
      }),

    create: protectedProcedure
      .input(z.object({
        trackId: z.number(),
        score: z.number().min(0).max(100),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createRecommendation({
          userId: ctx.user.id,
          trackId: input.trackId,
          score: input.score,
          reason: input.reason,
          wasPlayed: false,
          wasLiked: false,
          wasSkipped: false,
        });
        return { success: true };
      }),
  }),

  // User profile with Web3 wallets
  profile: router({
    updateWallet: protectedProcedure
      .input(z.object({
        solanaAddress: z.string().max(64).optional(),
        tonAddress: z.string().max(64).optional(),
        ethereumAddress: z.string().max(64).optional(),
        preferredWallet: z.enum(["solana", "ton", "ethereum"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.upsertUser({
          openId: ctx.user.openId,
          ...input,
        });
        return { success: true };
      }),

    updateTelegram: protectedProcedure
      .input(z.object({
        telegramUserId: z.string().max(64),
        telegramUsername: z.string().max(64).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.upsertUser({
          openId: ctx.user.openId,
          ...input,
        });
        return { success: true };
      }),
  }),

  // Telegram Stars transactions
  telegram: router({
    createTransaction: protectedProcedure
      .input(z.object({
        amount: z.number().min(1),
        purpose: z.string().max(128),
        relatedMemorialId: z.number().optional(),
        relatedTrackId: z.number().optional(),
        telegramUserId: z.string().max(64),
      }))
      .mutation(async ({ input, ctx }) => {
        const transactionId = await db.createTelegramTransaction({
          userId: ctx.user.id,
          telegramUserId: input.telegramUserId,
          amount: input.amount,
          purpose: input.purpose,
          relatedMemorialId: input.relatedMemorialId,
          relatedTrackId: input.relatedTrackId,
          status: "pending",
        });
        return { transactionId, success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
