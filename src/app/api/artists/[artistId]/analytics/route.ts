
import { db } from "@/lib/db";
import { logger } from "@/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/artists/{artistId}/analytics
 * Fetches analytics data for a specific artist.
 *
 * @param {NextRequest} req - The incoming request.
 * @param {{ params: { artistId: string } }} context - The route context containing the artistId.
 * @returns {NextResponse} A response with the artist's analytics data or an error.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { artistId: string } }
) {
  const { artistId } = params;

  if (!artistId) {
    return NextResponse.json(
      { error: "Artist ID is required" },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch all tracks for the artist
    const tracks = await db.track.findMany({
      where: { artistId: artistId, isPublished: true },
      select: {
        id: true,
        title: true,
        playCount: true,
        likeCount: true,
      },
    });

    if (tracks.length === 0) {
      return NextResponse.json({
        totalPlays: 0,
        totalLikes: 0,
        topTracks: [],
        trackCount: 0,
      });
    }

    // 2. Calculate total plays and likes
    const totalPlays = tracks.reduce((sum, track) => sum + track.playCount, 0);
    const totalLikes = tracks.reduce((sum, track) => sum + track.likeCount, 0);

    // 3. Determine top tracks by playCount
    const topTracks = tracks
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 5) // Get top 5 tracks
      .map((track) => ({
        id: track.id,
        title: track.title,
        plays: track.playCount,
      }));

    const analyticsData = {
      totalPlays,
      totalLikes,
      topTracks,
      trackCount: tracks.length,
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    logger.error("Failed to fetch artist analytics", error as Error, {
      artistId,
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
