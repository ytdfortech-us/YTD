// Test script for Neon database connection
import { setupNeonDatabase } from './example';

// Run the test
(async () => {
  console.log('Testing Neon database connection...');
  try {
    const result = await setupNeonDatabase();
    if (result) {
      console.log('✅ Database connection test successful!');
    } else {
      console.error('❌ Database connection test failed.');
    }
  } catch (error) {
    console.error('❌ Error testing database connection:', error);
  }
})();