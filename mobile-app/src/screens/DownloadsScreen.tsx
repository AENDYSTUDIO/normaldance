
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { downloadManager, DownloadedTrackMetadata } from '../lib/DownloadManager';
import { useMobileApp } from '../hooks/useMobileApp'; // To control the main player

const DownloadsScreen: React.FC = () => {
  const [downloadedTracks, setDownloadedTracks] = useState<DownloadedTrackMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { playTrack } = useMobileApp();

  const loadDownloadedTracks = async () => {
    try {
      const tracks = await downloadManager.getDownloadedTracks();
      setDownloadedTracks(tracks);
    } catch (error) {
      console.error("Failed to load downloaded tracks", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load tracks when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadDownloadedTracks();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDownloadedTracks();
  };

  const handlePlayTrack = (track: DownloadedTrackMetadata) => {
    // We need to adapt the track object to what the player expects
    // Assuming the player can handle a `localUri` property.
    const playerTrack = {
      id: track.id,
      title: track.title,
      artist: track.artistName,
      url: track.localUri, // Key change: use localUri
      duration: track.duration,
      artwork: track.coverImage,
    };
    playTrack(playerTrack);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {downloadedTracks.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>No Downloaded Tracks</Text>
            <Text style={styles.emptySubtext}>Download tracks to listen offline.</Text>
          </View>
        ) : (
          downloadedTracks.map((track) => (
            <TouchableOpacity
              key={track.id}
              style={styles.trackItem}
              onPress={() => handlePlayTrack(track)}
            >
              <View style={styles.trackInfo}>
                <View style={styles.trackCover}>
                  <Ionicons name="musical-notes" size={32} color="#4CAF50" />
                </View>
                <View style={styles.trackDetails}>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  <Text style={styles.trackArtist}>{track.artistName}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={20} color="#4CAF50" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#cccccc',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888888',
    marginTop: 8,
  },
  trackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackCover: {
    width: 48,
    height: 48,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  trackArtist: {
    fontSize: 14,
    color: '#cccccc',
  },
  playButton: {
    width: 32,
    height: 32,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DownloadsScreen;
