const dbManager = require('../db');
const auth = require('../auth');
const Song = require('../models/song-model');
const Playlist = require('../models/playlist-model');

// Loads the authenticated user and confirms they own the playlist.
// Returns { user, playlist } on success, or sends the error response and returns null.
async function requireOwnership(req, res, playlistId) {
    const playlist = await dbManager.getPlaylistById(playlistId);
    if (!playlist) {
        res.status(404).json({ errorMessage: 'Playlist not found' });
        return null;
    }
    const user = await dbManager.getUserById(req.userId);
    if (!user) {
        res.status(401).json({ errorMessage: 'User not found' });
        return null;
    }
    if (playlist.ownerEmail !== user.email) {
        res.status(403).json({ errorMessage: "You don't have permission to modify this playlist" });
        return null;
    }
    return { user, playlist };
}

createPlaylist = async (req, res) => {
    try{
    // auth.verify middleware already validated the token and set req.userId
    const body = req.body;
    if (!body || !body.name) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Playlist with a name',
        })
    }

    const user = await dbManager.getUserById(req.userId);
    if (!user) {
        return res.status(404).json({
            errorMessage: 'User not found'
        })
    }

    // Whitelist client fields — never spread the raw body into the document,
    // otherwise a client could set likes/listens/published on creation.
    const playlistData = {
        name: body.name,
        songs: Array.isArray(body.songs) ? body.songs : [],
        ownerEmail: user.email,
        ownerUsername: user.username,
        published: false,
        likes: 0,
        dislikes: 0,
        likedBy: [],
        dislikedBy: [],
        listens: 0,
        comments: []
    };

    const playlist = await dbManager.createPlaylist(playlistData);

    await dbManager.addPlaylistToUser(req.userId, playlist.id || playlist._id);
        
    return res.status(201).json({
        playlist: playlist
    })
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({
            errorMessage: 'Playlist Not Created!',
            error: error.message
        })

    }
    
}
deletePlaylist = async (req, res) => {
    try {
        const owned = await requireOwnership(req, res, req.params.id);
        if (!owned) return;

        await dbManager.deletePlaylist(req.params.id);
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ errorMessage: 'Error deleting playlist' });
    }
}
getPlaylistById = async (req, res) => {
    try{
        // Route has no auth.verify middleware so req.userId may not be set yet.
        // Resolve it optionally so owners can access their own unpublished playlists.
        if (!req.userId) {
            req.userId = auth.verifyUser(req) || undefined;
        }

        const list = await dbManager.getPlaylistById(req.params.id);
        if (!list) {
            return res.status(404).json({ success: false, error: 'Playlist not found' });
        }
        
        if (list.published) {
            await dbManager.updatePlaylist(req.params.id, { lastAccessed: new Date() });
            return res.status(200).json({ success: true, playlist: list })
        }
        
        if (!req.userId) {
            return res.status(403).json({
                success: false,
                errorMessage: 'You must be logged in to view unpublished playlists'
            })
        }
        
        const user = await dbManager.getUserById(req.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                errorMessage: 'User not authenticated'
            })
        }
        
        
        if (list.ownerEmail === user.email) {
            await dbManager.updatePlaylist(req.params.id, { lastAccessed: new Date() });
            return res.status(200).json({ success: true, playlist: list })
        } else {
            return res.status(403).json({ 
                success: false, 
                errorMessage: "You don't have permission to view this unpublished playlist" 
            });
        }

    }
    catch (err) { 
        console.error(err); 
        return res.status(400).json({ success: false, error: err.message }); 
    }
}
getPlaylistPairs = async (req, res) => {
    try {
        const user = await dbManager.getUserById(req.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' })
        }
        
        const playlists = await dbManager.getPlaylistsByOwnerEmail(user.email);
        
        if (!playlists || playlists.length === 0) {
            return res.status(200).json({ success: true, idNamePairs: [] })
        }
        
        let pairs = [];
        for (let key in playlists) {
            let list = playlists[key];
            let pair = {
                _id: list.id || list._id,
                name: list.name,
                ownerEmail: list.ownerEmail,
                ownerUsername: list.ownerUsername,
                published: list.published,
                likes: list.likes || 0,
                dislikes: list.dislikes || 0,
                likedBy: list.likedBy || [],      
                dislikedBy: list.dislikedBy || [], 
                listens: list.listens || 0,
                comments: list.comments || [],
                songs: list.songs || [],
                lastAccessed: list.lastAccessed
            };
            pairs.push(pair);
        }
        return res.status(200).json({ success: true, idNamePairs: pairs })
        
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message })
    }
}
getPlaylists = async (req, res) => {
    try{
        // Only published playlists — returning everything leaked other users'
        // private (unpublished) playlists to any logged-in caller.
        const playlists = await Playlist.find({ published: true }).lean();

        return res.status(200).json({ success: true, data: playlists })

    }catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message })
    }
}
updatePlaylist = async (req, res) => {
    const body = req.body

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        })
    }

    try {
        const owned = await requireOwnership(req, res, req.params.id);
        if (!owned) return;

        const updateData = {
            name: body.name,
            songs: body.songs,
            lastAccessed: new Date()
        };

        const updatedPlaylist = await dbManager.updatePlaylist(req.params.id, updateData);

        return res.status(200).json({
            success: true,
            playlist: updatedPlaylist,
            message: 'Playlist updated!',
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message,
            message: 'Playlist not updated!',
        })
    }
}

