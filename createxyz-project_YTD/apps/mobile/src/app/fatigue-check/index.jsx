import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
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
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  Coffee,
  Camera
} from 'lucide-react-native';
import { useThemeColors } from '../../utils/useThemeColors';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/AppHeader';
import { databaseClient } from '../../utils/database';

export default function FatigueCheckScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [fatigueLevel, setFatigueLevel] = useState('low'); // 'low', 'medium', 'high'
  
  const progressAnimation = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fatigue assessment questions
  const questions = [
    {
      id: 1,
      question: "How alert do you feel right now?",
      options: [
        { text: "Very alert", value: 1, emoji: "😊" },
        { text: "Somewhat alert", value: 2, emoji: "🙂" },
        { text: "Slightly drowsy", value: 3, emoji: "😐" },
        { text: "Very drowsy", value: 4, emoji: "😴" },
      ]
    },
    {
      id: 2,
      question: "How many hours have you driven today?",
      options: [
        { text: "Less than 4 hours", value: 1, emoji: "🚛" },
        { text: "4-6 hours", value: 2, emoji: "🚚" },
        { text: "6-8 hours", value: 3, emoji: "⚠️" },
        { text: "More than 8 hours", value: 4, emoji: "🛑" },
      ]
    },
    {
      id: 3,
      question: "How many hours of sleep did you get last night?",
      options: [
        { text: "8+ hours", value: 1, emoji: "😴" },
        { text: "6-8 hours", value: 2, emoji: "🛌" },
        { text: "4-6 hours", value: 3, emoji: "😪" },
        { text: "Less than 4 hours", value: 4, emoji: "😵" },
      ]
    },
    {
      id: 4,
      question: "Do you feel any of these symptoms?",
      options: [
        { text: "None", value: 1, emoji: "✅" },
        { text: "Heavy eyelids", value: 3, emoji: "👁️" },
        { text: "Difficulty focusing", value: 3, emoji: "🌀" },
        { text: "Multiple symptoms", value: 4, emoji: "⚠️" },
      ]
    }
  ];

  if (!fontsLoaded) {
    return null;
  }

  const handleAnswer = (answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      
      // Update progress animation
      Animated.timing(progressAnimation, {
        toValue: (currentQuestion + 1) / questions.length,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Calculate fatigue level
      const totalScore = newAnswers.reduce((sum, answer) => sum + answer.value, 0);
      const avgScore = totalScore / questions.length;
      
      let level = 'low';
      if (avgScore >= 3.5) level = 'high';
      else if (avgScore >= 2.5) level = 'medium';
      
      setFatigueLevel(level);
      setShowResult(true);
      
      // Complete progress animation
      Animated.timing(progressAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const saveFatigueCheck = async () => {
    try {
      const userId = 'demo-user-id'; // In a real app, this would come from authentication
      
      const fatigueData = {
        userId,
        alertnessScore: alertnessScore,
        fatigueLevel: fatigueLevel,
        symptoms: selectedSymptoms,
        recommendations: getRecommendations(),
        locationLat: null, // Could be added with location services
        locationLng: null,
      };
      
      await databaseClient.submitFatigueCheck(fatigueData);
      console.log('Fatigue check saved successfully');
    } catch (error) {
      console.error('Failed to save fatigue check:', error);
      // Continue with the flow even if save fails
    }
  };

  const handleRestRecommendation = async () => {
    await saveFatigueCheck();
    Alert.alert(
      'Rest Recommended',
      'Finding nearby rest areas and setting a 20-minute break timer.',
      [
        { text: 'Set Timer', onPress: () => console.log('Setting break timer') },
        { text: 'Find Rest Area', onPress: () => router.push('/(tabs)/parking') },
      ]
    );
  };

  const handleContinueWithCaution = async () => {
    await saveFatigueCheck();
    Alert.alert(
      'Safety Reminder',
      'Please drive carefully and take a break at the next opportunity.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleSafeToContinue = async () => {
    await saveFatigueCheck();
    Alert.alert(
      'Good to Go!',
      'You seem alert and ready to drive safely. Remember to take regular breaks.',
      [{ text: 'Continue', onPress: () => router.back() }]
    );
  };

  const getResultConfig = () => {
    switch (fatigueLevel) {
      case 'high':
        return {
          title: 'Take a Break',
          subtitle: 'High fatigue detected - rest is strongly recommended',
          color: '#F44336',
          backgroundColor: '#FFE4E1',
          icon: AlertTriangle,
          action: handleRestRecommendation,
          actionText: 'Find Rest Area',
        };
      case 'medium':
        return {
          title: 'Use Caution',
          subtitle: 'Moderate fatigue - consider taking a break soon',
          color: '#FF9800',
          backgroundColor: '#FFF3E0',
          icon: Clock,
          action: handleContinueWithCaution,
          actionText: 'Continue with Caution',
        };
      default:
        return {
          title: 'Good to Drive',
          subtitle: 'Low fatigue - you seem alert and ready',
          color: '#4CAF50',
          backgroundColor: '#E8F5E8',
          icon: CheckCircle,
          action: handleSafeToContinue,
          actionText: 'Continue Driving',
        };
    }
  };

  const resultConfig = getResultConfig();
  const ResultIcon = resultConfig.icon;

  if (showResult) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={colors.isDark ? 'light' : 'dark'} />
        
        <AppHeader title="Fatigue Assessment" />

        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
          }}
        >
          <View
            style={{
              width: 120,
              height: 120,
              backgroundColor: resultConfig.backgroundColor,
              borderRadius: 60,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 32,
            }}
          >
            <ResultIcon color={resultConfig.color} size={48} />
          </View>

          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 28,
              color: colors.text,
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            {resultConfig.title}
          </Text>

          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 18,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 26,
              marginBottom: 40,
            }}
          >
            {resultConfig.subtitle}
          </Text>

          <TouchableOpacity
            onPress={resultConfig.action}
            style={{
              backgroundColor: resultConfig.color,
              borderRadius: 24,
              paddingVertical: 20,
              paddingHorizontal: 40,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 200,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 18,
                color: 'white',
              }}
            >
              {resultConfig.actionText}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 24,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 16,
                color: colors.textSecondary,
              }}
            >
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      
      <AppHeader title="Fatigue Assessment" />

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Progress Bar */}
        <View
          style={{
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            marginVertical: 20,
          }}
        >
          <Animated.View
            style={{
              height: 4,
              backgroundColor: '#4CAF50',
              borderRadius: 2,
              width: progressAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
        </View>

        {/* Question Counter */}
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Question {currentQuestion + 1} of {questions.length}
        </Text>

        {/* Question */}
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 24,
            color: colors.text,
            textAlign: 'center',
            lineHeight: 32,
            marginBottom: 40,
            paddingHorizontal: 16,
          }}
        >
          {currentQ.question}
        </Text>

        {/* Answer Options */}
        <View style={{ flex: 1 }}>
          {currentQ.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleAnswer(option)}
              style={{
                backgroundColor: colors.isDark ? '#2C2C2C' : '#FFFFFF',
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 28, marginRight: 16 }}>
                {option.emoji}
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 18,
                  color: colors.text,
                  flex: 1,
                }}
              >
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Optional Camera Check */}
        <View
          style={{
            backgroundColor: colors.isDark ? '#2C2C2C' : '#F8F9FA',
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Camera color={colors.textSecondary} size={24} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16,
                color: colors.text,
                marginBottom: 4,
              }}
            >
              Optional: Blink Test
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: colors.textSecondary,
              }}
            >
              Camera can detect drowsiness patterns
            </Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: '#4CAF50',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 12,
                color: 'white',
              }}
            >
              Start Test
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}