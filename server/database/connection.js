const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Gobikhamysql2005',
    database: process.env.DB_NAME || 'blood_donor_connect',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL database:', dbConfig.database);
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('📝 Database setup instructions:');
        console.log('1. Make sure MySQL is running');
        console.log('2. Create database: CREATE DATABASE blood_donor_connect;');
        console.log('3. Run the schema.sql file to create tables and sample data');
        console.log('4. Update database credentials in .env file if needed');
    }
};

// Initialize connection test
testConnection();

module.exports = pool;