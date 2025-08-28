import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  TextInput
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useMobileApp } from '../hooks/useMobileApp'

interface SettingsScreenProps {
  navigation?: any
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const {
    wallet,
    isWalletConnected,
    disconnectWallet,
    clearCache,
    appSettings,
    updateAppSettings
  } = useMobileApp()

  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  const [showCacheModal, setShowCacheModal] = useState(false)
  const [cacheSize, setCacheSize] = useState('0 MB')
  const [settings, setSettings] = useState(appSettings || {
    autoPlay: true,
    downloadOverWiFi: true,
    streamingQuality: 'high',
    darkMode: true,
    notifications: true,
    dataSaver: false
  })

  // Обновление настроек
  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    updateAppSettings(newSettings)
  }

  // Отключение кошелька
  const handleDisconnect = () => {
    disconnectWallet()
    setShowDisconnectModal(false)
    navigation.navigate('Home')
  }

  // Очистка кэша
  const handleClearCache = async () => {
    try {
      await clearCache()
      setCacheSize('0 MB')
      setShowCacheModal(false)
      Alert.alert('Success', 'Cache cleared successfully!')
    } catch (error) {
      Alert.alert('Error', 'Failed to clear cache')
    }
  }

  // Форматирование размера кэша
  const formatCacheSize = (bytes: number) => {
    if (bytes === 0) return '0 MB'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Информация о пользователе */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person-outline" size={32} color="#4CAF50" />
              </View>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {wallet.publicKey?.substring(0, 8)}
              </Text>
              <Text style={styles.userAddress}>
                {wallet.publicKey?.substring(0, 6)}...{wallet.publicKey?.substring(-4)}
              </Text>
            </View>
          </View>
        </View>

        {/* Настройки воспроизведения */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <Ionicons name="play-circle-outline" size={20} color="#ffffff" />
              <Text style={styles.settingItemText}>Auto Play</Text>
            </View>
            <Switch
              value={settings.autoPlay}
              onValueChange={(value) => handleSettingChange('autoPlay', value)}
              trackColor={{ false: '#666', true: '#4CAF50' }}
              thumbColor={settings.autoPlay ? '#ffffff' : '#ffffff'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <Ionicons name="wifi-outline" size={20} color="#ffffff" />
              <Text style={styles.settingItemText}>Download over WiFi only</Text>
            </View>
            <Switch
              value={settings.downloadOverWiFi}
              onValueChange={(value) => handleSettingChange('downloadOverWiFi', value)}
              trackColor={{ false: '#666', true: '#4CAF50' }}
              thumbColor={settings.downloadOverWiFi ? '#ffffff' : '#ffffff'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <Ionicons name="videocam-outline" size={20} color="#ffffff" />
              <Text style={styles.settingItemText}>Streaming Quality</Text>
            </View>
            <TouchableOpacity 
              style={styles.qualitySelector}
              onPress={() => {
                const qualities = ['low', 'medium', 'high']
                const currentIndex = qualities.indexOf(settings.streamingQuality)
                const nextIndex = (currentIndex + 1) % qualities.length
                handleSettingChange('streamingQuality', qualities[nextIndex])
              }}
            >
              <Text style={styles.qualityText}>
                {settings.streamingQuality === 'low' ? 'Low' : 
                 settings.streamingQuality === 'medium' ? 'Medium' : 'High'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#888" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <Ionicons name="moon-outline" size={20} color="#ffffff" />
              <Text style={styles.settingItemText}>Dark Mode</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={(value) => handleSettingChange('darkMode', value)}
              trackColor={{ false: '#666', true: '#4CAF50' }}
              thumbColor={settings.darkMode ? '#ffffff' : '#ffffff'}
            />
          </View>
        </View>

        {/* Уведомления */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <Ionicons name="notifications-outline" size={20} color="#ffffff" />
              <Text style={styles.settingItemText}>Push Notifications</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={(value) => handleSettingChange('notifications', value)}
              trackColor={{ false: '#666', true: '#4CAF50' }}
              thumbColor={settings.notifications ? '#ffffff' : '#ffffff'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <Ionicons name="speedometer-outline" size={20} color="#ffffff" />
              <Text style={styles.settingItemText}>Data Saver</Text>
            </View>
            <Switch
              value={settings.dataSaver}
              onValueChange={(value) => handleSettingChange('dataSaver', value)}
              trackColor={{ false: '#666', true: '#4CAF50' }}
              thumbColor={settings.dataSaver ? '#ffffff' : '#ffffff'}
            />
          </View>
        </View>

        {/* Хранилище */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          
          <View style={styles.storageInfo}>
            <View style={styles.storageItem}>
              <Text style={styles.storageLabel}>Used Space</Text>
              <Text style={styles.storageValue}>{cacheSize}</Text>
            </View>
            <TouchableOpacity 
              style={styles.clearCacheButton}
              onPress={() => setShowCacheModal(true)}
            >
              <Text style={styles.clearCacheButtonText}>Clear Cache</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Безопасность */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#ffffff" />
              <Text style={styles.settingItemText}>Privacy Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <Ionicons name="lock-closed-outline" size={20} color="#ffffff" />
              <Text style={styles.settingItemText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <Ionicons name="finger-print-outline" size={20} color="#ffffff" />
              <Text style={styles.settingItemText}>Biometric Authentication</Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: '#666', true: '#4CAF50' }}
              thumbColor="#ffffff"
            />
          </TouchableOpacity>
        </View>

        {/* Поддержка */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <Ionicons name="help-circle-outline" size={20} color="#ffffff" />
              <Text style={styles.settingItemText}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <Ionicons name="mail-outline" size={20} color="#ffffff" />
              <Text style={styles.settingItemText}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <Ionicons name="document-text-outline" size={20} color="#ffffff" />
              <Text style={styles.settingItemText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <Ionicons name="shield-outline" size={20} color="#ffffff" />
              <Text style={styles.settingItemText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#888" />
          </TouchableOpacity>
        </View>

        {/* О приложении */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutInfo}>
            <Text style={styles.appName}>NormalDance</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Decentralized music streaming platform built on Solana blockchain.
            </Text>
          </View>
        </View>

        {/* Критические действия */}
        <View style={styles.dangerSection}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => setShowDisconnectModal(true)}
          >
            <View style={styles.logoutButtonContent}>
              <Ionicons name="log-out-outline" size={20} color="#f44336" />
              <Text style={styles.logoutButtonText}>Disconnect Wallet</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'Are you sure you want to delete your account? This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => {} }
                ]
              )
            }}
          >
            <View style={styles.deleteButtonContent}>
              <Ionicons name="trash-outline" size={20} color="#f44336" />
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Модальное окно отключения */}
      <Modal
        visible={showDisconnectModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDisconnectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Disconnect Wallet</Text>
              <TouchableOpacity onPress={() => setShowDisconnectModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                Are you sure you want to disconnect your wallet? You will need to reconnect to access your account.
              </Text>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowDisconnectModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleDisconnect}
              >
                <Text style={styles.confirmButtonText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно очистки кэша */}
      <Modal
        visible={showCacheModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCacheModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Clear Cache</Text>
              <TouchableOpacity onPress={() => setShowCacheModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                This will clear all cached audio files and downloaded content. This action cannot be undone.
              </Text>
              <Text style={styles.cacheSizeText}>
                Current cache size: {cacheSize}
              </Text>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCacheModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleClearCache}
              >
                <Text style={styles.confirmButtonText}>Clear Cache</Text>
              </TouchableOpacity>
            </View>
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
  userSection: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarContainer: {
    marginRight: 16
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userDetails: {
    flex: 1
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4
  },
  userAddress: {
    fontSize: 12,
    color: '#888'
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  settingItemText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 12
  },
  qualitySelector: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  qualityText: {
    fontSize: 14,
    color: '#ffffff',
    marginRight: 8
  },
  storageInfo: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16
  },
  storageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  storageLabel: {
    fontSize: 14,
    color: '#ffffff'
  },
  storageValue: {
    fontSize: 14,
    color: '#888'
  },
  clearCacheButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  clearCacheButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500'
  },
  aboutInfo: {
    alignItems: 'center'
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8
  },
  appVersion: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12
  },
  appDescription: {
    fontSize: 12,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 16
  },
  dangerSection: {
    padding: 16,
    paddingBottom: 40
  },
  logoutButton: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoutButtonText: {
    fontSize: 14,
    color: '#f44336',
    marginLeft: 12
  },
  deleteButton: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#f44336',
    marginLeft: 12
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
  modalBody: {
    padding: 20
  },
  modalText: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
    marginBottom: 12
  },
  cacheSizeText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333'
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2a2a2a'
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#ffffff'
  },
  confirmButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f44336'
  },
  confirmButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500'
  }
})

export default SettingsScreen