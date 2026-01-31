import * as SecureStore from 'expo-secure-store';

const NEON_CONNECTION_KEY = 'neon-db-connection-string';
const DEFAULT_CONNECTION_STRING = process.env.EXPO_PUBLIC_NEON_DATABASE_URL || '';

/**
 * Utility for managing Neon serverless database connection
 */
class NeonDatabase {
  constructor() {
    this.connectionString = DEFAULT_CONNECTION_STRING;
    this.isInitialized = false;
  }

  /**
   * Initialize the Neon database connection
   */
  async initialize() {
    try {
      // Try to get connection string from secure storage
      const storedConnection = await SecureStore.getItemAsync(NEON_CONNECTION_KEY);
      
      if (storedConnection) {
        this.connectionString = storedConnection;
      } else if (DEFAULT_CONNECTION_STRING) {
        // Use default from environment if available
        await this.setConnectionString(DEFAULT_CONNECTION_STRING);
      } else {
        throw new Error('Neon database connection string not found');
      }
      
      this.isInitialized = true;
      console.log('Neon database connection initialized');
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Neon database:', error);
      throw error;
    }
  }

  /**
   * Set the Neon database connection string
   */
  async setConnectionString(connectionString) {
    try {
      await SecureStore.setItemAsync(NEON_CONNECTION_KEY, connectionString);
      this.connectionString = connectionString;
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to store Neon connection string:', error);
      throw error;
    }
  }

  /**
   * Get the current connection string
   */
  getConnectionString() {
    return this.connectionString;
  }

  /**
   * Check if the database connection is initialized
   */
  isReady() {
    return this.isInitialized && !!this.connectionString;
  }
}

// Export singleton instance
export const neonDatabase = new NeonDatabase();
export default neonDatabase;