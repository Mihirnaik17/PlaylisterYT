/*
    This is where we'll route all of the received http requests
    into controller response functions.
    
    @author McKilla Gorilla
*/
const express = require('express')
const StoreController = require('../controllers/store-controller')
const router = express.Router()
const auth = require('../auth')

router.post('/playlist', auth.verify, StoreController.createPlaylist)
router.delete('/playlist/:id', auth.verify, StoreController.deletePlaylist)
router.get('/playlist/:id', StoreController.getPlaylistById)
router.put('/playlist/:id', auth.verify, StoreController.updatePlaylist)
router.put('/playlist/:id/publish', auth.verify, StoreController.publishPlaylist)
router.put('/playlist/:id/like', auth.verify, StoreController.likePlaylist)
router.put('/playlist/:id/dislike', auth.verify, StoreController.dislikePlaylist)
router.post('/playlist/:id/comment', auth.verify, StoreController.addComment)
router.delete('/playlist/:id/comment/:commentIndex', auth.verify, StoreController.deleteComment)
router.put('/playlist/:id/listen', StoreController.incrementListens)

router.get('/playlists/published', StoreController.getPublishedPlaylists)
router.get('/playlists/search', auth.verify, StoreController.searchPlaylists)
router.get('/playlists/user/:username', auth.verify, StoreController.getPlaylistsByUsername)
router.get('/playlistpairs', auth.verify, StoreController.getPlaylistPairs)
router.get('/playlists', auth.verify, StoreController.getPlaylists)



module.exports = router