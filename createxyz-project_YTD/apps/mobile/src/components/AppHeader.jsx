import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../utils/useThemeColors';

export default function AppHeader({ 
  title, 
  subtitle, 
  showBackButton = true, 
  showBorder = false,
  fontFamily = 'Inter_600SemiBold',
  fontSize = 28 
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: colors.background,
        borderBottomWidth: showBorder ? 1 : 0,
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
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {showBackButton && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 44,
                height: 44,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 8,
              }}
            >
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          )}

          <Text
            style={{
              fontFamily,
              fontSize,
              color: colors.text,
              flex: 1,
            }}
          >
            {title}
          </Text>
        </View>

        {subtitle && (
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 20,
              color: colors.textSecondary,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}