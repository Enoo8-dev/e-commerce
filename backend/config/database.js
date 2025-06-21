const mysql = require('mysql2/promise');

require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true, // Wait for connections to be available
    connectionLimit: 10, // Maximum number of connections to create at once
    queueLimit: 0, // No limit on the number of queued connection requests
});

// Export the pool to be used in other parts of the application es. DAO files

module.exports = pool;