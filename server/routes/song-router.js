const express = require('express')
const router = express.Router()
const auth = require('../auth')
const SongController = require('../controllers/song-controller')

// Public routes (no auth required)
router.get('/songs', SongController.getAllSongs)
router.get('/song/:id', SongController.getSongById)

// Protected routes (auth required)
router.post('/song', auth.verify, SongController.createSong)
router.put('/song/:id', auth.verify, SongController.updateSong)
router.delete('/song/:id', auth.verify, SongController.deleteSong)
router.get('/songs/user', auth.verify, SongController.getUserSongs)

module.exports = router