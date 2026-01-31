import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from './store';
import { neonAuth } from './neonAuth';

/**
 * A form component for direct Neon database authentication
 * Supports both sign in and sign up modes
 */
export const NeonAuthForm = ({ onSuccess, initialMode = 'signin' }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  // Initialize Neon Auth on component mount
  useEffect(() => {
    const initAuth = async () => {
      await neonAuth.initialize();
    };
    initAuth();
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      let result;
      
      if (mode === 'signin') {
        result = await neonAuth.signIn(email, password);
      } else {
        if (!name) {
          Alert.alert('Error', 'Please enter your name');
          setLoading(false);
          return;
        }
        result = await neonAuth.signUp(email, password, name);
      }

      if (result.success) {
        // Update auth store for compatibility with existing system
        setAuth({
          jwt: 'direct-neon-auth',
          user: result.user
        });
        
        if (onSuccess) {
          onSuccess(result.user);
        }
      } else {
        Alert.alert('Error', result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    // Clear fields when switching modes
    setPassword('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === 'signin' ? 'Sign In' : 'Create Account'}
      </Text>
      
      {mode === 'signup' && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.switchMode}
        onPress={toggleMode}
        disabled={loading}
      >
        <Text style={styles.switchModeText}>
          {mode === 'signin' 
            ? "Don't have an account? Sign Up" 
            : "Already have an account? Sign In"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchMode: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchModeText: {
    color: '#007BFF',
    fontSize: 14,
  },
});

export default NeonAuthForm;