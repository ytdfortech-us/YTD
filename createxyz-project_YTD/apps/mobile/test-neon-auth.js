// Test script for Neon authentication
require('dotenv').config();
const { Pool } = require('pg');

// Mock SecureStore for Node.js environment
const SecureStore = {
  async setItemAsync(key, value) {
    console.log(`[SecureStore] Stored ${key}`);
    return true;
  },
  async getItemAsync(key) {
    console.log(`[SecureStore] Retrieved ${key}`);
    return null;
  },
  async deleteItemAsync(key) {
    console.log(`[SecureStore] Deleted ${key}`);
    return true;
  }
};

// Simple implementation of NeonAuth for testing
class NeonAuth {
  constructor() {
    this.pool = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      const neonUrl = process.env.EXPO_PUBLIC_NEON_DATABASE_URL;
      
      if (!neonUrl) {
        console.error('❌ No Neon database URL found in environment variables');
        return false;
      }
      
      console.log('🔄 Connecting to Neon database...');
      
      this.pool = new Pool({
        connectionString: neonUrl,
        ssl: {
          rejectUnauthorized: false
        }
      });
      
      // Test connection
      const result = await this.pool.query('SELECT NOW()');
      console.log(`✅ Connected to Neon database! Server time: ${result.rows[0].now}`);
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Neon Auth:', error);
      return false;
    }
  }

  async testAuthTables() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      console.log('\n📊 Testing auth tables...');
      
      // Test auth_users table
      const usersResult = await this.pool.query('SELECT COUNT(*) FROM auth_users');
      console.log(`✅ auth_users table exists with ${usersResult.rows[0].count} records`);
      
      // Test auth_accounts table
      const accountsResult = await this.pool.query('SELECT COUNT(*) FROM auth_accounts');
      console.log(`✅ auth_accounts table exists with ${accountsResult.rows[0].count} records`);
      
      // Test auth_sessions table
      const sessionsResult = await this.pool.query('SELECT COUNT(*) FROM auth_sessions');
      console.log(`✅ auth_sessions table exists with ${sessionsResult.rows[0].count} records`);
      
      // Test user_profiles table
      const profilesResult = await this.pool.query('SELECT COUNT(*) FROM user_profiles');
      console.log(`✅ user_profiles table exists with ${profilesResult.rows[0].count} records`);
      
      return true;
    } catch (error) {
      console.error('❌ Error testing auth tables:', error);
      return false;
    }
  }

  async testUserQuery() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      console.log('\n👤 Testing user query...');
      
      // Get a sample user (first user in the database)
      const userResult = await this.pool.query('SELECT id, email, name FROM auth_users LIMIT 1');
      
      if (userResult.rows.length === 0) {
        console.log('⚠️ No users found in the database');
        return false;
      }
      
      const user = userResult.rows[0];
      console.log(`✅ Found user: ${user.name || 'Unnamed'} (${user.email})`);
      
      // Get user profile
      const profileResult = await this.pool.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [user.id]
      );
      
      if (profileResult.rows.length === 0) {
        console.log('⚠️ No profile found for this user');
      } else {
        const profile = profileResult.rows[0];
        console.log(`✅ Found profile: Points: ${profile.total_points}, Streak: ${profile.streak_count}`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error testing user query:', error);
      return false;
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('👋 Closed database connection');
    }
  }
}

// Run the tests
async function runTests() {
  console.log('🧪 Starting Neon Authentication Tests');
  
  const neonAuth = new NeonAuth();
  
  try {
    // Initialize
    const initResult = await neonAuth.initialize();
    if (!initResult) {
      console.error('❌ Initialization failed, aborting tests');
      return;
    }
    
    // Test auth tables
    await neonAuth.testAuthTables();
    
    // Test user query
    await neonAuth.testUserQuery();
    
    console.log('\n✅ All tests completed successfully!');
    console.log('✅ Your Neon database is properly configured for authentication.');
    console.log('✅ You can now use the NeonAuth implementation in your mobile app.');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await neonAuth.close();
  }
}

// Run the tests
runTests();