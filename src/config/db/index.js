// This place is used to config database
const { Pool } = require('pg');
require('dotenv').config();

// Create a pg Pool instance for querying
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // For Neon serverless
    },
});

module.exports = pool; // Export pool for use in other files
