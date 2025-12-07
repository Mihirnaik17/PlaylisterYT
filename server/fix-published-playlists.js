const mongoose = require('mongoose');
const Playlist = require('./models/playlist-model');

async function updatePlaylists() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/playlister', {
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