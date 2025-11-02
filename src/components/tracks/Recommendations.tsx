
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logger } from "@/lib/utils/logger";

interface Recommendation {
  id: string;
  title: string;
  artistName: string;
}

interface RecommendationsProps {
  trackId: string;
}

export const Recommendations = ({ trackId }: RecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!trackId) return;

    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/tracks/${trackId}/recommendations`);
        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }
        const data = await response.json();
        setRecommendations(data);
      } catch (error) {
        logger.error("Error fetching recommendations", error as Error, { trackId });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [trackId]);

  if (isLoading) {
    return <div className="text-center p-4">Loading recommendations...</div>;
  }

  if (recommendations.length === 0) {
    return null; // Don't render anything if there are no recommendations
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Similar Tracks</h3>
      <div className="space-y-3">
        {recommendations.map((track) => (
          <Link href={`/tracks/${track.id}`} key={track.id}>
            <div className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
              <p className="font-semibold text-white">{track.title}</p>
              <p className="text-sm text-gray-400">{track.artistName}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
