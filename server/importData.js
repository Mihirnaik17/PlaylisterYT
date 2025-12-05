const mongoose = require('mongoose');
const User = require('./models/user-model');
const Playlist = require('./models/playlist-model');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/playlister', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectDB();

        await User.deleteMany({});
        await Playlist.deleteMany({});
        console.log('Cleared existing data');

        const dataPath = path.join(__dirname, '../PlaylisterData/public/data/PlaylisterData.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(rawData);

        const defaultPassword = await bcrypt.hash('password123', 10);

        const userMap = new Map();

        for (const userData of data.users) {
            const nameParts = userData.name.split(/(?=[A-Z])/);
            const firstName = nameParts.slice(0, -1).join('') || userData.name;
            const lastName = nameParts[nameParts.length - 1] || userData.name;

            const user = await User.create({
                firstName: firstName,
                lastName: lastName,
                username: userData.name,
                email: userData.email,
                passwordHash: defaultPassword,
                playlists: []
            });
            userMap.set(userData.email, user);
            console.log(`Created user: ${userData.name}`);
        }

        let playlistCount = 0;

        for (const playlistData of data.playlists) {

            const ownerEmail = playlistData.ownerEmail;

            const owner = userMap.get(ownerEmail);

            if (!owner) {
                console.log(`Skipping playlist "${playlistData.name}" - owner not found: ${ownerEmail}`);
                continue;
            }

            const playlist = await Playlist.create({
                name: playlistData.name,
                ownerEmail: owner.email,
                ownerUsername: owner.username,
                songs: playlistData.songs || [],
                published: true,
                likes: Math.floor(Math.random() * 500),
                Dislikes: Math.floor(Math.random() * 100),
                listens: Math.floor(Math.random() * 2000),
                comments: []
            });

            owner.playlists.push(playlist._id);

             await owner.save();

            playlistCount++;
            console.log(`Creatd playlist ${playlistCount}: ${playlistData.name} for ${owner.username}`);
        }

        console.log('\n Data import completed successfully!');
        console.log(` Imported ${userMap.size} users and ${playlistCount} playlists`);
        console.log(' Default password for all users: password123');

        process.exit(0);
    } catch (error) {
        console.error('X Import error:', error);
        process.exit(1);
    }
};

importData();