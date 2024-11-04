// backend/config/database.js
const mysql = require("mysql2/promise");
require("dotenv").config();

function parseDatabaseUrl(url) {
  // Essaie d'abord le format avec mot de passe
  let match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

  if (match) {
    return {
      user: match[1],
      password: match[2],
      host: match[3],
      port: parseInt(match[4]),
      database: match[5],
    };
  }

  // Essaie le format sans mot de passe
  match = url.match(/mysql:\/\/([^@]+)@([^:]+):(\d+)\/(.+)/);

  if (match) {
    return {
      user: match[1],
      password: "", // mot de passe vide
      host: match[2],
      port: parseInt(match[3]),
      database: match[4],
    };
  }

  throw new Error(
    "Format DATABASE_URL invalide. Format attendu: mysql://user:password@host:port/database ou mysql://user@host:port/database"
  );
}

const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);

const pool = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
