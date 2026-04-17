const express = require('express');
const { recommendSongs } = require('../controllers/ai-controller');

const router = express.Router();

router.post('/ai/recommend-songs', recommendSongs);

module.exports = router;
