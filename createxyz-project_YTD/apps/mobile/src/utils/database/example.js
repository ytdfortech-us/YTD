import { initializeDatabase, databaseClient, neonDatabase, isNeonDatabaseReady } from './index';

/**
 * Example of how to initialize and use the Neon database integration
 */
export const setupNeonDatabase = async () => {
  try {
    // Initialize with API key and optional Neon connection string
    await initializeDatabase(
      EXPO_PUBLIC_API_KEY, 
      EXPO_PUBLIC_NEON_DATABASE_URL
    );
    
    console.log('Database initialized successfully');
    
    // Check if Neon direct connection is available
    const isNeonReady = await isNeonDatabaseReady();
    console.log('Neon direct connection available:', isNeonReady);
    
    // You can now use the database client for API requests
    const userProfile = await databaseClient.getUserProfile('user-id');
    console.log('User profile:', userProfile);
    
    return true;
  } catch (error) {
    console.error('Failed to set up database:', error);
    return false;
  }
};

/**
 * Example of how to use the database in a component
 */
// In your component:
// 
// import { useEffect } from 'react';
// import { setupNeonDatabase } from '../utils/database/example';
// 
// export default function MyComponent() {
//   useEffect(() => {
//     // Initialize database when component mounts
//     setupNeonDatabase();
//   }, []);
//   
//   // Rest of your component...
// }