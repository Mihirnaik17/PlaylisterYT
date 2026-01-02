const mongoose = require('mongoose');
const Playlist = require('./models/playlist-model');
const Song = require('./models/song-model');
require('dotenv').config(); // Load .env file


const connectDB = async () => {
    try {
        const dbUri = process.env.DB_CONNECT || 'mongodb://127.0.0.1:27017/playlister';
        await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const extractAndImportSongs = async () => {
    try {
        await connectDB();

        await Song.deleteMany({});
        console.log('Cleared existing songs');

        const playlists = await Playlist.find({});
        console.log(`Found ${playlists.length} playlists`);

        const songMap = new Map();

        for (const playlist of playlists) {
            for (const song of playlist.songs) {
                const key = `${song.title.toLowerCase()}-${song.artist.toLowerCase()}-${song.year}`;
                
                if (!songMap.has(key)) {
                    songMap.set(key, {
                        title: song.title,
                        artist: song.artist,
                        year: song.year,
                        youTubeId: song.youTubeId,
                        ownerEmail: playlist.ownerEmail,
                        ownerUsername: playlist.ownerUsername,
                        listens: 0,
                        playlists: [playlist._id]
                    });
                } else {
                    const existingSong = songMap.get(key);
                    if (!existingSong.playlists.includes(playlist._id)) {
                        existingSong.playlists.push(playlist._id);
                    }
                }
            }
        }

        console.log(`Found ${songMap.size} unique songs`);

        let songCount = 0;
        for (const [key, songData] of songMap) {
            try {
                await Song.create(songData);
                songCount++;
                if (songCount % 100 === 0) {
                    console.log(`Imported ${songCount} songs...`);
                }
            } catch (err) {
                console.error(`Failed to create song: ${songData.title} - ${err.message}`);
            }
        }

        console.log(`\nSong import completed!`);
        console.log(`Total unique songs imported: ${songCount}`);

        process.exit(0);
    } catch (error) {
        console.error('Import error:', error);
        process.exit(1);
    }
};

extractAndImportSongs();