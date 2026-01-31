import databaseClient from './client';
import neonDatabase from './neon';

// Re-export the database client and add convenience methods
export { databaseClient, neonDatabase };

// Convenience hooks for React components
export const useDatabase = () => {
  return databaseClient;
};

/**
 * Helper function to initialize database with API key and optional Neon connection
 * @param {string} apiKey - API key for web backend authentication
 * @param {string} neonConnectionString - Optional direct Neon database connection string
 */
export const initializeDatabase = async (apiKey, neonConnectionString = null) => {
  try {
    // Initialize API client for web backend
    await databaseClient.setApiKey(apiKey);
    
    // If Neon connection string is provided, initialize direct connection
    if (neonConnectionString) {
      await neonDatabase.setConnectionString(neonConnectionString);
    } else if (process.env.EXPO_PUBLIC_NEON_DATABASE_URL) {
      // Try to initialize with environment variable if available
      await neonDatabase.initialize();
    }
    
    console.log('Database client initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Helper function to check if database is ready
export const isDatabaseReady = async () => {
  try {
    await databaseClient.initialize();
    return true;
  } catch (error) {
    return false;
  }
};

// Helper function to check if Neon direct connection is available
export const isNeonDatabaseReady = async () => {
  try {
    await neonDatabase.initialize();
    return neonDatabase.isReady();
  } catch (error) {
    return false;
  }
};

export default databaseClient;


