import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useMobileApp } from '../hooks/useMobileApp'

const HomeScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const {
    tracks,
    filteredTracks,
    currentTrack,
    isPlaying,
    loadTracks,
    playTrack,
    stopPlayback,
    formatTime,
    loading,
    error,
    isEmpty
  } = useMobileApp()

  const [refreshing, setRefreshing] = useState(false)

  // Загрузка треков при монтировании
  useEffect(() => {
    loadTracks()
  }, [loadTracks])

  // Обновление списка
  const onRefresh = async () => {
    setRefreshing(true)
    await loadTracks()
    setRefreshing(false)
  }

  // Форматирование времени
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Категории треков
  const categories = [
    { id: 'all', name: 'All Tracks', icon: 'musical-notes' },
    { id: 'trending', name: 'Trending', icon: 'trending-up' },
    { id: 'new', name: 'New Releases', icon: 'new' },
    { id: 'popular', name: 'Popular', icon: 'star' }
  ]

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>NormalDance</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Категории */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
      >
        {categories.map((category) => (
          <TouchableOpacity 
            key={category.id}
            style={styles.categoryItem}
          >
            <Ionicons name={category.icon as any} size={20} color="#4CAF50" />
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Текущий трек */}
      {currentTrack && (
        <View style={styles.nowPlaying}>
          <View style={styles.nowPlayingContent}>
            <View style={styles.nowPlayingInfo}>
              <Text style={styles.nowPlayingTitle}>{currentTrack.title}</Text>
              <Text style={styles.nowPlayingArtist}>{currentTrack.artist}</Text>
            </View>
            <View style={styles.nowPlayingControls}>
              <TouchableOpacity onPress={stopPlayback}>
                <Ionicons name="stop-circle-outline" size={32} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Список треков */}
      <ScrollView 
        style={styles.tracksList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading tracks...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={32} color="#f44336" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : isEmpty ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>No tracks available</Text>
            <Text style={styles.emptySubtext}>Check back later for new music</Text>
          </View>
        ) : (
          filteredTracks.map((track) => (
            <TouchableOpacity 
              key={track.id}
              style={styles.trackItem}
              onPress={() => playTrack(track)}
            >
              <View style={styles.trackInfo}>
                <View style={styles.trackCover}>
                  <Ionicons name="musical-notes" size={32} color="#4CAF50" />
                </View>
                <View style={styles.trackDetails}>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  <Text style={styles.trackArtist}>{track.artist}</Text>
                  <View style={styles.trackMeta}>
                    <Text style={styles.trackGenre}>{track.genre}</Text>
                    <Text style={styles.trackDuration}>
                      {formatDuration(track.duration)}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.trackActions}>
                <View style={styles.trackStats}>
                  <Text style={styles.statText}>
                    <Ionicons name="play-circle-outline" size={16} color="#888" />
                    {track.playCount}
                  </Text>
                  <Text style={styles.statText}>
                    <Ionicons name="heart-outline" size={16} color="#888" />
                    {track.likeCount}
                  </Text>
                </View>
                <TouchableOpacity style={styles.playButton}>
                  <Ionicons name="play" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Плавающая кнопка загрузки */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('Upload')}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16
  },
  searchButton: {
    padding: 8
  },
  filterButton: {
    padding: 8
  },
  categories: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a'
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 20
  },
  categoryName: {
    marginLeft: 8,
    fontSize: 12,
    color: '#ffffff'
  },
  nowPlaying: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  nowPlayingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nowPlayingInfo: {
    flex: 1
  },
  nowPlayingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4
  },
  nowPlayingArtist: {
    fontSize: 14,
    color: '#cccccc'
  },
  nowPlayingControls: {
    padding: 8
  },
  tracksList: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#cccccc'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 18,
    color: '#cccccc',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888888',
    marginTop: 8,
    textAlign: 'center'
  },
  trackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  trackCover: {
    width: 48,
    height: 48,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  trackDetails: {
    flex: 1
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4
  },
  trackArtist: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 4
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  trackGenre: {
    fontSize: 12,
    color: '#888888'
  },
  trackDuration: {
    fontSize: 12,
    color: '#888888'
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  trackStats: {
    flexDirection: 'row',
    gap: 16
  },
  statText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: '#888888'
  },
  playButton: {
    width: 32,
    height: 32,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 56,
    height: 56,
    backgroundColor: '#4CAF50',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  }
})

export default HomeScreen