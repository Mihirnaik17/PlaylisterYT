const Song = require('../models/song-model');
const Playlist = require('../models/playlist-model');
const auth = require('../auth');





getAllSongs = async (req, res) => {
    try {
        const { title, artist, year, sortBy, sortOrder, limit = 100, skip = 0 } = req.query;

        let query = {};
        if (title) {
            query.title = { $regex: title, $options: 'i' }; 
        }
        if (artist) {
            query.artist = { $regex: artist, $options: 'i' };
        }
        if (year) {
            query.year = parseInt(year);
        }
        let sort = {};
        if (sortBy) {
            const order = sortOrder === 'asc' ? 1 : -1;
            
            if (sortBy === 'listens') {
                sort.listens = order;
            } else if (sortBy === 'playlists') {
                // handled separately below
            } else if (sortBy === 'title') {
                sort.title = order;
            } else if (sortBy === 'artist') {
                sort.artist = order;
            } else if (sortBy === 'year') {
                sort.year = order;
            }
        } else {
            sort.createdAt = -1;
        }

        let songs;
        const limitNum = parseInt(limit);
        const skipNum = parseInt(skip);
        
        if (sortBy === 'playlists') {
            songs = await Song.aggregate([
                { $match: query },
                { $addFields: { playlistCount: { $size: '$playlists' } } },
                { $sort: { playlistCount: sortOrder === 'asc' ? 1 : -1 } },
                { $skip: skipNum },
                { $limit: limitNum }
            ]);
        } else {
            songs = await Song.find(query).sort(sort).skip(skipNum).limit(limitNum);
        }

        const total = await Song.countDocuments(query);

        return res.status(200).json({
            success: true,
            songs: songs,
            total: total,
            hasMore: skipNum + songs.length < total
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            errorMessage: 'Failed to retrieve songs'
        });
    }
};

getSongById = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        
        if (!song) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Song not found'
            });
        }

        return res.status(200).json({
            success: true,
            song: song
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            errorMessage: 'Failed to retrieve song'
        });
    }
};

createSong = async (req, res) => {
    try {
        const { title, artist, year, youTubeId } = req.body;

        if (!title || !artist || !year || !youTubeId) {
            return res.status(400).json({
                success: false,
                errorMessage: 'All fields are required'
            });
        }

        const userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                errorMessage: 'Unauthorized'
            });
        }

        const existingSong = await Song.findOne({ title, artist, year });
        if (existingSong) {
            return res.status(400).json({
                success: false,
                errorMessage: 'A song with this title, artist, and year already exists'
            });
        }

        const User = require('../models/user-model');
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                errorMessage: 'User not found'
            });
        }

        const newSong = new Song({
            title,
            artist,
            year,
            youTubeId,
            ownerEmail: user.email,
            ownerUsername: user.username
        });

        const savedSong = await newSong.save();

        return res.status(201).json({
            success: true,
            song: savedSong
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            errorMessage: 'Failed to create song'
        });
    }
};


updateSong = async (req, res) => {
    try {
        const { title, artist, year, youTubeId } = req.body;
        const userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                errorMessage: 'Unauthorized'
            });
        }

        const User = require('../models/user-model');
        const user = await User.findById(userId);

        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Song not found'
            });
        }
        if (song.ownerEmail !== user.email) {
            return res.status(403).json({
                success: false,
                errorMessage: 'You can only edit songs you created'
            });
        }
        if (title !== song.title || artist !== song.artist || year !== song.year) {
            const duplicate = await Song.findOne({ 
                title, 
                artist, 
                year,
                _id: { $ne: req.params.id } 
            });
            
            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    errorMessage: 'A song with this title, artist, and year already exists'
                });
            }
        }

        // here it will update the songs
        song.title = title || song.title;
        song.artist = artist || song.artist;
        song.year = year || song.year;
        song.youTubeId = youTubeId || song.youTubeId;

        const updatedSong = await song.save();
        await Playlist.updateMany(
            { 'songs._id': song._id },
            { 
                $set: { 
                    'songs.$[elem].title': updatedSong.title,
                    'songs.$[elem].artist': updatedSong.artist,
                    'songs.$[elem].year': updatedSong.year,
                    'songs.$[elem].youTubeId': updatedSong.youTubeId
                }
            },
            { 
                arrayFilters: [{ 'elem._id': song._id }]
            }
        );

        return res.status(200).json({
            success: true,
            song: updatedSong
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            errorMessage: 'Failed to update song'
        });
    }
};

deleteSong = async (req, res) => {
    try {
        const userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                errorMessage: 'Unauthorized'
            });
        }

        const User = require('../models/user-model');
        const user = await User.findById(userId);

        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Song not found'
            });
        }
        if (song.ownerEmail !== user.email) {
            return res.status(403).json({
                success: false,
                errorMessage: 'You can only delete songs you created'
            });
        }
        await Playlist.updateMany(
            { 'songs._id': song._id },
            { $pull: { songs: { _id: song._id } } }
        );
        await Song.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: 'Song deleted successfully'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            errorMessage: 'Failed to delete song'
        });
    }
};

// Get all songs created
// by the loged-in user
getUserSongs = async (req, res) => {
    try {

        const userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                errorMessage: 'Unauthorized'
            });
        }

        const User =require('../models/user-model');

        const user = await User.findById(userId);

        const songs = await Song.find({ ownerEmail: user.email }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            songs: songs
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            errorMessage: 'Failed to retrieve user songs'
        });
    }
};

module.exports = {
    getAllSongs,
    getSongById,
    createSong,
    updateSong,
    deleteSong,
    getUserSongs
};