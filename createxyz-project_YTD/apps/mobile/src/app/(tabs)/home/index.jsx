import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
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
  AlertTriangle, 
  Mic, 
  Phone, 
  Activity, 
  Users, 
  Zap,
  Clock,
  CheckCircle 
} from 'lucide-react-native';
import { useThemeColors } from '../../../utils/useThemeColors';
import { useRouter } from 'expo-router';
import { databaseClient } from '../../../utils/database';
import { useAuth } from '../../../utils/auth/useAuth';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const { auth } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(7);
  const [userName, setUserName] = useState(auth?.user?.name || 'User');
  const [quickDialNumber, setQuickDialNumber] = useState('+1-317-123-456');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [communityPost, setCommunityPost] = useState(null);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Load user data from database
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // For demo purposes, using a hardcoded user ID
        // In a real app, this would come from authentication
        const userId = 'demo-user-id';
        
        // Load user profile
        const profile = await databaseClient.getUserProfile(userId);
        setUserProfile(profile);
        setUserName(profile.name || 'User');
        setQuickDialNumber(profile.quick_dial_number || '+1-317-123-456');
        setCurrentStreak(profile.streak_count || 0);
        
        // Load latest community post
        const communityData = await databaseClient.getCommunityPosts({ limit: 1 });
        if (communityData.data && communityData.data.length > 0) {
          setCommunityPost(communityData.data[0]);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        // Continue with default values if database fails
      } finally {
        setLoading(false);
      }
    };

    if (fontsLoaded) {
      loadUserData();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || loading) {
    return null;
  }

  const handleFatigueCheck = () => {
    router.push('/fatigue-check');
  };

  const handleAdvocacyButton = () => {
    router.push('/advocacy');
  };

  const handleQuickDial = async () => {
    try {
      await Linking.openURL(`tel:${quickDialNumber}`);
    } catch (error) {
      Alert.alert('Error', 'Unable to make phone call');
    }
  };

  const handleWellnessPrompt = () => {
    router.push('/(tabs)/wellness');
  };

  const handleCommunityFeed = () => {
    router.push('/(tabs)/communities');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: colors.background,
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 16,
          }}
        >
          <View>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 28,
                color: colors.text,
              }}
            >
              Hello, {userName}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 16,
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              Stay safe on the road
            </Text>
          </View>

          {/* Streak Counter */}
          <View
            style={{
              backgroundColor: '#DCD0FF',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 20,
                color: '#1C1C1C',
              }}
            >
              {currentStreak}
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
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16 }}>
          {/* Quick Access Cards */}
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 20,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Quick Access
          </Text>

          {/* Fatigue Self-Check */}
          <TouchableOpacity
            onPress={handleFatigueCheck}
            style={{
              backgroundColor: '#FFE4E1',
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                backgroundColor: '#FF6B6B',
                borderRadius: 24,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
              }}
            >
              <AlertTriangle color="white" size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 18,
                  color: '#1C1C1C',
                }}
              >
                Fatigue Self-Check
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: '#666666',
                  marginTop: 4,
                }}
              >
                Quick assessment of your alertness
              </Text>
            </View>
          </TouchableOpacity>

          {/* Advocacy Button */}
          <TouchableOpacity
            onPress={handleAdvocacyButton}
            style={{
              backgroundColor: '#E8F5E8',
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                backgroundColor: '#4CAF50',
                borderRadius: 24,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
              }}
            >
              <Mic color="white" size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 18,
                  color: '#1C1C1C',
                }}
              >
                Advocacy Button
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: '#666666',
                  marginTop: 4,
                }}
              >
                Share your concerns and feedback
              </Text>
            </View>
          </TouchableOpacity>

          {/* One Call Quick Dial */}
          <TouchableOpacity
            onPress={handleQuickDial}
            style={{
              backgroundColor: '#E3F2FD',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                backgroundColor: '#2196F3',
                borderRadius: 24,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
              }}
            >
              <Phone color="white" size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 18,
                  color: '#1C1C1C',
                }}
              >
                Quick Dial
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: '#666666',
                  marginTop: 4,
                }}
              >
                {quickDialNumber}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Today's Wellness */}
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 20,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Today's Wellness
          </Text>

          <TouchableOpacity
            onPress={handleWellnessPrompt}
            style={{
              backgroundColor: colors.isDark ? '#2C2C2C' : '#F8F9FA',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Activity color={colors.text} size={20} />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 16,
                  color: colors.text,
                  marginLeft: 8,
                }}
              >
                Mirror Check & Stretch
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 12,
              }}
            >
              Take a moment to check your mirrors and do a quick stretch
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <CheckCircle color="#4CAF50" size={16} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  color: '#4CAF50',
                  marginLeft: 6,
                }}
              >
                +50 points
              </Text>
            </View>
          </TouchableOpacity>

          {/* Community Activity */}
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 20,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Community Activity
          </Text>

          <TouchableOpacity
            onPress={handleCommunityFeed}
            style={{
              backgroundColor: colors.isDark ? '#2C2C2C' : '#F8F9FA',
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Users color={colors.text} size={20} />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 16,
                  color: colors.text,
                  marginLeft: 8,
                }}
              >
                Latest from the community
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 8,
              }}
            >
              {communityPost ? `"${communityPost.content}"` : '"Found a great truck stop with clean showers in Memphis!"'}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 12,
                color: colors.textSecondary,
              }}
            >
              {communityPost ? `Posted by ${communityPost.author_name} • ${new Date(communityPost.created_at).toLocaleDateString()}` : 'Posted by @TruckDriver_Mike • 2h ago'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}