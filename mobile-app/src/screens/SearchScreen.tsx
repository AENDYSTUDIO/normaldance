import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useMobileApp } from '../hooks/useMobileApp'

interface SearchScreenProps {
  navigation?: any
}

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const {
    searchTracks,
    filteredTracks,
    formatTime,
    loading,
    error
  } = useMobileApp()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Поиск треков
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    
    if (query.trim() === '') {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const results = await searchTracks(query)
      setSearchResults(results)
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setIsSearching(false)
    }
  }

  // Добавление в недавние поиск
  const addToRecentSearches = (query: string) => {
    if (query.trim() === '') return
    
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q !== query)
      return [query, ...filtered].slice(0, 5) // Храним только 5 последних запросов
    })
  }

  // Выбор из недавних поиск
  const handleRecentSearch = (query: string) => {
    setSearchQuery(query)
    handleSearch(query)
  }

  // Очистка поиска
  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
  }

  // Форматирование времени
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Рендер элемента трека
  const renderTrackItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.trackItem}>
      <View style={styles.trackInfo}>
        <View style={styles.trackCover}>
          <Ionicons name="musical-notes" size={24} color="#4CAF50" />
        </View>
        <View style={styles.trackDetails}>
          <Text style={styles.trackTitle}>{item.title}</Text>
          <Text style={styles.trackArtist}>{item.artist}</Text>
          <View style={styles.trackMeta}>
            <Text style={styles.trackGenre}>{item.genre}</Text>
            <Text style={styles.trackDuration}>
              {formatDuration(item.duration)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.trackActions}>
        <View style={styles.trackStats}>
          <Text style={styles.statText}>
            <Ionicons name="play-circle-outline" size={14} color="#888" />
            {item.playCount}
          </Text>
          <Text style={styles.statText}>
            <Ionicons name="heart-outline" size={14} color="#888" />
            {item.likeCount}
          </Text>
        </View>
        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="play" size={16} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Поисковая строка */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={(text) => handleSearch(text)}
            placeholder="Search tracks, artists, genres..."
            placeholderTextColor="#888"
            autoFocus
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle-outline" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Результаты поиска */}
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searchQuery !== '' ? (
        <FlatList
          data={searchResults}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>
                Try different keywords or check your spelling
              </Text>
            </View>
          }
        />
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Недавние поиск */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={() => setRecentSearches([])}>
                <Text style={styles.clearButton}>Clear All</Text>
              </TouchableOpacity>
            </View>
            
            {recentSearches.length > 0 ? (
              <View style={styles.recentSearches}>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentSearchItem}
                    onPress={() => handleRecentSearch(search)}
                  >
                    <Ionicons name="time-outline" size={16} color="#888" />
                    <Text style={styles.recentSearchText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={48} color="#666" />
                <Text style={styles.emptyText}>No recent searches</Text>
                <Text style={styles.emptySubtext}>
                  Your search history will appear here
                </Text>
              </View>
            )}
          </View>

          {/* Популярные жанры */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Genres</Text>
            <View style={styles.genresList}>
              {['Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'Reggae', 'Country'].map((genre) => (
                <TouchableOpacity
                  key={genre}
                  style={styles.genreItem}
                  onPress={() => handleSearch(genre)}
                >
                  <Text style={styles.genreText}>{genre}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Популярные артисты */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Artists</Text>
            <View style={styles.artistsList}>
              {['Daft Punk', 'The Weeknd', 'Billie Eilish', 'Travis Scott', 'Ariana Grande', 'Drake', 'Taylor Swift', 'Ed Sheeran'].map((artist) => (
                <TouchableOpacity
                  key={artist}
                  style={styles.artistItem}
                  onPress={() => handleSearch(artist)}
                >
                  <View style={styles.artistAvatar}>
                    <Ionicons name="person-outline" size={24} color="#4CAF50" />
                  </View>
                  <Text style={styles.artistName}>{artist}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Тренды */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <View style={styles.trendingList}>
              {['Summer Hits 2024', 'Workout Mix', 'Chill Vibes', 'Party Anthems', 'Study Focus'].map((trend, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.trendingItem}
                  onPress={() => handleSearch(trend)}
                >
                  <View style={styles.trendingRank}>
                    <Text style={styles.trendingRankText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.trendingText}>{trend}</Text>
                  <Ionicons name="trending-up" size={16} color="#4CAF50" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#ffffff'
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 20
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
  scrollView: {
    flex: 1
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  clearButton: {
    fontSize: 14,
    color: '#4CAF50'
  },
  recentSearches: {
    gap: 12
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8
  },
  recentSearchText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#ffffff'
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#cccccc',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888888',
    marginTop: 8,
    textAlign: 'center'
  },
  genresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  genreItem: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  genreText: {
    fontSize: 14,
    color: '#ffffff'
  },
  artistsList: {
    gap: 12
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8
  },
  artistAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  artistName: {
    fontSize: 14,
    color: '#ffffff'
  },
  trendingList: {
    gap: 8
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8
  },
  trendingRank: {
    width: 24,
    height: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  trendingRankText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold'
  },
  trendingText: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff'
  },
  resultsList: {
    padding: 16
  },
  trackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 8
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  trackCover: {
    width: 40,
    height: 40,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  trackDetails: {
    flex: 1
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2
  },
  trackArtist: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 4
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  trackGenre: {
    fontSize: 11,
    color: '#888888'
  },
  trackDuration: {
    fontSize: 11,
    color: '#888888'
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  trackStats: {
    flexDirection: 'row',
    gap: 12
  },
  statText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    color: '#888888'
  },
  playButton: {
    width: 28,
    height: 28,
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default SearchScreen