// THESE ARE NODE APIs WE WISH TO USE
const express = require('express')
const cors = require('cors')
const compression = require('compression')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const requestLogger = require('./middleware/request-logger')
const createRateLimiter = require('./middleware/rate-limit')

// CREATE OUR SERVER
dotenv.config()
const PORT = process.env.PORT || 4000;
const app = express()

// SETUP THE MIDDLEWARE
// CORS must be FIRST to handle preflight OPTIONS requests
const ALLOWED_ORIGIN = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({
    origin: (origin, cb) => {
        // Allow server-to-server calls (no Origin header) and the configured client origin
        if (!origin || origin === ALLOWED_ORIGIN) return cb(null, true);
        cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}))
app.set('trust proxy', 1)
app.use(requestLogger())
app.use(createRateLimiter())
app.use(compression())
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

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

// PUT THE SERVER IN LISTENING MODE
app.listen(PORT, () => console.log(`Playlister Server running on port ${PORT}`))

process.on('unhandledRejection', (reason) => {
    console.error('[unhandledRejection]', reason);
});


