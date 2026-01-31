import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../utils/auth/useAuth';
import { neonAuth } from '../utils/auth/neonAuth';
import NeonAuthModal from '../utils/auth/NeonAuthModal';

/**
 * Example component demonstrating Neon authentication usage
 */
export default function NeonAuthExample() {
  const { isAuthenticated, auth, signIn, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize Neon Auth on component mount
  useEffect(() => {
    const initAuth = async () => {
      await neonAuth.initialize();
    };
    initAuth();
  }, []);

  // Fetch user profile when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    } else {
      setProfile(null);
    }
  }, [isAuthenticated]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const result = await neonAuth.getUserProfile();
      if (result.success) {
        setProfile(result.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await neonAuth.signOut();
    signOut(); // Update auth store
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Neon Authentication Example</Text>
      
      {isAuthenticated ? (
        <ScrollView style={styles.contentContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>User Information</Text>
            <Text style={styles.infoText}>ID: {auth?.user?.id}</Text>
            <Text style={styles.infoText}>Email: {auth?.user?.email}</Text>
            <Text style={styles.infoText}>Name: {auth?.user?.name}</Text>
          </View>
          
          {profile && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>User Profile</Text>
              <Text style={styles.infoText}>Quick Dial: {profile.quick_dial_number || 'Not set'}</Text>
              <Text style={styles.infoText}>Streak Count: {profile.streak_count}</Text>
              <Text style={styles.infoText}>Total Points: {profile.total_points}</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={fetchUserProfile}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : 'Refresh Profile'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.signOutButton]} 
            onPress={handleSignOut}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.unauthenticatedContainer}>
          <Text style={styles.message}>
            You are not authenticated. Please sign in to access your profile.
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={signIn}
          >
            <Text style={styles.buttonText}>Sign In / Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Include the NeonAuthModal component */}
      <NeonAuthModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  unauthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  signOutButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});