import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Home, Users, Heart, MapPin, User } from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#121212" : "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: isDark ? "#2C2C2C" : "#E5E5E5",
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: isDark ? "#FFFFFF" : "#000000",
        tabBarInactiveTintColor: isDark ? "#6B6B6B" : "#6B6B6B",
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: "Communities",
          tabBarIcon: ({ color, size }) => <Users color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="wellness"
        options={{
          title: "Wellness",
          tabBarIcon: ({ color, size }) => <Heart color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="parking"
        options={{
          title: "Parking",
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
