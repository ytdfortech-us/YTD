import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
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
  Plus,
  Search,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Users
} from 'lucide-react-native';
import { useThemeColors } from '../../../utils/useThemeColors';
import { useRouter } from 'expo-router';
import { postsService } from '../../../utils/firebase/firestoreService';
import { useAuthStore } from '../../../utils/auth/store';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../utils/auth/firebaseConfig';

export default function CommunitiesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const { auth } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'circle'
  const [searchText, setSearchText] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState(new Set());

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch posts from Firebase
  useEffect(() => {
    const unsubscribe = postsService.subscribeToPosts((fetchedPosts) => {
      setPosts(fetchedPosts);
      setLoading(false);
      
      // Check which posts the current user has liked
      if (auth?.user?.id) {
        checkUserLikes(fetchedPosts);
      }
    });

    return () => unsubscribe();
  }, [auth?.user?.id]);

  // Check if user has liked each post
  const checkUserLikes = async (postsToCheck) => {
    if (!auth?.user?.id) return;
    
    const likedSet = new Set();
    
    for (const post of postsToCheck) {
      try {
        const likeRef = doc(db, 'posts', post.id, 'likes', auth.user.id);
        const likeDoc = await getDoc(likeRef);
        if (likeDoc.exists()) {
          likedSet.add(post.id);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    }
    
    setLikedPosts(likedSet);
  };

  // Format timestamp to "time ago"
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const postDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return `${Math.floor(diffDays / 7)}w`;
  };

  if (!fontsLoaded) {
    return null;
  }

  const handleCreatePost = () => {
    router.push('/create-post');
  };

  const handleLikePost = async (postId) => {
    if (!auth?.user?.id) {
      Alert.alert('Login Required', 'Please log in to like posts');
      return;
    }

    // Optimistic update
    const isCurrentlyLiked = likedPosts.has(postId);
    const newLikedPosts = new Set(likedPosts);
    
    if (isCurrentlyLiked) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);

    // Update in Firebase
    const result = await postsService.toggleLike(postId, auth.user.id);
    
    if (!result.success) {
      // Revert on error
      setLikedPosts(likedPosts);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleCommentPost = (postId) => {
    router.push(`/post/${postId}`);
  };

  const handleSharePost = (postId) => {
    Alert.alert('Share', 'Share functionality would be implemented here');
  };

  // Filter posts based on search text
  const filteredPosts = posts.filter((post) => {
    if (!searchText.trim()) return true;
    
    const searchLower = searchText.toLowerCase();
    
    // Search in content
    if (post.content?.toLowerCase().includes(searchLower)) return true;
    
    // Search in author name
    if (post.author?.toLowerCase().includes(searchLower)) return true;
    
    // Search in tags
    if (post.tags?.some(tag => tag.toLowerCase().includes(searchLower))) return true;
    
    return false;
  });

  const renderPost = ({ item }) => (
    <View
      style={{
        backgroundColor: colors.isDark ? '#2C2C2C' : '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 24, marginRight: 12 }}>{item.avatar || '👤'}</Text>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16,
                color: colors.text,
              }}
            >
              {item.author || 'Anonymous'}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: colors.textSecondary,
              }}
            >
              {formatTimeAgo(item.createdAt)} ago
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <MoreHorizontal color={colors.textSecondary} size={20} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 16,
          color: colors.text,
          lineHeight: 24,
          marginBottom: 12,
        }}
      >
        {item.content}
      </Text>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 16,
          }}
        >
          {item.tags.map((tag, index) => (
            <View
              key={index}
              style={{
                backgroundColor: '#E3F2FD',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
                marginRight: 8,
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 12,
                  color: '#1976D2',
                }}
              >
                #{tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => handleLikePost(item.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 24,
            }}
          >
            <Heart
              color={likedPosts.has(item.id) ? '#FF6B6B' : colors.textSecondary}
              size={20}
              fill={likedPosts.has(item.id) ? '#FF6B6B' : 'none'}
            />
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                color: colors.textSecondary,
                marginLeft: 6,
              }}
            >
              {item.likes || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCommentPost(item.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 24,
            }}
          >
            <MessageCircle color={colors.textSecondary} size={20} />
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                color: colors.textSecondary,
                marginLeft: 6,
              }}
            >
              {item.comments || 0}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => handleSharePost(item.id)}>
          <Share2 color={colors.textSecondary} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ 
          fontFamily: 'Inter_500Medium', 
          fontSize: 16, 
          color: colors.textSecondary,
          marginTop: 16 
        }}>
          Loading posts...
        </Text>
      </View>
    );
  }

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
            Communities
          </Text>

          <TouchableOpacity
            onPress={handleCreatePost}
            style={{
              backgroundColor: '#4CAF50',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Plus color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Tab Toggle */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => setActiveTab('all')}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              backgroundColor: activeTab === 'all' ? '#4CAF50' : 'transparent',
              borderRadius: 8,
              marginRight: 8,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16,
                color: activeTab === 'all' ? 'white' : colors.textSecondary,
              }}
            >
              All Drivers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('circle')}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              backgroundColor: activeTab === 'circle' ? '#4CAF50' : 'transparent',
              borderRadius: 8,
              marginLeft: 8,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16,
                color: activeTab === 'circle' ? 'white' : colors.textSecondary,
              }}
            >
              My Circle
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.isDark ? '#2C2C2C' : '#F5F5F5',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginHorizontal: 16,
            marginBottom: 16,
          }}
        >
          <Search color={colors.textSecondary} size={20} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search posts, tags, or drivers..."
            placeholderTextColor={colors.textSecondary}
            style={{
              flex: 1,
              marginLeft: 12,
              fontFamily: 'Inter_400Regular',
              fontSize: 16,
              color: colors.text,
            }}
          />
        </View>
      </View>

      {/* Posts Feed */}
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 20,
        }}
        ListEmptyComponent={
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 40,
              alignItems: 'center',
            }}
          >
            <Search color={colors.textSecondary} size={48} />
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 16,
                color: colors.text,
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              No posts found
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
              }}
            >
              {searchText ? `No results for "${searchText}"` : 'No posts available yet'}
            </Text>
          </View>
        }
      />
    </View>
  );
}