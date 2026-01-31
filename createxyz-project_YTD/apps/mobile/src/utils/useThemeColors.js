import { useColorScheme } from 'react-native';

export const useThemeColors = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    isDark,
    background: isDark ? '#121212' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1C1C1C',
    textSecondary: isDark ? '#BDBDBD' : '#9E9E9E',
    border: isDark ? '#2C2C2C' : '#E5E5E5',
    iconBackground: isDark ? '#2C2C2C' : '#F4F4F4',
    iconColor: isDark ? '#BDBDBD' : '#9E9E9E',
    buttonBg: isDark ? '#1E1E1E' : '#2B2B2B',
    buttonText: '#FFFFFF',
    divider: isDark ? '#2C2C2C' : '#E5E5E5',
    // Navigation specific colors
    navigationBg: '#D8CEFF',
    instructionBg: '#252525',
    progressTrack: '#DADADA',
    progressFill: '#9FAFFE',
    bottomPanel: isDark ? '#1E1E1E' : 'white',
    mapBackground: isDark ? '#1A1A1A' : '#f5f5f5',
    routeColor: isDark ? '#FFFFFF' : '#535353',
    carColor: isDark ? '#FFFFFF' : '#2B2B2B',
    // Store colors (keep bright for visibility)
    jennieStore: '#DCD0FF',
    sunshineStore: '#C9F8D3',
  };
};