import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Platform,
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
  Mic,
  MicOff,
  Send,
  Tag,
  CheckCircle,
  Trophy,
  Zap
} from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useThemeColors } from '../../utils/useThemeColors';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/AppHeader';
import { advocacyService } from '../../utils/firebase/firestoreService';
import { useAuthStore } from '../../utils/auth/store';

export default function AdvocacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const { auth } = useAuthStore();
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Request audio permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Audio permission not granted');
      }
    })();
  }, []);

  // Clean up recording on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  // Available tags for categorizing feedback
  const availableTags = [
    { id: 'wellness', label: 'Wellness', color: '#4CAF50' },
    { id: 'safety', label: 'Safety', color: '#FF9800' },
    { id: 'employer', label: 'Employer Complaint', color: '#F44336' },
    { id: 'roadside', label: 'Roadside Need', color: '#2196F3' },
    { id: 'parking', label: 'Parking Issue', color: '#9C27B0' },
    { id: 'regulation', label: 'Regulation Concern', color: '#795548' },
    { id: 'suggestion', label: 'Suggestion', color: '#607D8B' },
    { id: 'emergency', label: 'Emergency', color: '#E91E63' },
  ];

  if (!fontsLoaded) {
    return null;
  }

  const handleStartRecording = async () => {
    if (isRecording) {
      // Stop recording
      try {
        if (recording) {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          setRecording(null);
          setIsRecording(false);
          
          // Simulate speech-to-text conversion
          // Note: Expo doesn't have built-in speech recognition
          // This is a placeholder - you'd need a cloud service for real STT
          const transcribedText = await simulateSpeechToText(recordingDuration);
          setMessage(transcribedText);
        }
      } catch (error) {
        console.error('Failed to stop recording:', error);
        Alert.alert('Error', 'Failed to stop recording');
        setIsRecording(false);
      }
    } else {
      // Start recording
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        
        setRecording(newRecording);
        setIsRecording(true);
        setRecordingDuration(0);
        setMessage('');
        
        // Update duration every second
        const interval = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
        
        // Store interval reference for cleanup
        newRecording._durationInterval = interval;
      } catch (error) {
        console.error('Failed to start recording:', error);
        Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
      }
    }
  };

  // Simulate speech-to-text (placeholder)
  // In production, you'd send the audio to a service like Google Cloud Speech-to-Text
  const simulateSpeechToText = async (duration) => {
    // Sample responses based on duration
    const samples = [
      "I want to report a safety concern about inadequate lighting at rest areas on I-40.",
      "There's a parking shortage at the truck stop near Memphis. We need more overnight spaces.",
      "The wellness program has been really helpful for my health. Thank you for providing these resources.",
      "I'd like to suggest adding more healthy food options at rest stops along the highway.",
    ];
    
    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    return `${randomSample} (${duration}s recording)`;
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        // Limit to max 3 tags
        if (prev.length >= 3) {
          Alert.alert('Maximum Tags', 'You can select up to 3 tags only.');
          return prev;
        }
        return [...prev, tagId];
      }
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!message.trim()) {
      Alert.alert('Error', 'Please add a message before submitting.');
      return;
    }

    if (selectedTags.length === 0) {
      Alert.alert('Error', 'Please select at least one tag to categorize your feedback.');
      return;
    }

    if (!auth?.user?.id) {
      Alert.alert('Login Required', 'Please log in to submit advocacy feedback.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to Firebase
      const result = await advocacyService.submitAdvocacy({
        userId: auth.user.id,
        userName: auth.user.name || auth.user.email,
        userEmail: auth.user.email,
        message: message.trim(),
        tags: selectedTags,
        isVoiceRecording: false,
      });

      if (result.success) {
        setIsSubmitting(false);
        
        Alert.alert(
          'Feedback Submitted! 🎉',
          'Your advocacy message has been received and will be reviewed. You earned 25 points for speaking up!',
          [
            {
              text: 'Submit Another',
              onPress: () => {
                setMessage('');
                setSelectedTags([]);
              }
            },
            {
              text: 'Back to Home',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        setIsSubmitting(false);
        Alert.alert('Error', result.error || 'Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error('Advocacy submission error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      
      <AppHeader title="Advocacy" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* View My Messages Button */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginBottom: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push('/advocacy/my-messages')}
            >
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 16,
                  color: '#4CAF50',
                  textDecorationLine: 'underline',
                }}
              >
                View My Messages
              </Text>
            </TouchableOpacity>
          </View>

          {/* Intro */}
          <View
            style={{
              backgroundColor: '#E8F5E8',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                backgroundColor: '#4CAF50',
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Mic color="white" size={28} />
            </View>
            
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 20,
                color: '#1C1C1C',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              Your Voice Matters
            </Text>
            
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 16,
                color: '#666666',
                textAlign: 'center',
                lineHeight: 24,
              }}
            >
              Share your concerns, suggestions, or experiences. Your feedback helps improve conditions for all drivers.
            </Text>
          </View>

          {/* Recording Section */}
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 20,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Record or Type Your Message
          </Text>

          {/* Voice Recording Button */}
          <TouchableOpacity
            onPress={handleStartRecording}
            style={{
              backgroundColor: isRecording ? '#F44336' : '#4CAF50',
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isRecording ? (
              <MicOff color="white" size={24} />
            ) : (
              <Mic color="white" size={24} />
            )}
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 18,
                color: 'white',
                marginLeft: 12,
              }}
            >
              {isRecording ? 'Stop Recording' : 'Start Voice Recording'}
            </Text>
          </TouchableOpacity>

          {isRecording && (
            <View
              style={{
                backgroundColor: '#FFE4E1',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 16,
                  color: '#F44336',
                  marginBottom: 8,
                }}
              >
                🔴 Recording... {recordingDuration}s
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: '#666666',
                  textAlign: 'center',
                }}
              >
                Speak clearly about your concern or suggestion
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 12,
                  color: '#999999',
                  textAlign: 'center',
                  marginTop: 8,
                }}
              >
                Tap "Stop Recording" when finished
              </Text>
            </View>
          )}

          {/* Text Input */}
          <View
            style={{
              backgroundColor: colors.isDark ? '#2C2C2C' : '#FFFFFF',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 24,
            }}
          >
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message here, or use voice recording above..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 16,
                color: colors.text,
                padding: 16,
                textAlignVertical: 'top',
                minHeight: 120,
              }}
            />
          </View>

          {/* Tags Section */}
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 20,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Select Categories
          </Text>

          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: 8,
            }}
          >
            Choose 1-3 tags that best describe your feedback to help us route it properly.
          </Text>

          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 14,
              color: selectedTags.length >= 3 ? '#F44336' : '#4CAF50',
              marginBottom: 16,
            }}
          >
            {selectedTags.length}/3 tags selected
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: 32,
            }}
          >
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <TouchableOpacity
                  key={tag.id}
                  onPress={() => handleTagToggle(tag.id)}
                  style={{
                    backgroundColor: isSelected ? tag.color : 'transparent',
                    borderWidth: 2,
                    borderColor: tag.color,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    marginRight: 8,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Tag
                    color={isSelected ? 'white' : tag.color}
                    size={14}
                  />
                  <Text
                    style={{
                      fontFamily: 'Inter_500Medium',
                      fontSize: 14,
                      color: isSelected ? 'white' : tag.color,
                      marginLeft: 6,
                    }}
                  >
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Gamification Info */}
          <View
            style={{
              backgroundColor: '#DCD0FF',
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Trophy color="#1C1C1C" size={24} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 16,
                  color: '#1C1C1C',
                  marginBottom: 4,
                }}
              >
                Earn Points for Speaking Up!
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: '#666666',
                }}
              >
                +25 points for each submission • Build your advocacy badge
              </Text>
            </View>
            <Zap color="#FFD700" size={20} />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? colors.border : '#4CAF50',
              borderRadius: 24,
              padding: 20,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
          >
            {isSubmitting ? (
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 18,
                  color: colors.textSecondary,
                }}
              >
                Submitting...
              </Text>
            ) : (
              <>
                <Send color="white" size={20} />
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 18,
                    color: 'white',
                    marginLeft: 8,
                  }}
                >
                  Submit Feedback
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Recent Submissions */}
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 20,
              color: colors.text,
              marginTop: 32,
              marginBottom: 16,
            }}
          >
            Recent Impact
          </Text>

          <View
            style={{
              backgroundColor: colors.isDark ? '#2C2C2C' : '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <CheckCircle color="#4CAF50" size={20} />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 16,
                  color: colors.text,
                  marginLeft: 8,
                }}
              >
                Rest Area Lighting Improved
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
              Based on driver feedback, 3 rest areas on I-40 now have better lighting for nighttime safety.
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 12,
                color: '#4CAF50',
              }}
            >
              Your voice made this happen! 🎉
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}