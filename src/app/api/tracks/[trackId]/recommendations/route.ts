
import { db } from "@/lib/db";
import { logger } from "@/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/tracks/{trackId}/recommendations
 * Fetches content-based track recommendations for a given track.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { trackId: string } }
) {
  const { trackId } = params;

  if (!trackId) {
    return NextResponse.json(
      { error: "Track ID is required" },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch the target track
    const targetTrack = await db.track.findUnique({
      where: { id: trackId },
      select: { id: true, genre: true, artistName: true },
    });

    if (!targetTrack) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // 2. Fetch tracks with the same genre and by the same artist
    const [genreTracks, artistTracks] = await Promise.all([
      db.track.findMany({
        where: {
          genre: targetTrack.genre,
          id: { not: trackId }, // Exclude the original track
          isPublished: true,
        },
        take: 10, // Limit to 10
        select: { id: true, title: true, artistName: true, ipfsHash: true },
      }),
      db.track.findMany({
        where: {
          artistName: targetTrack.artistName,
          id: { not: trackId }, // Exclude the original track
          isPublished: true,
        },
        take: 10, // Limit to 10
        select: { id: true, title: true, artistName: true, ipfsHash: true },
      }),
    ]);

    // 3. Combine, deduplicate, and limit the results
    const combinedTracks = [...artistTracks, ...genreTracks];
    const uniqueTracks = Array.from(new Map(combinedTracks.map(track => [track.id, track])).values());
    
    const recommendations = uniqueTracks.slice(0, 10); // Final limit

    return NextResponse.json(recommendations);

  } catch (error) {
    logger.error("Failed to fetch track recommendations", error as Error, {
      trackId,
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
