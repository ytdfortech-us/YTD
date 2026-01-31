import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
  MessageCircle,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
} from 'lucide-react-native';
import { useThemeColors } from '../../utils/useThemeColors';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/AppHeader';
import { advocacyService } from '../../utils/firebase/firestoreService';
import { useAuthStore } from '../../utils/auth/store';

export default function MyMessagesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const { auth } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    loadMessages();
  }, [auth?.user?.id]);

  const loadMessages = async () => {
    if (!auth?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      const result = await advocacyService.getUserAdvocacies(auth.user.id);
      if (result.success) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = (messageId, index) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this advocacy message?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await advocacyService.deleteAdvocacy(messageId);
              if (result.success) {
                setMessages(prevMessages => prevMessages.filter((_, i) => i !== index));
              } else {
                Alert.alert('Error', 'Failed to delete message. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting message:', error);
              Alert.alert('Error', 'An unexpected error occurred.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle color="#4CAF50" size={20} />;
      case 'reviewed':
        return <AlertCircle color="#FF9800" size={20} />;
      default:
        return <Clock color="#999999" size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'resolved':
        return 'Resolved';
      case 'reviewed':
        return 'Under Review';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return '#4CAF50';
      case 'reviewed':
        return '#FF9800';
      default:
        return '#999999';
    }
  };

  const tagColors = {
    wellness: '#4CAF50',
    safety: '#FF9800',
    employer: '#F44336',
    roadside: '#2196F3',
    parking: '#9C27B0',
    regulation: '#795548',
    suggestion: '#607D8B',
    emergency: '#E91E63',
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      
      <AppHeader title="My Messages" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Header Stats */}
          <View
            style={{
              backgroundColor: colors.isDark ? '#2C2C2C' : '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 24,
                color: colors.text,
                marginBottom: 8,
              }}
            >
              {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: colors.textSecondary,
              }}
            >
              Your advocacy submissions
            </Text>
          </View>

          {/* Messages List */}
          {messages.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.isDark ? '#2C2C2C' : '#F5F5F5',
                borderRadius: 16,
                padding: 40,
                alignItems: 'center',
              }}
            >
              <MessageCircle color={colors.textSecondary} size={48} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 16,
                  color: colors.text,
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                No messages yet
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: 'center',
                }}
              >
                Your advocacy submissions will appear here
              </Text>
            </View>
          ) : (
            messages.map((message, index) => (
              <View
                key={message.id || index}
                style={{
                  backgroundColor: colors.isDark ? '#2C2C2C' : '#FFFFFF',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                {/* Header with Status and Delete Button */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {message.status && message.status !== 'pending' ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {getStatusIcon(message.status)}
                        <Text
                          style={{
                            fontFamily: 'Inter_500Medium',
                            fontSize: 14,
                            color: getStatusColor(message.status),
                            marginLeft: 6,
                          }}
                        >
                          {getStatusText(message.status)}
                        </Text>
                      </View>
                    ) : (
                      <View />
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 12,
                        color: colors.textSecondary,
                        marginRight: 12,
                      }}
                    >
                      {formatDate(message.createdAt)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteMessage(message.id, index)}
                      style={{
                        padding: 4,
                      }}
                    >
                      <Trash2 color="#F44336" size={18} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Message Content */}
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 15,
                    color: colors.text,
                    lineHeight: 22,
                    marginBottom: 12,
                  }}
                  numberOfLines={3}
                >
                  {message.message}
                </Text>

                {/* Tags */}
                {message.tags && message.tags.length > 0 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                    }}
                  >
                    {message.tags.map((tag, tagIndex) => (
                      <View
                        key={tagIndex}
                        style={{
                          backgroundColor: tagColors[tag] || '#607D8B',
                          borderRadius: 12,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          marginRight: 6,
                          marginBottom: 6,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Tag color="white" size={10} />
                        <Text
                          style={{
                            fontFamily: 'Inter_500Medium',
                            fontSize: 11,
                            color: 'white',
                            marginLeft: 4,
                          }}
                        >
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
