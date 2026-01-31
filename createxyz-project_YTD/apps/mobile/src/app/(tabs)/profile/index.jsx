import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { 
  User,
  Settings,
  Bell,
  Phone,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit,
  Trophy,
  Clock,
  Moon,
  Volume2
} from 'lucide-react-native';
import { useThemeColors } from '../../../utils/useThemeColors';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../utils/auth/useAuth';
import { firebaseAuth } from '../../../utils/auth/firebaseAuth';
import { useAuthStore } from '../../../utils/auth/store';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  
  // User settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(colors.isDark);
  
  // Get user profile from Firebase Auth
  const { auth } = useAuth();
  const { setAuth } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch user profile when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const currentUser = firebaseAuth.getCurrentUser();
        if (currentUser) {
          setProfile({
            name: currentUser.displayName || 'User',
            email: currentUser.email,
            emailVerified: currentUser.emailVerified,
            uid: currentUser.uid
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (auth?.user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [auth]);
  
  // User profile data from Firebase Auth
  const userProfile = {
    name: profile?.name || auth?.user?.name || 'User',
    username: `@${(profile?.name || auth?.user?.name || 'user')?.toLowerCase().replace(/\s/g, '_')}`,
    email: profile?.email || auth?.user?.email || 'user@example.com',
    phone: '+1 (555) 123-4467',
    truckNumber: 'TRK-001',
    fleetCompany: 'Highway Express LLC',
    joinDate: 'March 2023',
    totalPoints: 1250,
    currentStreak: 7,
    badges: 3,
    quickDialNumber: '+1-555-0123',
  };

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleQuickDialSetup = () => {
    Alert.alert(
      'Quick Dial Setup',
      'Set up your emergency contact or dispatch number for one-touch calling.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Set Number', onPress: () => console.log('Setting quick dial number') },
      ]
    );
  };

  const handleNotificationSettings = () => {
    router.push('/notification-settings');
  };

  const handlePrivacySettings = () => {
    router.push('/privacy-settings');
  };

  const handleHelp = () => {
    router.push('/help');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const result = await firebaseAuth.signOut();
              if (result.success) {
                // Clear local auth state
                setAuth(null);
                // Navigate to login screen
                router.replace('/login');
              } else {
                Alert.alert('Error', 'Failed to log out. Please try again.');
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          }
        },
      ]
    );
  };

  const SettingRow = ({ icon: Icon, title, subtitle, onPress, showChevron = true, rightElement }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.isDark ? '#2C2C2C' : '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          backgroundColor: colors.iconBackground,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 16,
        }}
      >
        <Icon color={colors.text} size={20} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 16,
            color: colors.text,
            marginBottom: subtitle ? 4 : 0,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: colors.textSecondary,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {rightElement || (showChevron && (
        <ChevronRight color={colors.textSecondary} size={20} />
      ))}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 28,
              color: colors.text,
              flex: 1,
            }}
          >
            Profile
          </Text>

          <TouchableOpacity
            onPress={handleEditProfile}
            style={{
              backgroundColor: '#4CAF50',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Edit color="white" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Profile Header */}
          <View
            style={{
              backgroundColor: '#DCD0FF',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: '#9C88FF',
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <User color="white" size={40} />
            </View>

            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 24,
                color: '#1C1C1C',
                marginBottom: 4,
                textAlign: 'center',
              }}
            >
              {userProfile.name}
            </Text>

            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 16,
                color: '#666666',
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              {userProfile.username}
            </Text>

            {/* Stats */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: '100%',
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 20,
                    color: '#1C1C1C',
                  }}
                >
                  {userProfile.totalPoints.toLocaleString()}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 12,
                    color: '#666666',
                  }}
                >
                  Points
                </Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 20,
                    color: '#1C1C1C',
                  }}
                >
                  {userProfile.currentStreak}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 12,
                    color: '#666666',
                  }}
                >
                  Day Streak
                </Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 20,
                    color: '#1C1C1C',
                  }}
                >
                  {userProfile.badges}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 12,
                    color: '#666666',
                  }}
                >
                  Badges
                </Text>
              </View>
            </View>
          </View>

          {/* Profile Information */}
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 20,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Profile Information
          </Text>

          <SettingRow
            icon={User}
            title="Personal Details"
            subtitle={`${userProfile.email} • ${userProfile.phone}`}
            onPress={handleEditProfile}
          />

          <SettingRow
            icon={Phone}
            title="Quick Dial Setup"
            subtitle={`Currently: ${userProfile.quickDialNumber}`}
            onPress={handleQuickDialSetup}
          />

          {/* App Settings */}
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 20,
              color: colors.text,
              marginBottom: 16,
              marginTop: 24,
            }}
          >
            App Settings
          </Text>

          <SettingRow
            icon={Bell}
            title="Notifications"
            subtitle="Wellness reminders, community updates"
            onPress={handleNotificationSettings}
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: '#4CAF50' }}
                thumbColor={notificationsEnabled ? 'white' : '#f4f3f4'}
              />
            }
            showChevron={false}
          />

          <SettingRow
            icon={Volume2}
            title="Sound Effects"
            subtitle="Button sounds and alerts"
            onPress={() => {}}
            rightElement={
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: colors.border, true: '#4CAF50' }}
                thumbColor={soundEnabled ? 'white' : '#f4f3f4'}
              />
            }
            showChevron={false}
          />

          <SettingRow
            icon={Moon}
            title="Dark Mode"
            subtitle="Automatic based on system settings"
            onPress={() => {}}
            rightElement={
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: colors.border, true: '#4CAF50' }}
                thumbColor={darkModeEnabled ? 'white' : '#f4f3f4'}
              />
            }
            showChevron={false}
          />

          <SettingRow
            icon={Shield}
            title="Privacy & Security"
            subtitle="Data settings and account security"
            onPress={handlePrivacySettings}
          />

          {/* Support */}
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 20,
              color: colors.text,
              marginBottom: 16,
              marginTop: 24,
            }}
          >
            Support
          </Text>

          <SettingRow
            icon={HelpCircle}
            title="Help & FAQ"
            subtitle="Get help and find answers"
            onPress={handleHelp}
          />

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: '#FFE4E1',
              borderRadius: 12,
              padding: 16,
              marginTop: 24,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut color="#F44336" size={20} />
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16,
                color: '#F44336',
                marginLeft: 8,
              }}
            >
              Log Out
            </Text>
          </TouchableOpacity>

          {/* App Info */}
          <View
            style={{
              alignItems: 'center',
              marginTop: 24,
              paddingVertical: 16,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
              }}
            >
              YouTheDriver v1.0.0
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              Member since {userProfile.joinDate}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}