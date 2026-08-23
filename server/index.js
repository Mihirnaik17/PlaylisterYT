// THESE ARE NODE APIs WE WISH TO USE
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const requestLogger = require('./middleware/request-logger')
const createRateLimiter = require('./middleware/rate-limit')

// CREATE OUR SERVER
dotenv.config()
const PORT = process.env.PORT || 4000;

// Fail fast if the JWT secret is missing or an obvious placeholder — otherwise
// every session cookie ever issued could be forged by anyone who reads the docs.
const WEAK_SECRETS = new Set(['', 'dev-secret', 'replace-me', 'secret', 'changeme']);
if (!process.env.JWT_SECRET || WEAK_SECRETS.has(process.env.JWT_SECRET)) {
    console.error('FATAL: JWT_SECRET is missing or set to a known placeholder. Set a long random value.');
    process.exit(1);
}

const app = express()

// SETUP THE MIDDLEWARE
// CORS must be FIRST to handle preflight OPTIONS requests
// Support comma-separated origins: CLIENT_URL=https://foo.onrender.com,http://localhost:3000
const ALLOWED_ORIGINS = new Set(
    (process.env.CLIENT_URL || 'http://localhost:3000')
        .split(',')
        .map(o => o.trim().replace(/\/$/, ''))
);
app.use(cors({
    origin: (origin, cb) => {
        // Allow server-to-server calls (no Origin header) or any whitelisted origin.
        // Use cb(null, false) — not cb(new Error()) — so unmatched origins don't cause 500.
        if (!origin || ALLOWED_ORIGINS.has(origin)) return cb(null, true);
        cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}))
app.set('trust proxy', 1)
// Security headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.).
// The API serves JSON only, so the default CSP is disabled to avoid breaking nothing for no benefit.
app.use(helmet({ contentSecurityPolicy: false }))
app.use(requestLogger())
app.use(createRateLimiter())
app.use(compression())
// 1mb is ample for playlist payloads; 10mb invited memory-exhaustion abuse.
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

// Health check for load balancers (AWS ALB/ECS) and uptime monitors.
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }))

// SETUP OUR OWN ROUTERS AS MIDDLEWARE
const authRouter = require('./routes/auth-router')
app.use('/auth', authRouter)
const storeRouter = require('./routes/store-router')
app.use('/api', storeRouter)
const songRouter = require('./routes/song-router')
app.use('/api', songRouter)
const aiRouter = require('./routes/ai-router')
app.use('/api', aiRouter)

// INITIALIZE OUR DATABASE OBJECT
const db = require('./db')
//db.on('error', console.error.bind(console, 'Database connection error:'))
db.initialize()
    .then(() => {
        console.log('Database connection established successfully');
    })
    .catch(err => {
        console.error('Database connection error:', err);
        process.exit(1);
    }); 

// Global error handler — must have 4 params so Express treats it as error middleware.
// Returns JSON instead of the default HTML 500 page.
app.use((err, req, res, next) => {
    console.error('[error]', err.message || err);
    res.status(err.status || 500).json({
        success: false,
        errorMessage: err.message || 'Internal server error',
    });
});

// PUT THE SERVER IN LISTENING MODE
app.listen(PORT, () => console.log(`Playlister Server running on port ${PORT}`))

process.on('unhandledRejection', (reason) => {
    console.error('[unhandledRejection]', reason);
});


