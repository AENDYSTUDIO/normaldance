
"use client";

import { useEffect, useState } from "react";
import { logger } from "@/lib/utils/logger";

interface ArtistAnalyticsProps {
  artistId: string;
}

interface AnalyticsData {
  totalPlays: number;
  totalLikes: number;
  trackCount: number;
  topTracks: {
    id: string;
    title: string;
    plays: number;
  }[];
}

const StatCard = ({ title, value }: { title: string; value: number | string }) => (
  <div className="bg-gray-800 p-4 rounded-lg text-center">
    <h3 className="text-sm font-medium text-gray-400">{title}</h3>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

export const ArtistAnalytics = ({ artistId }: ArtistAnalyticsProps) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistId) return;

    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/artists/${artistId}/analytics`);
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        logger.error("Error fetching artist analytics", new Error(errorMessage), { artistId });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [artistId]);

  if (isLoading) {
    return <div className="text-center p-4">Loading analytics...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Artist Analytics</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Plays" value={data.totalPlays.toLocaleString()} />
        <StatCard title="Total Likes" value={data.totalLikes.toLocaleString()} />
        <StatCard title="Published Tracks" value={data.trackCount} />
      </div>

      <div>
        <h3 className="text-lg font-bold mb-2">Top 5 Tracks by Plays</h3>
        {data.topTracks.length > 0 ? (
          <ul className="space-y-2">
            {data.topTracks.map((track, index) => (
              <li key={track.id} className="bg-gray-800 p-3 rounded-md flex justify-between items-center">
                <span>{index + 1}. {track.title}</span>
                <span className="font-semibold">{track.plays.toLocaleString()} plays</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No track data available.</p>
        )}
      </div>
    </div>
  );
};
