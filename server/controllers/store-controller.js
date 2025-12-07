const auth = require('../auth');
const dbManager = require('../db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/*
    This is our back-end API. It provides all the data services
    our database needs. Note that this file contains the controller
    functions for each endpoint.
    
    @author McKilla Gorilla
*/
createPlaylist = async (req, res) => {
    try{
    if(auth.verifyUser(req) === null){
        return res.status(401).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body;
    console.log("createPlaylist body: " + JSON.stringify(body));
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Playlist',
        })
    }
    
    const user = await dbManager.getUserById(req.userId);
    if (!user) {
        return res.status(404).json({
            errorMessage: 'User not found'
        })
    }
    
    const playlistData = {
        ...body,
        ownerEmail: user.email,
        ownerUsername: user.username,
        published: true,
        likes: 0,
        dislikes: 0,
        listens: 0,
        comments: [],
        songs: body.songs || []
    };
    
    const playlist = await dbManager.createPlaylist(playlistData);
    console.log("playlist created: " + JSON.stringify(playlist));

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
    if(auth.verifyUser(req) === null){
        return res.status(401).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    try{
    const playlist = await dbManager.getPlaylistById(req.params.id);
    console.log("playlist is found: "+ JSON.stringify(playlist));

    if(!playlist){
        return res.status(404).json({
            errorMessage: "Playlist not found",
        })
    }
    const user = await dbManager.getUserByEmail(playlist.ownerEmail);
    console.log("user.id: " + (user.id || user._id));
    console.log("req.userId: " + req.userId);

    if ((user.id || user._id) == req.userId) {
        console.log("correct user!");
        await dbManager.deletePlaylist(req.params.id);
        return res.status(200).json({ success: true });
    } else {
        console.log("incorrect user!");
        return res.status(403).json({ 
            errorMessage: "You don't have permission to delete this playlist" 
        });

    } 
    }  catch (err) 
    { console.error(err); return res.status(400).json({ errorMessage: 'Error deleting playlist' })
}
}
getPlaylistById = async (req, res) => {
    try{
        const list = await dbManager.getPlaylistById(req.params.id);
        if (!list) {
            return res.status(404).json({ success: false, error: 'Playlist not found' });
        }
        console.log("Found list: " + JSON.stringify(list));
        
        if (list.published) {
            console.log("Published playlist - allowing view");
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
        
        console.log("user._id: " + (user.id || user._id));
        console.log("list.ownerEmail: " + list.ownerEmail);
        console.log("user.email: " + user.email);
        
        if (list.ownerEmail === user.email) {
            console.log("correct user!");
            await dbManager.updatePlaylist(req.params.id, { lastAccessed: new Date() });
            return res.status(200).json({ success: true, playlist: list })
        } else {
            console.log("incorrect user - unpublished playlist!");
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
    if(auth.verifyUser(req) === null){
        return res.status(401).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("getPlaylistPairs");

    try {
        const user = await dbManager.getUserById(req.userId);
        console.log("find user with id " + req.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' })
        }
        
        console.log("find all Playlists owned by " + user.email);
        const playlists = await dbManager.getPlaylistsByOwnerEmail(user.email);
        console.log("found Playlists: " + JSON.stringify(playlists));
        
        if (!playlists || playlists.length === 0) {
            console.log("No playlists found - returning empty array");
            return res.status(200).json({ success: true, idNamePairs: [] })
        }
        
        console.log("Send the Playlist pairs");
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
                listens: list.listens || 0,
                lastAccessed: list.lastAccessed
            };
            pairs.push(pair);
        }
        return res.status(200).json({ success: true, idNamePairs: pairs })
        
    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, error: err.message })
    }
}
getPlaylists = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(401).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    try{
        const playlists = await dbManager.getAllPlaylists();
    
        if (!playlists || playlists.length === 0) {
            return res.status(200).json({ success: true, data: [] })
        }
        
        return res.status(200).json({ success: true, data: playlists })

    }catch (err) { 
        console.error(err);
        return res.status(400).json({ success: false, error: err.message }) 
    }
}
updatePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(401).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body
    console.log("updatePlaylist: " + JSON.stringify(body));
    console.log("req.body.name: " + req.body.name);

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        })
    }

    try {
        const playlist = await dbManager.getPlaylistById(req.params.id);
        console.log("playlist found: " + JSON.stringify(playlist));
        
        if (!playlist) {
            return res.status(404).json({
                message: 'Playlist not found!',
            })
        }

        const user = await dbManager.getUserByEmail(playlist.ownerEmail);
        console.log("user._id: " + (user.id || user._id));
        console.log("req.userId: " + req.userId);
        
        if ((user.id || user._id) == req.userId) {
            console.log("correct user!");
            console.log("req.body.name: " + req.body.name);

            const updateData = {
                name: body.name,
                songs: body.songs,
                lastAccessed: new Date()
            };
            
            const updatedPlaylist = await dbManager.updatePlaylist(req.params.id, updateData);
            
            console.log("SUCCESS!!!");
            return res.status(200).json({
                success: true,
                playlist: updatedPlaylist,
                message: 'Playlist updated!',
            })
        }
        else {
            console.log("incorrect user!");
            return res.status(403).json({ 
                success: false, 
                errorMessage: "You don't have permission to update this playlist" 
            });
        }
    } catch (error) {
        console.log("FAILURE: " + JSON.stringify(error));
        return res.status(404).json({
            error: error.message,
            message: 'Playlist not updated!',
        })
    }
}

publishPlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(401).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }

    try {
        const playlist = await dbManager.getPlaylistById(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found',
            })
        }

        const user = await dbManager.getUserByEmail(playlist.ownerEmail);
        
        if ((user.id || user._id) != req.userId) {
            return res.status(403).json({ 
                errorMessage: "You don't have permission to publish this playlist" 
            });
        }

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
    if(auth.verifyUser(req) === null){
        return res.status(401).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }

    try {
        const playlist = await dbManager.getPlaylistById(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found',
            })
        }

        const updateData = {
            likes: (playlist.likes || 0) + 1
        };

        await dbManager.updatePlaylist(req.params.id, updateData);
        
        return res.status(200).json({
            success: true,
            likes: updateData.likes,
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            errorMessage: 'Error liking playlist',
            error: error.message
        })
    }
}

dislikePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(401).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }

    try {
        const playlist = await dbManager.getPlaylistById(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found',
            })
        }

        const updateData = {
            dislikes: (playlist.dislikes || 0) + 1
        };

        await dbManager.updatePlaylist(req.params.id, updateData);
        
        return res.status(200).json({
            success: true,
            dislikes: updateData.dislikes,
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
    if(auth.verifyUser(req) === null){
        return res.status(401).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }

    try {
        if (!req.body.comment) {
            return res.status(400).json({
                errorMessage: 'Comment text required',
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
            username: user.username,
            comment: req.body.comment,
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
    if(auth.verifyUser(req) === null){
        return res.status(401).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }

    try {
        const playlist = await dbManager.getPlaylistById(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found',
            })
        }

        const user = await dbManager.getUserById(req.userId);
        const commentIndex = parseInt(req.params.commentIndex);

        if (!playlist.comments || commentIndex >= playlist.comments.length) {
            return res.status(404).json({
                errorMessage: 'Comment not found',
            })
        }

        if (playlist.comments[commentIndex].username !== user.username) {
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
        const playlist = await dbManager.getPlaylistById(req.params.id);
        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found',
            })
        }

        if (!playlist.published) {
            if (!req.userId) {
                return res.status(403).json({
                    errorMessage: 'Cannot increment listens on unpublished playlist',
                })
            }
            const user = await dbManager.getUserById(req.userId);
            if (playlist.ownerEmail !== user.email) {
                return res.status(403).json({
                    errorMessage: 'Cannot increment listens on unpublished playlist',
                })
            }
        }

        const updateData = {
            listens: (playlist.listens || 0) + 1
        };
        await dbManager.updatePlaylist(req.params.id, updateData);
        
        return res.status(200).json({
            success: true,
            listens: updateData.listens,
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            errorMessage: 'Error incrementing listens',
            error: error.message
        })
    }
}

getPublishedPlaylists = async (req, res) => {
    try {
        const allPlaylists = await dbManager.getAllPlaylists();
        const publishedPlaylists = allPlaylists.filter(p => p.published === true);
        return res.status(200).json({ 
            success: true, 
            data: publishedPlaylists 
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            errorMessage: 'Error fetching published playlists',
            error: error.message
        })
    }
}

searchPlaylists = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(401).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }

    try {
        const searchQuery = req.query.query;
        if (!searchQuery) {
            return res.status(400).json({
                errorMessage: 'Search query required',
            })
        }
        const allPlaylists = await dbManager.getAllPlaylists();
        const results = allPlaylists.filter(p => {
            if (!p.published) return false;
            
            const query = searchQuery.toLowerCase();
            
            if (p.name.toLowerCase().includes(query) || 
                p.ownerUsername.toLowerCase().includes(query)) {
                return true;
            }
            
            if (p.songs && p.songs.length > 0) {
                return p.songs.some(song => 
                    (song.title && song.title.toLowerCase().includes(query)) ||
                    (song.artist && song.artist.toLowerCase().includes(query))
                );
            }
            
            return false;
        });
        
        return res.status(200).json({ 
            success: true, 
            data: results 
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            errorMessage: 'Error searching playlists',
            error: error.message
        })
    }
}

getPlaylistsByUsername = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(401).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }

    try {
        const username = req.params.username;
        
        const allPlaylists = await dbManager.getAllPlaylists();
        const userPlaylists = allPlaylists.filter(p => 
            p.published && p.ownerUsername === username
        );
        
        return res.status(200).json({ 
            success: true, 
            data: userPlaylists 
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            errorMessage: 'Error fetching user playlists',
            error: error.message
        })
    }
} 

addSongToPlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(401).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    
    try {
        const { id } = req.params;
        const { songId } = req.body;
        
        const playlist = await dbManager.getPlaylistById(id);
        if (!playlist) {
            return res.status(404).json({
                success: false,
                error: 'Playlist not found'
            });
        }
        
        const user = await dbManager.getUserById(req.userId);
        
        if (playlist.ownerEmail !== user.email) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to edit this playlist'
            });
        }
        
        const Song = require('../models/song-model');
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

        if (!song.playlists.includes(playlist._id)) {
            song.playlists.push(playlist._id);
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