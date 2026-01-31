import * as SecureStore from 'expo-secure-store';
import { Pool } from '@neondatabase/serverless';
import { authKey } from './store';

// Keys for storing credentials
const NEON_USER_ID_KEY = 'neon-user-id';
const NEON_EMAIL_KEY = 'neon-user-email';

/**
 * NeonAuth provides direct authentication with the Neon database
 * This allows the mobile app to authenticate without going through the web backend
 */
class NeonAuth {
  constructor() {
    this.pool = null;
    this.isInitialized = false;
    this.userId = null;
    this.userEmail = null;
  }

  /**
   * Initialize the Neon database connection
   */
  async initialize() {
    try {
      const neonUrl = process.env.EXPO_PUBLIC_NEON_DATABASE_URL;
      
      if (!neonUrl) {
        console.error('No Neon database URL found in environment variables');
        return false;
      }
      
      this.pool = new Pool({
        connectionString: neonUrl,
        ssl: {
          rejectUnauthorized: false
        }
      });
      
      // Test connection
      await this.pool.query('SELECT NOW()');
      
      // Try to restore user session
      await this.restoreSession();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Neon Auth:', error);
      return false;
    }
  }

  /**
   * Restore user session from secure storage
   */
  async restoreSession() {
    try {
      const userId = await SecureStore.getItemAsync(NEON_USER_ID_KEY);
      const userEmail = await SecureStore.getItemAsync(NEON_EMAIL_KEY);
      
      if (userId && userEmail) {
        this.userId = userId;
        this.userEmail = userEmail;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to restore session:', error);
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.userId && !!this.userEmail;
  }

  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    if (!this.isInitialized || !this.pool) {
      await this.initialize();
    }
    
    try {
      // Get user by email
      const userResult = await this.pool.query(
        'SELECT * FROM auth_users WHERE email = $1',
        [email]
      );
      
      if (userResult.rows.length === 0) {
        return { success: false, error: 'User not found' };
      }
      
      const userData = userResult.rows[0];
      
      // Get account with password
      const accountResult = await this.pool.query(
        'SELECT * FROM auth_accounts WHERE "userId" = $1 AND provider = $2',
        [userData.id, 'credentials']
      );
      
      if (accountResult.rows.length === 0) {
        return { success: false, error: 'Invalid credentials' };
      }
      
      const accountData = accountResult.rows[0];
      
      // Verify password (in a real app, use bcrypt or similar)
      // For demo purposes, we're doing a simple check
      // In production, you should use a proper password verification
      if (accountData.password !== password) {
        return { success: false, error: 'Invalid credentials' };
      }
      
      // Store user data
      this.userId = userData.id;
      this.userEmail = userData.email;
      
      // Save to secure storage
      await SecureStore.setItemAsync(NEON_USER_ID_KEY, userData.id);
      await SecureStore.setItemAsync(NEON_EMAIL_KEY, userData.email);
      
      // Create auth object for compatibility with existing auth system
      const authData = {
        jwt: 'direct-neon-auth', // Placeholder for compatibility
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name
        }
      };
      
      // Store in auth store for compatibility
      await SecureStore.setItemAsync(authKey, JSON.stringify(authData));
      
      return { 
        success: true, 
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name
        }
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email, password, name) {
    if (!this.isInitialized || !this.pool) {
      await this.initialize();
    }
    
    try {
      // Check if user already exists
      const existingUser = await this.pool.query(
        'SELECT * FROM auth_users WHERE email = $1',
        [email]
      );
      
      if (existingUser.rows.length > 0) {
        return { success: false, error: 'User already exists' };
      }
      
      // Start transaction
      await this.pool.query('BEGIN');
      
      // Create user
      const userResult = await this.pool.query(
        'INSERT INTO auth_users (name, email) VALUES ($1, $2) RETURNING id, name, email',
        [name, email]
      );
      
      const userData = userResult.rows[0];
      
      // Create account with password
      await this.pool.query(
        'INSERT INTO auth_accounts ("userId", provider, type, "providerAccountId", password) VALUES ($1, $2, $3, $4, $5)',
        [userData.id, 'credentials', 'credentials', userData.id, password]
      );
      
      // Create user profile
      await this.pool.query(
        'INSERT INTO user_profiles (user_id, name) VALUES ($1, $2)',
        [userData.id, name]
      );
      
      // Commit transaction
      await this.pool.query('COMMIT');
      
      // Store user data
      this.userId = userData.id;
      this.userEmail = userData.email;
      
      // Save to secure storage
      await SecureStore.setItemAsync(NEON_USER_ID_KEY, userData.id);
      await SecureStore.setItemAsync(NEON_EMAIL_KEY, userData.email);
      
      // Create auth object for compatibility with existing auth system
      const authData = {
        jwt: 'direct-neon-auth', // Placeholder for compatibility
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name
        }
      };
      
      // Store in auth store for compatibility
      await SecureStore.setItemAsync(authKey, JSON.stringify(authData));
      
      return { 
        success: true, 
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name
        }
      };
    } catch (error) {
      // Rollback transaction on error
      await this.pool.query('ROLLBACK');
      console.error('Sign up error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      this.userId = null;
      this.userEmail = null;
      
      // Clear secure storage
      await SecureStore.deleteItemAsync(NEON_USER_ID_KEY);
      await SecureStore.deleteItemAsync(NEON_EMAIL_KEY);
      await SecureStore.deleteItemAsync(authKey);
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: 'Sign out failed' };
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile() {
    if (!this.isAuthenticated()) {
      return { success: false, error: 'Not authenticated' };
    }
    
    try {
      const result = await this.pool.query(
        `SELECT 
          up.id,
          up.user_id,
          up.name,
          up.quick_dial_number,
          up.preferences,
          up.streak_count,
          up.total_points,
          up.created_at,
          up.updated_at,
          au.email
        FROM user_profiles up
        JOIN auth_users au ON up.user_id = au.id
        WHERE up.user_id = $1`,
        [this.userId]
      );
      
      if (result.rows.length === 0) {
        return { success: false, error: 'Profile not found' };
      }
      
      return { success: true, profile: result.rows[0] };
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: 'Failed to get profile' };
    }
  }
}

// Create and export singleton instance
export const neonAuth = new NeonAuth();

export default neonAuth;