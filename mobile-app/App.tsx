import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'

// Импорт экранов
import HomeScreen from './src/screens/HomeScreen'
import SearchScreen from './src/screens/SearchScreen'
import UploadScreen from './src/screens/UploadScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import SettingsScreen from './src/screens/SettingsScreen'

// Импорт хука
import { useMobileApp } from './src/hooks/useMobileApp'

const Tab = createBottomTabNavigator()

const App: React.FC = () => {
  const { isWalletConnected } = useMobileApp()

  // Если кошелек не подключен, показываем экран подключения
  if (!isWalletConnected) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.content}>
          <Ionicons name="musical-notes-outline" size={80} color="#4CAF50" />
          <Text style={styles.title}>NormalDance</Text>
          <Text style={styles.subtitle}>Decentralized Music Platform</Text>
          <TouchableOpacity 
            style={styles.connectButton}
            onPress={() => {
              // В реальном приложении здесь была бы логика подключения кошелька
              // Для демо просто симулируем подключение
              setTimeout(() => {
                // Здесь должен быть вызов функции подключения
              }, 1000)
            }}
          >
            <Text style={styles.connectButtonText}>Connect Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home'
            
            if (route.name === 'Home') {
              iconName = 'home'
            } else if (route.name === 'Search') {
              iconName = 'search'
            } else if (route.name === 'Upload') {
              iconName = 'add-circle'
            } else if (route.name === 'Profile') {
              iconName = 'person'
            } else if (route.name === 'Settings') {
              iconName = 'settings'
            }

            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#888',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          headerStyle: styles.header,
          headerTintColor: '#ffffff',
          headerShown: true
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'Home',
            headerShown: false
          }}
        />
        <Tab.Screen 
          name="Search" 
          component={SearchScreen}
          options={{
            title: 'Search'
          }}
        />
        <Tab.Screen 
          name="Upload" 
          component={UploadScreen}
          options={{
            title: 'Upload'
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            title: 'Profile'
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            title: 'Settings'
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    alignItems: 'center',
    padding: 40
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 40,
    textAlign: 'center'
  },
  connectButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20
  },
  connectButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500'
  },
  tabBar: {
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    height: 60,
    paddingBottom: 4,
    paddingTop: 4
  },
  tabBarLabel: {
    fontSize: 12,
    marginBottom: 4
  },
  header: {
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  }
})

export default App
