import { db } from "@/lib/db";
import { logger } from "@/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/tracks/{id}/recommendations
 * Fetches content-based track recommendations for a given track.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Track ID is required" },
      { status: 400 }
    );
  }

  try {
    logger.info(`Fetching recommendations for track: ${id}`);

    // Get the current track
    const track = await db.track.findUnique({
      where: { id },
      include: {
        artist: true,
        genre: true,
      },
    });

    if (!track) {
      return NextResponse.json(
        { error: "Track not found" },
        { status: 404 }
      );
    }

    // Find similar tracks based on genre and artist
    const recommendations = await db.track.findMany({
      where: {
        AND: [
          { id: { not: id } }, // Exclude current track
          {
            OR: [
              { genreId: track.genreId }, // Same genre
              { artistId: track.artistId }, // Same artist
            ],
          },
        ],
      },
      include: {
        artist: true,
        genre: true,
        _count: {
          select: { plays: true, likes: true, comments: true },
        },
      },
      take: 10,
      orderBy: [
        { plays: { _count: "desc" } },
        { likes: { _count: "desc" } },
      ],
    });

    return NextResponse.json({
      trackId: id,
      recommendations: recommendations.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist?.name || "Unknown",
        genre: t.genre?.name || "Unknown",
        duration: t.duration,
        plays: t._count.plays,
        likes: t._count.likes,
        comments: t._count.comments,
      })),
    });
  } catch (error) {
    logger.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
