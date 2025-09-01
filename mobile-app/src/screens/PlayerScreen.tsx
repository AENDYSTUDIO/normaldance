import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useMobileApp } from '../hooks/useMobileApp'

interface PlayerScreenProps {
  route: {
    params: {
      track: {
        id: string
        title: string
        artist: string
        genre: string
        duration: number
        ipfsHash: string
        metadata: any
        price?: number
        isExplicit: boolean
        playCount: number
        likeCount: number
      }
    }
  }
  navigation: any
}

const PlayerScreen: React.FC<PlayerScreenProps> = ({ route, navigation }) => {
  const { track } = route.params
  const {
    isPlaying,
    playTrack,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    likeTrack,
    unlikeTrack,
    formatTime
  } = useMobileApp()

  const [isLiked, setIsLiked] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(track.duration)

  // Форматирование времени
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Обработка лайка
  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikeTrack(track.id, 'mock_wallet_address')
      } else {
        await likeTrack(track.id, 'mock_wallet_address')
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error('Failed to like/unlike track:', error)
    }
  }

  // Обработка воспроизведения/паузы
  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await pausePlayback()
      } else {
        await resumePlayback()
      }
    } catch (error) {
      console.error('Failed to toggle playback:', error)
    }
  }

  // Обработка остановки
  const handleStop = async () => {
    try {
      await stopPlayback()
      navigation.goBack()
    } catch (error) {
      console.error('Failed to stop playback:', error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Заголовок */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Now Playing</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Обложка альбома */}
        <View style={styles.albumArtContainer}>
          <View style={styles.albumArt}>
            <Ionicons name="disc-outline" size={120} color="#4CAF50" />
          </View>
        </View>

        {/* Информация о треке */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{track.title}</Text>
          <Text style={styles.trackArtist}>{track.artist}</Text>
          <View style={styles.trackMeta}>
            <Text style={styles.trackGenre}>{track.genre}</Text>
            <Text style={styles.trackDuration}>
              {formatDuration(duration)}
            </Text>
          </View>
        </View>

        {/* Прогресс бар */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${(currentTime / duration) * 100}%` }
              ]}
            />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.currentTime}>{formatDuration(currentTime)}</Text>
            <Text style={styles.totalTime}>{formatDuration(duration)}</Text>
          </View>
        </View>

        {/* Управление воспроизведением */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="play-skip-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.playPauseButton, styles.largeButton]}
            onPress={handlePlayPause}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={32} 
              color="#ffffff" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="play-skip-forward" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Дополнительные действия */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? "#f44336" : "#ffffff"} 
            />
            <Text style={styles.actionText}>{track.likeCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color="#ffffff" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download-outline" size={24} color="#ffffff" />
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
        </View>

        {/* Информация о треке */}
        <View style={styles.trackDetails}>
          <Text style={styles.detailsTitle}>Track Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>
              {track.price ? `${track.price} NDT` : 'Free'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Explicit:</Text>
            <Text style={styles.detailValue}>
              {track.isExplicit ? 'Yes' : 'No'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plays:</Text>
            <Text style={styles.detailValue}>{track.playCount}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Release Date:</Text>
            <Text style={styles.detailValue}>
              {track.metadata?.releaseDate || 'Unknown'}
            </Text>
          </View>
        </View>

        {/* Описание */}
        {track.metadata?.description && (
          <View style={styles.description}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {track.metadata.description}
            </Text>
          </View>
        )}

        {/* Кнопка остановки */}
        <TouchableOpacity 
          style={styles.stopButton}
          onPress={handleStop}
        >
          <Text style={styles.stopButtonText}>Stop Playback</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212'
  },
  scrollView: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 16
  },
  headerSpacer: {
    width: 24
  },
  albumArtContainer: {
    padding: 20,
    alignItems: 'center'
  },
  albumArt: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50'
  },
  trackInfo: {
    alignItems: 'center',
    padding: 20
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center'
  },
  trackArtist: {
    fontSize: 18,
    color: '#cccccc',
    marginBottom: 12,
    textAlign: 'center'
  },
  trackMeta: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center'
  },
  trackGenre: {
    fontSize: 14,
    color: '#888888'
  },
  trackDuration: {
    fontSize: 14,
    color: '#888888'
  },
  progressContainer: {
    padding: 20
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 8
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  currentTime: {
    fontSize: 12,
    color: '#888888'
  },
  totalTime: {
    fontSize: 12,
    color: '#888888'
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 40
  },
  controlButton: {
    padding: 12
  },
  playPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center'
  },
  largeButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20
  },
  actionButton: {
    alignItems: 'center'
  },
  actionText: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 4
  },
  trackDetails: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    margin: 16,
    borderRadius: 12
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  detailLabel: {
    fontSize: 14,
    color: '#cccccc'
  },
  detailValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500'
  },
  description: {
    padding: 20,
    margin: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12
  },
  descriptionText: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20
  },
  stopButton: {
    margin: 20,
    padding: 16,
    backgroundColor: '#f44336',
    borderRadius: 8,
    alignItems: 'center'
  },
  stopButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500'
  }
})

export default PlayerScreen