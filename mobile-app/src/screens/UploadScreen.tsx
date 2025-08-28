import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useMobileApp } from '../hooks/useMobileApp'

interface UploadScreenProps {
  navigation?: any
}

const UploadScreen: React.FC<UploadScreenProps> = ({ navigation }) => {
  const {
    uploadTrack,
    uploadProgress,
    wallet,
    isWalletConnected
  } = useMobileApp()

  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showGenreModal, setShowGenreModal] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState('')
  const [isExplicit, setIsExplicit] = useState(false)

  // Форма
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    description: '',
    genre: '',
    price: '',
    isExplicit: false
  })

  // Жанры
  const genres = [
    'Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 
    'Reggae', 'Country', 'R&B', 'Funk', 'Soul', 'Blues',
    'Techno', 'House', 'Dubstep', 'Trap', 'EDM', 'Ambient'
  ]

  // Выбор файла
  const handleSelectFile = () => {
    // В реальном приложении здесь был бы выбор файла из галереи/файлов
    // Для демо создадим имитацию
    Alert.alert(
      'Select Audio File',
      'Please select an audio file from your device',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose File', onPress: () => {
          setSelectedFile({
            name: 'demo-track.mp3',
            type: 'audio/mpeg',
            size: 3145728 // 3MB
          })
        }}
      ]
    )
  }

  // Обработка изменений формы
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Выбор жанра
  const handleSelectGenre = (genre: string) => {
    setSelectedGenre(genre)
    setFormData(prev => ({
      ...prev,
      genre
    }))
    setShowGenreModal(false)
  }

  // Загрузка трека
  const handleUpload = async () => {
    // Валидация
    if (!selectedFile) {
      Alert.alert('Error', 'Please select an audio file')
      return
    }

    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter track title')
      return
    }

    if (!formData.artist.trim()) {
      Alert.alert('Error', 'Please enter artist name')
      return
    }

    if (!formData.genre) {
      Alert.alert('Error', 'Please select a genre')
      return
    }

    if (!isWalletConnected) {
      Alert.alert('Error', 'Please connect your wallet first')
      return
    }

    setIsUploading(true)

    try {
      const metadata = {
        title: formData.title,
        artist: formData.artist,
        genre: formData.genre,
        description: formData.description,
        isExplicit: formData.isExplicit
      }

      const trackId = await uploadTrack(selectedFile, metadata)
      
      Alert.alert(
        'Success',
        'Track uploaded successfully!',
        [
          { text: 'OK', onPress: () => {
            navigation.goBack()
          }}
        ]
      )
    } catch (error) {
      Alert.alert('Error', 'Failed to upload track')
    } finally {
      setIsUploading(false)
    }
  }

  // Рендер элемента жанра
  const renderGenreItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.genreItem}
      onPress={() => handleSelectGenre(item)}
    >
      <Text style={styles.genreText}>{item}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Upload Track</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Выбор файла */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio File</Text>
          <TouchableOpacity
            style={styles.fileSelector}
            onPress={handleSelectFile}
          >
            {selectedFile ? (
              <View style={styles.fileSelected}>
                <Ionicons name="musical-notes" size={32} color="#4CAF50" />
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{selectedFile.name}</Text>
                  <Text style={styles.fileSize}>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.filePlaceholder}>
                <Ionicons name="cloud-upload-outline" size={48} color="#666" />
                <Text style={styles.filePlaceholderText}>
                  Select audio file
                </Text>
                <Text style={styles.filePlaceholderSubtext}>
                  MP3, WAV, FLAC (Max 50MB)
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Информация о треке */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Track Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Title *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              placeholder="Enter track title"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Artist *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.artist}
              onChangeText={(text) => handleInputChange('artist', text)}
              placeholder="Enter artist name"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Genre *</Text>
            <TouchableOpacity
              style={styles.genreButton}
              onPress={() => setShowGenreModal(true)}
            >
              <Text style={styles.genreButtonText}>
                {formData.genre || 'Select genre'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#888" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder="Describe your track"
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Price (NDT)</Text>
            <TextInput
              style={styles.formInput}
              value={formData.price}
              onChangeText={(text) => handleInputChange('price', text)}
              placeholder="0.00"
              placeholderTextColor="#888"
              keyboardType="numeric"
            />
            <Text style={styles.formHelper}>
              Leave empty for free track
            </Text>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.formLabel}>Explicit Content</Text>
              <TouchableOpacity
                style={styles.switch}
                onPress={() => handleInputChange('isExplicit', (!formData.isExplicit).toString())}
              >
                <View style={[
                  styles.switchTrack,
                  formData.isExplicit && styles.switchTrackActive
                ]}>
                  <View style={[
                    styles.switchThumb,
                    formData.isExplicit && styles.switchThumbActive
                  ]} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Кнопка загрузки */}
        <View style={styles.uploadSection}>
          <TouchableOpacity
            style={[
              styles.uploadButton,
              (!selectedFile || !formData.title || !formData.artist || !formData.genre) && styles.uploadButtonDisabled
            ]}
            onPress={handleUpload}
            disabled={!selectedFile || !formData.title || !formData.artist || !formData.genre || isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={20} color="#ffffff" />
                <Text style={styles.uploadButtonText}>
                  {uploadProgress?.status === 'uploading' ? 'Uploading...' : 'Upload Track'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          {uploadProgress && uploadProgress.status === 'uploading' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${uploadProgress.progress}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {uploadProgress.progress}%
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Модальное окно выбора жанра */}
      <Modal
        visible={showGenreModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGenreModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Genre</Text>
              <TouchableOpacity onPress={() => setShowGenreModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={genres}
              renderItem={renderGenreItem}
              keyExtractor={(item) => item}
              style={styles.genreList}
            />
          </View>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16
  },
  fileSelector: {
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center'
  },
  filePlaceholder: {
    alignItems: 'center'
  },
  filePlaceholderText: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 12
  },
  filePlaceholderSubtext: {
    fontSize: 12,
    color: '#888',
    marginTop: 4
  },
  fileSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%'
  },
  fileInfo: {
    marginLeft: 16,
    flex: 1
  },
  fileName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500'
  },
  fileSize: {
    fontSize: 12,
    color: '#888',
    marginTop: 4
  },
  formGroup: {
    marginBottom: 20
  },
  formLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8
  },
  formInput: {
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 14
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  formHelper: {
    fontSize: 12,
    color: '#888',
    marginTop: 4
  },
  genreButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8
  },
  genreButtonText: {
    fontSize: 14,
    color: '#ffffff'
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  uploadSection: {
    padding: 16,
    paddingBottom: 40
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8
  },
  uploadButtonDisabled: {
    backgroundColor: '#666'
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginLeft: 8
  },
  progressContainer: {
    marginTop: 16
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  genreList: {
    padding: 16
  },
  genreItem: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8
  },
  genreText: {
    fontSize: 14,
    color: '#ffffff'
  },
  switch: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center'
  },
  switchTrack: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center'
  },
  switchTrackActive: {
    backgroundColor: '#4CAF50'
  },
  switchThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff'
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }]
  }
})

export default UploadScreen