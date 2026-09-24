const path = require('path');
const dotenv = require('dotenv');

// Load backend/.env (works no matter where the process is started from)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const toInt = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
  port: toInt(process.env.PORT, 5000),
  // public site url; leave empty in production to auto-detect from the request
  appUrl: (process.env.APP_URL || '').replace(/\/+$/, ''),
  autoMigrate: String(process.env.AUTO_MIGRATE || 'true').toLowerCase() !== 'false',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: toInt(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'goedu',
    connectionLimit: toInt(process.env.DB_CONNECTION_LIMIT, 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'goedu-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  },

  sslcommerz: {
    storeId: process.env.SSLCOMMERZ_STORE_ID || '',
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || '',
    sandbox: String(process.env.SSLCOMMERZ_SANDBOX || 'true').toLowerCase() !== 'false',
    get enabled() { return !!(this.storeId && this.storePassword); },
  },

  chat: {
    limit: toInt(process.env.CHAT_LIMIT, 10),
    windowMinutes: toInt(process.env.CHAT_WINDOW_MINUTES, 30),
  },
};

module.exports = env;
