/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../src/config/env');

/**
 * Creates the database (if missing) and every table from schema.sql.
 * Safe to run repeatedly (all statements are CREATE TABLE IF NOT EXISTS).
 */
async function migrate() {
  const base = { host: env.db.host, port: env.db.port, user: env.db.user, password: env.db.password, multipleStatements: true };
  const server = await mysql.createConnection(base);
  await server.query('CREATE DATABASE IF NOT EXISTS `' + env.db.database + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await server.end();

  const conn = await mysql.createConnection({ ...base, database: env.db.database });
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await conn.query(sql);
  await conn.end();
  console.log('[migrate] database "' + env.db.database + '" is ready');
}

if (require.main === module) {
  migrate().catch((err) => {
    console.error('[migrate] failed:', err.message);
    process.exit(1);
  });
}

module.exports = migrate;
