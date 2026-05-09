const express = require('express');
const { recommendSongs } = require('../controllers/ai-controller');
const auth = require('../auth');

const router = express.Router();

router.post('/ai/recommend-songs', auth.verify, recommendSongs);

module.exports = router;
