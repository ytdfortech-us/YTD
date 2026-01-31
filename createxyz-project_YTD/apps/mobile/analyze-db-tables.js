// Script to analyze Neon database tables
require('dotenv').config();

const { Pool } = require('pg');

// Get database connection string from environment variables
const neonUrl = process.env.EXPO_PUBLIC_NEON_DATABASE_URL;

if (!neonUrl) {
  console.error('❌ No database URL found in environment variables.');
  process.exit(1);
}

// Create a connection pool
const pool = new Pool({
  connectionString: neonUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

// Query to get all tables
const listTablesQuery = `
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public'
  ORDER BY table_name;
`;

// Query to get table structure
const tableStructureQuery = `
  SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
  FROM 
    information_schema.columns 
  WHERE 
    table_schema = 'public' 
    AND table_name = $1
  ORDER BY 
    ordinal_position;
`;

// Main function to analyze database
async function analyzeTables() {
  try {
    console.log('Connecting to Neon database...');
    
    // Get list of tables
    const tablesResult = await pool.query(listTablesQuery);
    const tables = tablesResult.rows.map(row => row.table_name);
    
    console.log(`\n📊 Found ${tables.length} tables in the database:\n`);
    console.log(tables.join(', '));
    
    // Check for authentication-related tables
    const authTables = tables.filter(table => 
      table.includes('user') || 
      table.includes('auth') || 
      table.includes('account') ||
      table.includes('session') ||
      table.includes('token') ||
      table.includes('profile')
    );
    
    console.log(`\n🔐 Authentication-related tables (${authTables.length}):\n`);
    console.log(authTables.join(', '));
    
    // Analyze each auth-related table
    console.log('\n📋 Table structures:');
    for (const table of authTables) {
      const structureResult = await pool.query(tableStructureQuery, [table]);
      console.log(`\n📝 ${table}:`);
      
      structureResult.rows.forEach(column => {
        console.log(`  - ${column.column_name} (${column.data_type})${column.is_nullable === 'YES' ? ' NULL' : ' NOT NULL'}${column.column_default ? ` DEFAULT ${column.column_default}` : ''}`);
      });
    }
    
    console.log('\n✅ Database analysis complete!');
  } catch (error) {
    console.error('❌ Error analyzing database:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the analysis
analyzeTables();