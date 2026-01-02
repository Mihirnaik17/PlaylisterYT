const mongoose = require('mongoose');
const Playlist = require('./models/playlist-model');
require('dotenv').config(); // Load .env file

async function updatePlaylists() {
    try {

        const dbUri = process.env.DB_CONNECT || 'mongodb://127.0.0.1:27017/playlister';
        await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');

        const result = await Playlist.updateMany(
            { published: false },
            { $set: { published: true } }
        );

        console.log(`✅ Updated ${result.modifiedCount} playlists to published: true`);
        
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

updatePlaylists();