/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../src/config/env');

/**
 * Incremental changes for databases created by an older schema.sql.
 * Every entry is checked against information_schema first, so this is safe to
 * run on every boot (Hostinger Node.js apps have no terminal for migrations).
 */
const UPGRADES = [
  { table: 'chat_conversations', column: 'visitor_id', sql: 'ALTER TABLE chat_conversations ADD COLUMN visitor_id INT UNSIGNED DEFAULT NULL AFTER user_id' },
  { table: 'chat_conversations', column: 'message_count', sql: 'ALTER TABLE chat_conversations ADD COLUMN message_count INT UNSIGNED NOT NULL DEFAULT 0 AFTER title' },
  { table: 'chat_conversations', index: 'idx_cc_visitor', sql: 'ALTER TABLE chat_conversations ADD INDEX idx_cc_visitor (visitor_id, updated_at)' },
  { table: 'chat_conversations', index: 'idx_cc_user', sql: 'ALTER TABLE chat_conversations ADD INDEX idx_cc_user (user_id)' },
];

async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1',
    [table, column]
  );
  return rows.length > 0;
}

async function indexExists(conn, table, index) {
  const [rows] = await conn.query(
    'SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1',
    [table, index]
  );
  return rows.length > 0;
}

async function applyUpgrades(conn) {
  for (const u of UPGRADES) {
    const exists = u.column ? await columnExists(conn, u.table, u.column) : await indexExists(conn, u.table, u.index);
    if (exists) continue;
    await conn.query(u.sql);
    console.log('[migrate] applied: ' + u.sql);
  }
}

/**
 * Creates the database (when the MySQL user is allowed to) and every table
 * from schema.sql, then applies the incremental upgrades above.
 * Safe to run repeatedly (all statements are CREATE TABLE IF NOT EXISTS).
 *
 * Shared hosts (Hostinger) hand out a database that already exists and a user
 * without the global CREATE privilege - the CREATE DATABASE step is skipped there.
 */
async function migrate() {
  const base = { host: env.db.host, port: env.db.port, user: env.db.user, password: env.db.password, multipleStatements: true };

  try {
    const server = await mysql.createConnection(base);
    try {
      await server.query('CREATE DATABASE IF NOT EXISTS `' + env.db.database + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    } finally {
      await server.end();
    }
  } catch (err) {
    // ER_DBACCESS_DENIED_ERROR / ER_ACCESS_DENIED_ERROR: the database was created in the hosting panel
    if (!/denied/i.test(err.message)) throw err;
    console.log('[migrate] no CREATE DATABASE privilege - using the existing database "' + env.db.database + '"');
  }

  const conn = await mysql.createConnection({ ...base, database: env.db.database });
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await conn.query(sql);
    await applyUpgrades(conn);
  } finally {
    await conn.end();
  }
  console.log('[migrate] database "' + env.db.database + '" is ready');
}

if (require.main === module) {
  migrate().catch((err) => {
    console.error('[migrate] failed:', err.message);
    process.exit(1);
  });
}

module.exports = migrate;
