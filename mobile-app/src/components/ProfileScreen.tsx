import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Switch,
  ActivityIndicator
} from 'react-native'
import { useMobileApp } from '../hooks/useMobileApp'
import { Ionicons } from '@expo/vector-icons'

interface ProfileScreenProps {
  navigation: any
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const {
    wallet,
    stakingInfo,
    getUserProfile,
    updateUserProfile,
    connectWallet,
    disconnectWallet,
    formatTime,
    loading,
    error
  } = useMobileApp()

  const [profile, setProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editProfile, setEditProfile] = useState({
    displayName: '',
    bio: '',
    genre: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      soundcloud: ''
    }
  })

  // Загрузка профиля
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      loadProfile()
    }
  }, [wallet.connected, wallet.publicKey])

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile()
      if (userProfile) {
        setProfile(userProfile)
        setEditProfile({
          displayName: userProfile.displayName || '',
          bio: userProfile.bio || '',
          genre: userProfile.genre || '',
          socialLinks: userProfile.socialLinks || {}
        })
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const success = await updateUserProfile(editProfile)
      if (success) {
        setProfile({ ...profile, ...editProfile })
        setIsEditing(false)
        Alert.alert('Success', 'Profile updated successfully')
      } else {
        Alert.alert('Error', 'Failed to update profile')
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile')
    }
  }

  const handleConnectWallet = async () => {
    try {
      await connectWallet()
    } catch (err) {
      Alert.alert('Error', 'Failed to connect wallet')
    }
  }

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet()
      setProfile(null)
      setIsEditing(false)
    } catch (err) {
      Alert.alert('Error', 'Failed to disconnect wallet')
    }
  }

  const formatStakingTime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600))
    const hours = Math.floor((seconds % (24 * 3600)) / 3600)
    return `${days}d ${hours}h`
  }

  if (!wallet.connected) {
    return (
      <View style={styles.container}>
        <View style={styles.walletSection}>
          <Ionicons name="wallet-outline" size={64} color="#4CAF50" />
          <Text style={styles.walletTitle}>Connect Your Wallet</Text>
          <Text style={styles.walletSubtitle}>
            Connect your Solana wallet to access NormalDance Mobile
          </Text>
          <TouchableOpacity 
            style={styles.connectButton}
            onPress={handleConnectWallet}
          >
            <Text style={styles.connectButtonText}>Connect Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Информация о кошельке */}
        <View style={styles.walletInfo}>
          <View style={styles.walletAddress}>
            <Text style={styles.addressLabel}>Wallet Address</Text>
            <Text style={styles.addressText}>
              {wallet.publicKey?.slice(0, 8)}...{wallet.publicKey?.slice(-8)}
            </Text>
          </View>
          <View style={styles.walletBalance}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceText}>
              {wallet.balance?.toFixed(4)} SOL
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.disconnectButton}
            onPress={handleDisconnectWallet}
          >
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>

        {/* Профиль пользователя */}
        {profile && (
          <>
            <View style={styles.profileHeader}>
              {profile.avatar ? (
                <Image 
                  source={{ uri: profile.avatar }} 
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person-outline" size={48} color="#666" />
                </View>
              )}
              <Text style={styles.displayName}>
                {profile.displayName || 'Anonymous Artist'}
              </Text>
              <Text style={styles.username}>
                @{profile.username || wallet.publicKey?.slice(0, 8)}
              </Text>
            </View>

            {/* Статистика */}
            <View style={styles.statsSection}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.tracksCount || 0}</Text>
                <Text style={styles.statLabel}>Tracks</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.followersCount || 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.playsCount || 0}</Text>
                <Text style={styles.statLabel}>Plays</Text>
              </View>
            </View>

            {/* Информация о стейкинге */}
            {stakingInfo && (
              <View style={styles.stakingSection}>
                <Text style={styles.sectionTitle}>Staking</Text>
                <View style={styles.stakingInfo}>
                  <View style={styles.stakingRow}>
                    <Text style={styles.stakingLabel}>Level</Text>
                    <Text style={styles.stakingValue}>{stakingInfo.level}</Text>
                  </View>
                  <View style={styles.stakingRow}>
                    <Text style={styles.stakingLabel}>Amount Staked</Text>
                    <Text style={styles.stakingValue}>{stakingInfo.amountStaked} NDT</Text>
                  </View>
                  <View style={styles.stakingRow}>
                    <Text style={styles.stakingLabel}>APY</Text>
                    <Text style={styles.stakingValue}>{stakingInfo.apy}%</Text>
                  </View>
                  <View style={styles.stakingRow}>
                    <Text style={styles.stakingLabel}>Lock Period</Text>
                    <Text style={styles.stakingValue}>
                      {formatStakingTime(stakingInfo.lockPeriod)}
                    </Text>
                  </View>
                  <View style={styles.stakingRow}>
                    <Text style={styles.stakingLabel}>Rewards</Text>
                    <Text style={styles.stakingValue}>{stakingInfo.rewards} NDT</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Редактирование профиля */}
            <View style={styles.editSection}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setIsEditing(!isEditing)}
              >
                <Text style={styles.editButtonText}>
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Text>
              </TouchableOpacity>

              {isEditing && (
                <View style={styles.editForm}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Display Name</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editProfile.displayName}
                      onChangeText={(text) => setEditProfile({...editProfile, displayName: text})}
                      placeholder="Enter display name"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Bio</Text>
                    <TextInput
                      style={[styles.formInput, styles.textArea]}
                      value={editProfile.bio}
                      onChangeText={(text) => setEditProfile({...editProfile, bio: text})}
                      placeholder="Tell us about yourself"
                      multiline
                      numberOfLines={4}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Genre</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editProfile.genre}
                      onChangeText={(text) => setEditProfile({...editProfile, genre: text})}
                      placeholder="Enter your genre"
                    />
                  </View>

                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSaveProfile}
                  >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Социальные ссылки */}
            <View style={styles.socialSection}>
              <Text style={styles.sectionTitle}>Social Links</Text>
              <View style={styles.socialLinks}>
                <View style={styles.socialLink}>
                  <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
                  <TextInput
                    style={styles.socialInput}
                    value={editProfile.socialLinks.twitter}
                    onChangeText={(text) => setEditProfile({
                      ...editProfile,
                      socialLinks: {...editProfile.socialLinks, twitter: text}
                    })}
                    placeholder="Twitter username"
                  />
                </View>
                <View style={styles.socialLink}>
                  <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                  <TextInput
                    style={styles.socialInput}
                    value={editProfile.socialLinks.instagram}
                    onChangeText={(text) => setEditProfile({
                      ...editProfile,
                      socialLinks: {...editProfile.socialLinks, instagram: text}
                    })}
                    placeholder="Instagram username"
                  />
                </View>
                <View style={styles.socialLink}>
                  <Ionicons name="musical-notes" size={20} color="#FF6600" />
                  <TextInput
                    style={styles.socialInput}
                    value={editProfile.socialLinks.soundcloud}
                    onChangeText={(text) => setEditProfile({
                      ...editProfile,
                      socialLinks: {...editProfile.socialLinks, soundcloud: text}
                    })}
                    placeholder="SoundCloud username"
                  />
                </View>
              </View>
            </View>
          </>
        )}

        {error && (
          <View style={styles.errorSection}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </View>
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
  walletSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  walletTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10
  },
  walletSubtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 30
  },
  connectButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500'
  },
  walletInfo: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333'
  },
  walletAddress: {
    marginBottom: 15
  },
  addressLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4
  },
  addressText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'monospace'
  },
  walletBalance: {
    marginBottom: 15
  },
  balanceLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4
  },
  balanceText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold'
  },
  disconnectButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-end'
  },
  disconnectButtonText: {
    color: '#ffffff',
    fontSize: 12
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5
  },
  username: {
    fontSize: 14,
    color: '#888888'
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#1a1a1a',
    margin: 16,
    borderRadius: 12
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  statLabel: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 4
  },
  stakingSection: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15
  },
  stakingInfo: {
    gap: 10
  },
  stakingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  stakingLabel: {
    fontSize: 14,
    color: '#cccccc'
  },
  stakingValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500'
  },
  editSection: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500'
  },
  editForm: {
    marginTop: 20
  },
  formGroup: {
    marginBottom: 15
  },
  formLabel: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 5
  },
  formInput: {
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    fontSize: 14
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500'
  },
  socialSection: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12
  },
  socialLinks: {
    gap: 15
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  socialInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    fontSize: 14
  },
  errorSection: {
    margin: 16,
    padding: 15,
    backgroundColor: '#f44336',
    borderRadius: 8
  },
  errorText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center'
  }
})

export default ProfileScreen