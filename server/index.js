// THESE ARE NODE APIs WE WISH TO USE
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

// CREATE OUR SERVER
dotenv.config()
const PORT = process.env.PORT || 4000;
const app = express()

// SETUP THE MIDDLEWARE
// CORS must be FIRST to handle preflight OPTIONS requests
app.use(cors({
    // Reflect the request Origin (required when credentials: true)
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}))
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


