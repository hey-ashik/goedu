/* eslint-disable no-console */
const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');

/**
 * First-run setup for hosts without a terminal (Hostinger Node.js apps):
 * creates the database tables if they are missing and loads the catalogue
 * seed when the courses table is empty. Disable with AUTO_MIGRATE=false.
 */
async function prepareDatabase() {
  const migrate = require('../database/migrate');
  await migrate();
  const [{ n }] = await db.query('SELECT COUNT(*) AS n FROM courses');
  if (Number(n) === 0) {
    console.log('[setup] empty catalogue detected - loading seed data (this runs once)...');
    const seed = require('../database/seed/seed');
    await seed();
  }
  // mentor flags follow seed/data/instructors.json even on an already seeded database
  try { await require('../database/seed/syncMentors')(); } catch (err) { console.error('[setup] mentor sync skipped:', err.message); }
}

async function start() {
  if (env.missingDbVars.length) {
    console.error('[config] MISSING database settings: ' + env.missingDbVars.join(', ') + ' -> using defaults (' + env.db.user + '@' + env.db.host + '/' + env.db.database + '). Set them in the hosting panel environment variables or a .env file.');
  }
  try {
    if (env.autoMigrate) await prepareDatabase(); // creates the database + tables when missing
    await db.ping();
    console.log(`[db] connected to MySQL ${env.db.host}:${env.db.port}/${env.db.database}`);
  } catch (err) {
    console.error('[db] setup failed:', err.message);
    console.error('      -> check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (backend/.env or the hosting panel env vars)');
  }
  app.listen(env.port, () => {
    console.log(`[server] GoEdu listening on http://localhost:${env.port} (${env.nodeEnv})`);
    console.log(`[payments] SSLCommerz ${env.sslcommerz.enabled ? (env.sslcommerz.sandbox ? 'SANDBOX' : 'LIVE') : 'not configured -> direct enrolment mode'}`);
  });
}

process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err));
start();
