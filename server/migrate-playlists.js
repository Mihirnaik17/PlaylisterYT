const mongoose = require('mongoose');
const Playlist = require('./models/playlist-model');
require('dotenv').config();

async function migratePlaylists() {
    await mongoose.connect(process.env.DB_CONNECT);
    
    // Add likedBy and dislikedBy arrays
    await Playlist.updateMany(
        { likedBy: { $exists: false } },
        { $set: { likedBy: [], dislikedBy: [] } }
    );
    
    console.log('✅ Migration complete!');
    process.exit(0);
}

migratePlaylists();