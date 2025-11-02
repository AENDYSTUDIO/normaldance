
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { downloadManager, DownloadedTrackMetadata } from '../lib/DownloadManager';

interface DownloadButtonProps {
  track: {
    id: string;
    title: string;
    artistName: string;
    ipfsHash: string;
    coverImage?: string;
    duration: number;
  };
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ track }) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const checkIfDownloaded = async () => {
      const downloaded = await downloadManager.isTrackDownloaded(track.id);
      setIsDownloaded(downloaded);
    };
    checkIfDownloaded();
  }, [track.id]);

  const handleDownload = async () => {
    if (isDownloaded) return;

    setIsDownloading(true);
    setProgress(0);
    try {
      await downloadManager.downloadTrack(track, (p) => {
        setProgress(p);
      });
      setIsDownloaded(true);
    } catch (error) {
      console.error("Failed to download track", error);
      // Optionally show an error message to the user
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await downloadManager.deleteTrack(track.id);
      setIsDownloaded(false);
    } catch (error) {
      console.error("Failed to delete track", error);
    }
  };

  if (isDownloaded) {
    return (
      <TouchableOpacity onPress={handleDelete} style={styles.button}>
        <Ionicons name="trash-outline" size={24} color="#f44336" />
      </TouchableOpacity>
    );
  }

  if (isDownloading) {
    return (
      <View style={styles.progressContainer}>
        <ActivityIndicator size="small" color="#4CAF50" />
        {/* Optionally show a progress circle */}
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={handleDownload} style={styles.button}>
      <Ionicons name="download-outline" size={24} color="#4CAF50" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  progressContainer: {
    padding: 8,
    width: 40, // to match button size
    alignItems: 'center',
  },
});
