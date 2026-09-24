/* eslint-disable no-console */
const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');

async function start() {
  try {
    await db.ping();
    console.log(`[db] connected to MySQL ${env.db.host}:${env.db.port}/${env.db.database}`);
  } catch (err) {
    console.error('[db] connection failed:', err.message);
    console.error('      -> check backend/.env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) and run: npm run db:setup');
  }
  app.listen(env.port, () => {
    console.log(`[server] GoEdu API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

start();
