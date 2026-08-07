require('dotenv').config();
const mysql = require('mysql2/promise');

async function initLogDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USERNAME || 'root';
  const password = process.env.DB_PASSWORD || 'password';
  const dbName = process.env.DB_LOG_DATABASE || 'absenteeism_logs';

  console.log(`Connecting to MySQL server at ${host}:${port}...`);
  try {
    const connection = await mysql.createConnection({ host, port, user, password });

    console.log(`Creating database '${dbName}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.query(`USE \`${dbName}\`;`);

    console.log(`Creating 'activity_logs' table in '${dbName}'...`);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`activity_logs\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`eventName\` VARCHAR(255) NOT NULL,
        \`serviceName\` VARCHAR(255) NOT NULL,
        \`payload\` TEXT NULL,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log(`Successfully initialized logging database '${dbName}' and table 'activity_logs'!`);
    await connection.end();
  } catch (err) {
    console.error('Failed to initialize logging database:', err.message);
  }
}

initLogDatabase();