publishPlaylist = async (req, res) => {
    try {
        const owned = await requireOwnership(req, res, req.params.id);
        if (!owned) return;

        const updateData = {
            published: req.body.published
        };
        
        if (req.body.published) {
            updateData.publishedDate = new Date();
        }

        await dbManager.updatePlaylist(req.params.id, updateData);
        
        return res.status(200).json({
            success: true,
            message: req.body.published ? 'Playlist published!' : 'Playlist unpublished!',
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            errorMessage: 'Error publishing playlist',
            error: error.message
        })
    }
}

likePlaylist = async (req, res) => {
    try {
        const playlist = await dbManager.getPlaylistById(req.params.id);

        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found'
            });
        }

        const user = await dbManager.getUserById(req.userId);
        const userEmail = user.email;

        const likedBy = Array.isArray(playlist.likedBy) ? playlist.likedBy : [];
        const dislikedBy = Array.isArray(playlist.dislikedBy) ? playlist.dislikedBy : [];


        let updateData = {};

        if (likedBy.includes(userEmail)) {
            updateData.likes = Math.max(0, (playlist.likes || 0) - 1);
            updateData.likedBy = likedBy.filter(email => email !== userEmail);

        } else {
            updateData.likes = (playlist.likes || 0) + 1;
            updateData.likedBy = [...likedBy, userEmail];

            if (dislikedBy.includes(userEmail)) {
                updateData.dislikes = Math.max(0, (playlist.dislikes || 0) - 1);
                updateData.dislikedBy = dislikedBy.filter(email => email !== userEmail);
            }
        }

        const updated = await dbManager.updatePlaylist(req.params.id, updateData);

        return res.status(200).json({
            success: true,
            likes: updated.likes,
            dislikes: updated.dislikes,
            likedBy: updated.likedBy,
            dislikedBy: updated.dislikedBy,
            message: likedBy.includes(userEmail) ? 'Unliked' : 'Liked'
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            errorMessage: 'Error liking playlist',
            error: error.message
        });
    }
};

