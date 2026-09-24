const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const guestId = require('./middleware/guestId');
const { optionalAuth } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: false, // SPA loads fonts/images from a few CDNs
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());
app.use(morgan(env.isProd ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, cb) => {
      // same-origin requests, configured origins and the public APP_URL are always allowed
      if (!origin || env.corsOrigins.includes(origin) || env.corsOrigins.includes('*') || (env.appUrl && origin === env.appUrl)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(guestId);
app.use(optionalAuth);

// generic API abuse protection (the chatbot has its own per-user quota)
app.use(
  '/api',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 600, standardHeaders: true, legacyHeaders: false })
);

app.get('/api/health', async (_req, res) => {
  let database = 'ok';
  try { await require('./config/db').ping(); } catch (err) { database = 'error: ' + err.message; }
  const hint = env.missingDbVars.length
    ? 'Database environment variables are not set on the server: ' + env.missingDbVars.join(', ') + '. Add them in the hosting panel (Node.js app -> Environment variables) or in a .env file, then restart/redeploy.'
    : undefined;
  res.json({ success: true, status: 'ok', database, db_host: env.db.host, db_user: env.db.user, db_name: env.db.database, hint, time: new Date().toISOString() });
});
app.use('/api/v1', routes);
app.use('/api', notFound);

// ---- Serve the built frontend (frontend/dist) in production ----
const distDir = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(distDir, { maxAge: env.isProd ? '7d' : 0, index: false }));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) res.status(200).send('<h1>GoEdu API is running</h1><p>Build the frontend with <code>npm run build</code>.</p>');
  });
});

app.use(errorHandler);

module.exports = app;
