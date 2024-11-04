// backend/src/config/initDb.js
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

// Constantes pour la validation
const DB_CONSTRAINTS = {
    MAX_EMAIL_LENGTH: 255,
    MAX_NAME_LENGTH: 255,
    MAX_CONTACT_LENGTH: 100,
    SUPPORTED_CURRENCIES: ['FXOF', 'EURO', 'DOLLAR'],
    RESERVATION_STATUSES: ['confirmed', 'pending', 'cancelled']
};

// Validation de l'environnement
function validateEnvironment() {
    console.log('Checking environment configuration...');
    
    const requiredEnvVars = {
        'DATABASE_URL': process.env.DATABASE_URL,
        'NODE_ENV': process.env.NODE_ENV,
        'PORT': process.env.PORT
    };

    const missingVars = Object.entries(requiredEnvVars)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}\n` +
            `Please check that your .env file exists and contains these variables.\n` +
            `Current working directory: ${process.cwd()}`);
    }
}

function parseDatabaseUrl(url) {
    if (!url) {
        throw new Error('DATABASE_URL is required');
    }

    const passwordPattern = /mysql:\/\/([^:]+)(?::([^@]+))?@([^:]+):(\d+)\/(.+)/;
    const match = url.match(passwordPattern);

    if (!match) {
        throw new Error(`Invalid DATABASE_URL format: ${url}\n` +
            'Expected format: mysql://user:password@host:port/database or mysql://user@host:port/database');
    }

    return {
        user: match[1],
        password: match[2] || '',
        host: match[3],
        port: parseInt(match[4]),
        database: match[5]
    };
}

async function testConnection(config) {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password
        });
        console.log('MySQL connection test successful');
        return connection;
    } catch (error) {
        console.error('MySQL connection test failed:', error.message);
        throw new Error(`Failed to connect to MySQL: ${error.message}`);
    }
}

async function createDatabase(connection, dbName) {
    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}
                              CHARACTER SET utf8mb4 
                              COLLATE utf8mb4_unicode_ci`);
        console.log(`Database ${dbName} created or verified successfully`);
        await connection.query(`USE ${dbName}`);
    } catch (error) {
        console.error('Error creating database:', error);
        throw error;
    }
}

async function createTables(connection) {
    // Table Users
    const createUsersTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(${DB_CONSTRAINTS.MAX_EMAIL_LENGTH}) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        username VARCHAR(${DB_CONSTRAINTS.MAX_NAME_LENGTH}) NOT NULL,
        photo  VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

    // Table Hotels
    const createHotelsTableSQL = `
    CREATE TABLE IF NOT EXISTS hotels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contactinfo VARCHAR(${DB_CONSTRAINTS.MAX_CONTACT_LENGTH}) UNIQUE NOT NULL,
        nom VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        prix DECIMAL(10, 2) NOT NULL,
        photo VARCHAR(255) NOT NULL,
        adresse VARCHAR(255) NOT NULL,
        email VARCHAR(${DB_CONSTRAINTS.MAX_EMAIL_LENGTH}) UNIQUE NOT NULL,
        devise ENUM(${DB_CONSTRAINTS.SUPPORTED_CURRENCIES.map(c => `'${c}'`).join(', ')}) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_prix (prix)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

    // Table Reservations
    const createReservationsTableSQL = `
    CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        hotel_id INT NOT NULL,
        date_reservation DATE NOT NULL,
        status ENUM(${DB_CONSTRAINTS.RESERVATION_STATUSES.map(s => `'${s}'`).join(', ')}) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
        INDEX idx_user_hotel (user_id, hotel_id),
        INDEX idx_date (date_reservation),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

    try {
        await connection.query(createUsersTableSQL);
        console.log('Table users created successfully!');

        await connection.query(createHotelsTableSQL);
        console.log('Table hotels created successfully!');

        await connection.query(createReservationsTableSQL);
        console.log('Table reservations created successfully!');
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    }
}

async function initializeDatabase() {
    let connection;
    try {
        console.log('Starting database initialization...');
        console.log('Current working directory:', process.cwd());
        console.log('Checking for .env file...');
        
        const envPath = path.join(process.cwd(), '.env');
        if (!fs.existsSync(envPath)) {
            throw new Error(`.env file not found at ${envPath}`);
        }

        validateEnvironment();
        
        console.log('Environment variables loaded successfully');
        console.log('DATABASE_URL:', process.env.DATABASE_URL);
        
        const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);
        
        // Établir la connexion initiale
        connection = await testConnection(dbConfig);
        
        // Créer et initialiser la base de données
        await createDatabase(connection, dbConfig.database);
        
        // Créer les tables
        await createTables(connection);
        
        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Database initialization failed:');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

// Exécuter l'initialisation si ce fichier est exécuté directement
if (require.main === module) {
    initializeDatabase();
}

module.exports = {
    initializeDatabase,
    DB_CONSTRAINTS
};