dislikePlaylist = async (req, res) => {
    try {
        const playlist = await dbManager.getPlaylistById(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found',
            })
        }

        const user = await dbManager.getUserById(req.userId);
        const userEmail = user.email;
        const likedBy = playlist.likedBy || [];
        const dislikedBy = playlist.dislikedBy || [];

        if (dislikedBy.includes(userEmail)) {
            const updateData = {
                dislikes: Math.max(0, (playlist.dislikes || 0) - 1),
                dislikedBy: dislikedBy.filter(email => email !== userEmail)
            };
            const updated = await dbManager.updatePlaylist(req.params.id, updateData);
            return res.status(200).json({
                success: true,
                likes: updated.likes,
                dislikes: updated.dislikes,
                likedBy: updated.likedBy,
                dislikedBy: updated.dislikedBy,
                message: 'Removed dislike'
            })
        }
        let updateData = {
            dislikes: (playlist.dislikes || 0) + 1,
            dislikedBy: [...dislikedBy, userEmail]
        };

        if (likedBy.includes(userEmail)) {
            updateData.likes = Math.max(0, (playlist.likes || 0) - 1);
            updateData.likedBy = likedBy.filter(email => email !== userEmail);
        }

        const updated = await dbManager.updatePlaylist(req.params.id, updateData);

        return res.status(200).json({
            success: true,
            likes: updated.likes,
            dislikes: updated.dislikes,
            likedBy: updated.likedBy,
            dislikedBy: updated.dislikedBy,
            message: 'Disliked'
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            errorMessage: 'Error disliking playlist',
            error: error.message
        })
    }
}

addComment = async (req, res) => {
    try {
        const commentText = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';
        if (!commentText) {
            return res.status(400).json({
                errorMessage: 'Comment text required',
            })
        }
        if (commentText.length > 1000) {
            return res.status(400).json({
                errorMessage: 'Comment too long (max 1000 characters)',
            })
        }

        const playlist = await dbManager.getPlaylistById(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found',
            })
        }

        const user = await dbManager.getUserById(req.userId);
        const newComment = {
            user: user.email,
            text: commentText,
            createdAt: new Date()
        };

        const comments = playlist.comments || [];
        comments.push(newComment);

        await dbManager.updatePlaylist(req.params.id, { comments });
        
        return res.status(200).json({
            success: true,
            comment: newComment,
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            errorMessage: 'Error adding comment',
            error: error.message
        })
    }
}

deleteComment = async (req, res) => {
    try {
        const playlist = await dbManager.getPlaylistById(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found',
            })
        }

        const user = await dbManager.getUserById(req.userId);
        const commentIndex = parseInt(req.params.commentIndex, 10);

        if (
            isNaN(commentIndex) ||
            commentIndex < 0 ||
            !playlist.comments ||
            commentIndex >= playlist.comments.length
        ) {
            return res.status(404).json({
                errorMessage: 'Comment not found',
            })
        }

        if (playlist.comments[commentIndex].user !== user.email) {
            return res.status(403).json({
                errorMessage: 'You can only delete your own comments',
            })
        }

        const comments = playlist.comments.filter((_, index) => index !== commentIndex);

        await dbManager.updatePlaylist(req.params.id, { comments });
        
        return res.status(200).json({
            success: true,
            message: 'Comment deleted',
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            errorMessage: 'Error deleting comment',
            error: error.message
        })
    }
}
incrementListens = async (req, res) => {
    try {
        const playlistId = req.params.id;

        // Atomic $inc avoids the read-modify-write race where two concurrent
        // listeners would only count as one.
        const playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $inc: { listens: 1 } },
            { new: true }
        );

        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found'
            });
        }

        const songsInPlaylist = playlist.songs || [];

        // One bulk round-trip instead of one query per song.
        if (songsInPlaylist.length > 0) {
            await Song.bulkWrite(
                songsInPlaylist.map(s => ({
                    updateOne: {
                        filter: { title: s.title, artist: s.artist, year: s.year },
                        update: { $inc: { listens: 1 } }
                    }
                })),
                { ordered: false }
            );
        }

        return res.status(200).json({
            success: true,
            listens: playlist.listens
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errorMessage: 'Failed to increment listens'
        });
    }
};

getPublishedPlaylists = async (req, res) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 15));
        const skip  = (page - 1) * limit;

        const [data, total] = await Promise.all([
            Playlist.find({ published: true })
                .select('name ownerEmail ownerUsername likes dislikes likedBy dislikedBy listens comments published lastAccessed createdAt updatedAt')
                .sort({ listens: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Playlist.countDocuments({ published: true }),
        ]);

        const totalPages = Math.ceil(total / limit);

        // Cache each page for 60 s; serve stale up to 5 min while revalidating
        res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

        return res.status(200).json({
            success: true,
            data,
            pagination: { currentPage: page, totalPages, total, limit },
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            errorMessage: 'Error fetching published playlists',
            error: error.message,
        });
    }
}

