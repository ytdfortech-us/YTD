// Simple test script for Neon database connection
require('dotenv').config();

const neonUrl = process.env.EXPO_PUBLIC_NEON_DATABASE_URL;
const apiKey = process.env.EXPO_PUBLIC_API_KEY;

console.log('Testing Neon database connection...');
console.log(`Database URL available: ${!!neonUrl}`);
console.log(`API Key available: ${!!apiKey}`);

// If we have a database URL, attempt to connect
if (neonUrl) {
  console.log('Attempting to connect to Neon database...');
  
  // Simple connection test using pg
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: neonUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  // Test the connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Connection failed:', err.message);
    } else {
      console.log('✅ Connection successful!');
      console.log('Server time:', res.rows[0].now);
    }
    pool.end();
  });
} else {
  console.error('❌ No database URL found in environment variables.');
}