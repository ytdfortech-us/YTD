import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { 
  MapPin,
  List,
  Search,
  Filter,
  Star,
  Navigation,
  Clock,
  DollarSign,
  Truck,
  Heart
} from 'lucide-react-native';
import { useThemeColors } from '../../../utils/useThemeColors';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

export default function ParkingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const [showMap, setShowMap] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Sample parking locations
  const parkingLocations = [
    {
      id: '1',
      name: 'TA Travel Center Memphis',
      address: '5950 Brooks Rd, Memphis, TN',
      latitude: 35.1495,
      longitude: -90.0490,
      distance: '2.1 miles',
      rating: 4.3,
      reviews: 127,
      amenities: ['showers', 'food', 'fuel', 'wifi'],
      price: '$12/night',
      availability: 'Available',
      isFavorite: true,
      lastReported: '2 hours ago',
    },
    {
      id: '2',
      name: 'Pilot Flying J',
      address: '6405 Millbranch Rd, Memphis, TN',
      latitude: 35.0872,
      longitude: -89.9395,
      distance: '5.8 miles',
      rating: 4.1,
      reviews: 89,
      amenities: ['showers', 'food', 'fuel'],
      price: '$15/night',
      availability: 'Limited',
      isFavorite: false,
      lastReported: '1 hour ago',
    },
    {
      id: '3',
      name: 'Love\'s Travel Stop',
      address: '7734 Highway 64, Memphis, TN',
      latitude: 35.2083,
      longitude: -89.7456,
      distance: '8.2 miles',
      rating: 3.9,
      reviews: 203,
      amenities: ['showers', 'food', 'fuel', 'laundry'],
      price: '$10/night',
      availability: 'Full',
      isFavorite: false,
      lastReported: '30 minutes ago',
    },
  ];

  const filters = [
    { id: 'all', label: 'All', icon: MapPin },
    { id: 'available', label: 'Available', icon: Clock },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'amenities', label: 'Amenities', icon: Star },
  ];

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show nearby parking');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const handleToggleView = () => {
    setShowMap(!showMap);
  };

  const handleDirections = (location) => {
    Alert.alert('Navigation', `Opening directions to ${location.name}`);
  };

  const handleToggleFavorite = (locationId) => {
    Alert.alert('Favorites', 'Location added to favorites');
  };

  const handleLocationDetails = (location) => {
    router.push(`/parking/${location.id}`);
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available': return '#4CAF50';
      case 'Limited': return '#FF9800';
      case 'Full': return '#F44336';
      default: return colors.textSecondary;
    }
  };

  const filteredLocations = parkingLocations.filter(location => {
    if (selectedFilter === 'available') return location.availability === 'Available';
    if (selectedFilter === 'budget') return parseInt(location.price.replace(/[^0-9]/g, '')) <= 12;
    if (selectedFilter === 'amenities') return location.amenities.length >= 3;
    return true;
  });

  const renderParkingCard = (location) => (
    <TouchableOpacity
      key={location.id}
      onPress={() => handleLocationDetails(location)}
      style={{
        backgroundColor: colors.isDark ? '#2C2C2C' : '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8,
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 18,
              color: colors.text,
              marginBottom: 4,
            }}
          >
            {location.name}
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: 8,
            }}
          >
            {location.address}
          </Text>
        </View>

        <TouchableOpacity onPress={() => handleToggleFavorite(location.id)}>
          <Heart
            color={location.isFavorite ? '#FF6B6B' : colors.textSecondary}
            size={20}
            fill={location.isFavorite ? '#FF6B6B' : 'none'}
          />
        </TouchableOpacity>
      </View>

      {/* Rating and Distance */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 16,
          }}
        >
          <Star color="#FFD700" size={16} fill="#FFD700" />
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 14,
              color: colors.text,
              marginLeft: 4,
            }}
          >
            {location.rating}
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: colors.textSecondary,
              marginLeft: 4,
            }}
          >
            ({location.reviews})
          </Text>
        </View>

        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 14,
            color: colors.textSecondary,
          }}
        >
          {location.distance}
        </Text>
      </View>

      {/* Availability and Price */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <View
          style={{
            backgroundColor: getAvailabilityColor(location.availability),
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 12,
              color: 'white',
            }}
          >
            {location.availability}
          </Text>
        </View>

        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 16,
            color: colors.text,
          }}
        >
          {location.price}
        </Text>
      </View>

      {/* Amenities */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        {location.amenities.map((amenity, index) => (
          <View
            key={index}
            style={{
              backgroundColor: '#E3F2FD',
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginRight: 6,
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
              {amenity}
            </Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            color: colors.textSecondary,
          }}
        >
          Updated {location.lastReported}
        </Text>

        <TouchableOpacity
          onPress={() => handleDirections(location)}
          style={{
            backgroundColor: '#4CAF50',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Navigation color="white" size={14} />
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 12,
              color: 'white',
              marginLeft: 4,
            }}
          >
            Directions
          </Text>
        </TouchableOpacity>
      </View>
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
            Parking Finder
          </Text>

          <TouchableOpacity
            onPress={handleToggleView}
            style={{
              backgroundColor: '#4CAF50',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {showMap ? (
              <List color="white" size={24} />
            ) : (
              <MapPin color="white" size={24} />
            )}
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
            placeholder="Search by city, truck stop, or address..."
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

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingLeft: 16, marginBottom: 16 }}
        >
          {filters.map((filter) => {
            const IconComponent = filter.icon;
            return (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setSelectedFilter(filter.id)}
                style={{
                  backgroundColor: selectedFilter === filter.id ? '#4CAF50' : 'transparent',
                  borderWidth: 1,
                  borderColor: selectedFilter === filter.id ? '#4CAF50' : colors.border,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <IconComponent
                  color={selectedFilter === filter.id ? 'white' : colors.textSecondary}
                  size={16}
                />
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 14,
                    color: selectedFilter === filter.id ? 'white' : colors.textSecondary,
                    marginLeft: 6,
                  }}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {showMap ? (
        /* Map View */
        <View style={{ flex: 1 }}>
          {userLocation && (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              region={userLocation}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {filteredLocations.map((location) => (
                <Marker
                  key={location.id}
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title={location.name}
                  description={`${location.availability} • ${location.price}`}
                  pinColor={getAvailabilityColor(location.availability)}
                  onCalloutPress={() => handleLocationDetails(location)}
                />
              ))}
            </MapView>
          )}
        </View>
      ) : (
        /* List View */
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {filteredLocations.map(renderParkingCard)}
        </ScrollView>
      )}
    </View>
  );
}