// Escape user input before embedding it in a $regex so characters like ( or *
// can't produce invalid/expensive patterns (regex injection).
const escapeSearchRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

searchPlaylists = async (req, res) => {
    try {
        const userId = auth.verifyUser(req);

        const { name, username, title, artist, year } = req.query;

        // Visibility: published playlists for everyone, plus the caller's own.
        let userEmail = null;
        if (userId) {
            const user = await dbManager.getUserById(userId);
            if (user) {
                userEmail = user.email;
            }
        }
        const visibility = userEmail
            ? { $or: [{ published: true }, { ownerEmail: userEmail }] }
            : { published: true };

        // Build the whole search as one indexed DB query instead of loading
        // every playlist into memory and filtering in JS.
        const conditions = [visibility];
        if (name) {
            conditions.push({ name: { $regex: escapeSearchRegex(name), $options: 'i' } });
        }
        if (username) {
            conditions.push({ ownerUsername: { $regex: escapeSearchRegex(username), $options: 'i' } });
        }
        if (title) {
            conditions.push({ 'songs.title': { $regex: escapeSearchRegex(title), $options: 'i' } });
        }
        if (artist) {
            conditions.push({ 'songs.artist': { $regex: escapeSearchRegex(artist), $options: 'i' } });
        }
        if (year) {
            const yearNum = parseInt(year);
            if (!Number.isNaN(yearNum)) {
                conditions.push({ 'songs.year': yearNum });
            }
        }

        const results = await Playlist.find({ $and: conditions }).limit(200).lean();

        return res.status(200).json({
            success: true,
            data: results
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errorMessage: 'Error searching playlists',
            error: error.message
        })
    }
};



getPlaylistsByUsername = async (req, res) => {
    try {
        const username = req.params.username;

        // Indexed query instead of fetching every playlist and filtering in JS.
        const userPlaylists = await Playlist
            .find({ published: true, ownerUsername: username })
            .lean();

        return res.status(200).json({
            success: true,
            data: userPlaylists
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            errorMessage: 'Error fetching user playlists',
            error: error.message
        })
    }
}

addSongToPlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { songId } = req.body;

        const owned = await requireOwnership(req, res, id);
        if (!owned) return;
        const { playlist } = owned;

        const song = await Song.findById(songId);
        
        if (!song) {
            return res.status(404).json({
                success: false,
                error: 'Song not found in catalog'
            });
        }
        
        const songExists = playlist.songs.some(s => 
            s.title === song.title && 
            s.artist === song.artist && 
            s.year === song.year
        );

        if (songExists) {
            return res.status(400).json({
                success: false,
                error: 'Song already in playlist'
            });
        }

        playlist.songs.push({
            title: song.title,
            artist: song.artist,
            year: song.year,
            youTubeId: song.youTubeId
        });

        const updateData = {
            songs: playlist.songs,
            lastAccessed: new Date()
        };
        
        await dbManager.updatePlaylist(id, updateData);

        const playlistsArray = Array.isArray(song.playlists) ? song.playlists : [];
        const playlistIdString = (playlist._id || playlist.id).toString();
        const alreadyInList = playlistsArray.some(pId => pId.toString() === playlistIdString);

        if (!alreadyInList) {
            playlistsArray.push(playlist._id || playlist.id);
            song.playlists = playlistsArray;
            await song.save();
        }

        return res.status(200).json({
            success: true,
            playlist: playlist
        });

    } catch (error) {
        console.error('Error adding song to playlist:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}



module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist,
    publishPlaylist,
    likePlaylist,
    dislikePlaylist,
    addComment,
    deleteComment,
    incrementListens,
    getPublishedPlaylists,
    searchPlaylists,
    getPlaylistsByUsername,
    addSongToPlaylist
}