const express = require('express')
const router = express.Router()
const auth = require('../auth')
const AuthController = require('../controllers/auth-controller')
const { createAuthRateLimiter } = require('../middleware/rate-limit')

// Strict rate limit on credential endpoints to block brute-force attempts.
const authLimiter = createAuthRateLimiter()

router.post('/register', authLimiter, AuthController.registerUser)
router.post('/login', authLimiter, AuthController.loginUser)
router.get('/logout', AuthController.logoutUser)
router.get('/loggedIn', AuthController.getLoggedIn)
router.put('/edit', auth.verify, AuthController.editUser)

module.exports = router
