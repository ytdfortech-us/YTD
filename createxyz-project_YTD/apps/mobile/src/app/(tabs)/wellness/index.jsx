import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  Trophy,
  Target,
  Activity,
  Users,
  CheckCircle,
  Clock,
  Zap,
  Heart,
  Eye,
  Droplets,
  Move,
} from "lucide-react-native";
import { useThemeColors } from "../../../utils/useThemeColors";
import { useRouter } from "expo-router";
import { databaseClient } from "../../../utils/database";

export default function WellnessScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const [currentPoints, setCurrentPoints] = useState(1250);
  const [currentStreak, setCurrentStreak] = useState(7);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Load wellness activities from database
  useEffect(() => {
    const loadWellnessData = async () => {
      try {
        const userId = 'demo-user-id'; // In a real app, this would come from authentication
        
        // Load activities from database
        const activitiesData = await databaseClient.getWellnessActivities();
        setActivities(activitiesData);
        
        // Load user stats
        const stats = await databaseClient.getWellnessStats(userId);
        setCurrentPoints(stats.totalPoints || 0);
        setCurrentStreak(stats.streakCount || 0);
      } catch (error) {
        console.error('Failed to load wellness data:', error);
        // Use default activities if database fails
        setActivities(dailyPrompts);
      } finally {
        setLoading(false);
      }
    };

    if (fontsLoaded) {
      loadWellnessData();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || loading) {
    return null;
  }

  // Daily wellness prompts
  const dailyPrompts = [
    {
      id: "1",
      title: "Mirror Check",
      description: "Adjust mirrors and check blind spots",
      points: 25,
      icon: Eye,
      completed: true,
      category: "Safety",
    },
    {
      id: "2",
      title: "Hydration Break",
      description: "Drink a full glass of water",
      points: 30,
      icon: Droplets,
      completed: true,
      category: "Health",
    },
    {
      id: "3",
      title: "Stretch Break",
      description: "5-minute stretch routine",
      points: 50,
      icon: Move,
      completed: false,
      category: "Physical",
    },
    {
      id: "4",
      title: "Deep Breathing",
      description: "3 minutes of focused breathing",
      points: 40,
      icon: Heart,
      completed: false,
      category: "Mental",
    },
  ];

  // Earned badges
  const badges = [
    {
      id: "1",
      name: "Safety First",
      emoji: "🛡️",
      description: "7-day safety streak",
    },
    {
      id: "2",
      name: "Hydration Hero",
      emoji: "💧",
      description: "30 hydration checks",
    },
    {
      id: "3",
      name: "Wellness Warrior",
      emoji: "⚡",
      description: "100 wellness activities",
    },
  ];

  // Leaderboard data
  const leaderboard = [
    { rank: 1, name: "Sarah_HighwayHero", points: 2840, avatar: "🌟" },
    { rank: 2, name: "Mike_TruckMaster", points: 2650, avatar: "🚛" },
    { rank: 3, name: "You", points: 1250, avatar: "🎯" },
    { rank: 4, name: "Tom_RoadWarrior", points: 1180, avatar: "⚡" },
    { rank: 5, name: "Lisa_FleetCaptain", points: 1050, avatar: "👑" },
  ];

  const handleCompletePrompt = async (promptId) => {
    const prompt = activities.find((p) => p.id === promptId) || dailyPrompts.find((p) => p.id === promptId);
    if (prompt && !prompt.completed) {
      try {
        const userId = 'demo-user-id'; // In a real app, this would come from authentication
        
        // Save completion to database
        await databaseClient.completeWellnessActivity({
          userId,
          activityId: prompt.id,
          notes: `Completed ${prompt.title}`
        });
        
        setCurrentPoints((prev) => prev + prompt.points);
        Alert.alert(
          "Great job!",
          `You earned ${prompt.points} points for completing ${prompt.title}!`,
        );
      } catch (error) {
        console.error('Failed to save wellness completion:', error);
        Alert.alert(
          "Error",
          "Failed to save your progress. Please try again.",
        );
      }
    }
  };

  const handleLeaderboardToggle = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colors.isDark ? "light" : "dark"} />

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
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 28,
              color: colors.text,
              flex: 1,
            }}
          >
            Wellness
          </Text>

          <TouchableOpacity
            onPress={handleLeaderboardToggle}
            style={{
              backgroundColor: "#4CAF50",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Users color="white" size={16} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: "white",
                marginLeft: 6,
              }}
            >
              Leaderboard
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Points and Streak Dashboard */}
          <View
            style={{
              backgroundColor: "#DCD0FF",
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View style={{ alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Trophy color="#1C1C1C" size={24} />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 32,
                      color: "#1C1C1C",
                      marginLeft: 8,
                    }}
                  >
                    {currentPoints.toLocaleString()}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: "#666666",
                  }}
                >
                  Total Points
                </Text>
              </View>

              <View
                style={{
                  width: 1,
                  height: 40,
                  backgroundColor: "#666666",
                  opacity: 0.3,
                }}
              />

              <View style={{ alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Zap color="#1C1C1C" size={24} />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 32,
                      color: "#1C1C1C",
                      marginLeft: 8,
                    }}
                  >
                    {currentStreak}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: "#666666",
                  }}
                >
                  Day Streak
                </Text>
              </View>
            </View>
          </View>

          {/* Earned Badges */}
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 20,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Earned Badges
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 24 }}
          >
            {badges.map((badge, index) => (
              <View
                key={badge.id}
                style={{
                  backgroundColor: colors.isDark ? "#2C2C2C" : "#F8F9FA",
                  borderRadius: 16,
                  padding: 16,
                  marginRight: 12,
                  alignItems: "center",
                  width: 120,
                }}
              >
                <Text style={{ fontSize: 32, marginBottom: 8 }}>
                  {badge.emoji}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    color: colors.text,
                    textAlign: "center",
                    marginBottom: 4,
                  }}
                >
                  {badge.name}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.textSecondary,
                    textAlign: "center",
                  }}
                >
                  {badge.description}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Today's Wellness Prompts */}
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 20,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Today's Wellness
          </Text>

          {(activities.length > 0 ? activities : dailyPrompts).map((prompt) => {
            const IconComponent = prompt.icon;
            return (
              <TouchableOpacity
                key={prompt.id}
                onPress={() => handleCompletePrompt(prompt.id)}
                style={{
                  backgroundColor: colors.isDark ? "#2C2C2C" : "#FFFFFF",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: prompt.completed ? 0.7 : 1,
                }}
                disabled={prompt.completed}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        backgroundColor: prompt.completed
                          ? "#4CAF50"
                          : "#E3F2FD",
                        borderRadius: 24,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 16,
                      }}
                    >
                      {prompt.completed ? (
                        <CheckCircle color="white" size={24} />
                      ) : (
                        <IconComponent color="#2196F3" size={24} />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 16,
                          color: colors.text,
                          marginBottom: 4,
                        }}
                      >
                        {prompt.title}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 14,
                          color: colors.textSecondary,
                          marginBottom: 4,
                        }}
                      >
                        {prompt.description}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 12,
                          color: "#4CAF50",
                        }}
                      >
                        {prompt.category} • +{prompt.points} points
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Leaderboard Section */}
          {showLeaderboard && (
            <View style={{ marginTop: 24 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 20,
                  color: colors.text,
                  marginBottom: 16,
                }}
              >
                This Week's Leaderboard
              </Text>

              {leaderboard.map((driver) => (
                <View
                  key={driver.rank}
                  style={{
                    backgroundColor:
                      driver.name === "You"
                        ? "#DCD0FF"
                        : colors.isDark
                          ? "#2C2C2C"
                          : "#F8F9FA",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: driver.rank <= 3 ? "#FFD700" : "#E0E0E0",
                      borderRadius: 16,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color: driver.rank <= 3 ? "#1C1C1C" : "#666666",
                      }}
                    >
                      {driver.rank}
                    </Text>
                  </View>

                  <Text style={{ fontSize: 20, marginRight: 12 }}>
                    {driver.avatar}
                  </Text>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 16,
                        color: driver.name === "You" ? "#1C1C1C" : colors.text,
                      }}
                    >
                      {driver.name}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: driver.name === "You" ? "#1C1C1C" : colors.text,
                    }}
                  >
                    {driver.points.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
