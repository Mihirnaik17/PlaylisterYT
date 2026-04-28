const express = require('express')
const router = express.Router()
const auth = require('../auth')
const SongController = require('../controllers/song-controller')

// Public routes (no auth required)
router.get('/songs', SongController.getAllSongs)
router.get('/songs/lookup', SongController.lookupSong)
router.get('/song/:id', SongController.getSongById)

// Protected routes (auth required)
router.post('/song', auth.verify, SongController.createSong)
router.put('/song/:id', auth.verify, SongController.updateSong)
router.delete('/song/:id', auth.verify, SongController.deleteSong)
router.get('/songs/user', auth.verify, SongController.getUserSongs)
router.post('/song/:id/like', auth.verify, SongController.likeSong)

module.exports = router