// const DatabaseManager = require('../DatabaseManager');
// const mongoose = require('mongoose');
// const User = require('../../models/user-model');
// const Playlist = require('../../models/playlist-model');

const auth = require('../auth');
const dbManager = require('../db');
/*
    This is our back-end API. It provides all the data services
    our database needs. Note that this file contains the controller
    functions for each endpoint.
    
    @author McKilla Gorilla
*/
createPlaylist = async (req, res) => {
    try{
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
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
    
    const playlist = await dbManager.createPlaylist(body);
    console.log("playlist created: " + JSON.stringify(playlist));
    // if (!playlist) {
    //     return res.status(400).json({ success: false, error: err })
    // }

    // User.findOne({ _id: req.userId }, (err, user) => {
    //     console.log("user found: " + JSON.stringify(user));
    //     user.playlists.push(playlist._id);
    //     user
    //         .save()
    //         .then(() => {
    //             playlist
    //                 .save()
    //                 .then(() => {
    //                     return res.status(201).json({
    //                         playlist: playlist
    //                     })
    //                 })
    //                 .catch(error => {
    //                     return res.status(400).json({
    //                         errorMessage: 'Playlist Not Created!'
    //                     })
    //                 })
    //         });
    // })
    await dbManager.addPlaylistToUser(req.userId, playlist.id || playlist._id);
        
        return res.status(201).json({
            playlist: playlist
        })
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({
            errorMessage: 'Playlist Not Created!'
        })

    }
    
}
deletePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
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
        return res.status(200).json({});
    } else {
        console.log("incorrect user!");
        return res.status(400).json({ 
            errorMessage: "authentication error" 
        });

    } 
    }  catch (err) 
    { console.error(err); return res.status(400).json({ errorMessage: 'Error deleting playlist' })
}
}
getPlaylistById = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }

    try{
        const list = await dbManager.getPlaylistById(req.params.id);
        if (!list) {
        return res.status(400).json({ success: false, error: 'Playlist not found' });
    }
    console.log("Found list: " + JSON.stringify(list));
    
    const user = await dbManager.getUserByEmail(list.ownerEmail);
    console.log("user.id: " + (user.id || user._id));
    console.log("req.userId: " + req.userId);
    
    if ((user.id || user._id) == req.userId) {
        console.log("correct user!");
        return res.status(200).json({ success: true, playlist: list })
    } else {
        console.log("incorrect user!");
        return res.status(400).json({ success: false, description: "authentication error" });
    }

    }
    catch (err) { console.error(err); 
        return res.status(400).json({ success: false, error: err }); }
    // console.log("Find Playlist with id: " + JSON.stringify(req.params.id));

    // await Playlist.findById({ _id: req.params.id }, (err, list) => {
    //     if (err) {
    //         return res.status(400).json({ success: false, error: err });
    //     }
    //     console.log("Found list: " + JSON.stringify(list));

    //     // DOES THIS LIST BELONG TO THIS USER?
    //     async function asyncFindUser(list) {
    //         await User.findOne({ email: list.ownerEmail }, (err, user) => {
    //             console.log("user._id: " + user._id);
    //             console.log("req.userId: " + req.userId);
    //             if (user._id == req.userId) {
    //                 console.log("correct user!");
    //                 return res.status(200).json({ success: true, playlist: list })
    //             }
    //             else {
    //                 console.log("incorrect user!");
    //                 return res.status(400).json({ success: false, description: "authentication error" });
    //             }
    //         });
    //     }
    //     asyncFindUser(list);
    // }).catch(err => console.log(err))
}
getPlaylistPairs = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
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
            console.log("!playlists.length");
            return res.status(404).json({ success: false, error: 'Playlists not found' })
        }
        
        console.log("Send the Playlist pairs");
        let pairs = [];
        for (let key in playlists) {
            let list = playlists[key];
            let pair = {
                _id: list.id || list._id,
                name: list.name
            };
            pairs.push(pair);
        }
        return res.status(200).json({ success: true, idNamePairs: pairs })
        
    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, error: err })
    }
}
getPlaylists = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    try{
        const playlists = await dbManager.getAllPlaylists();
    
    if (!playlists || playlists.length === 0) {
        return res.status(404).json({ success: false, error: `Playlists not found` })
    }
    
    return res.status(200).json({ success: true, data: playlists })

    }catch (err) { console.error(err);
         return res.status(400).json({ success: false, error: err }) }

    // await Playlist.find({}, (err, playlists) => {
    //     if (err) {
    //         return res.status(400).json({ success: false, error: err })
    //     }
    //     if (!playlists.length) {
    //         return res
    //             .status(404)
    //             .json({ success: false, error: `Playlists not found` })
    //     }
    //     return res.status(200).json({ success: true, data: playlists })
    // }).catch(err => console.log(err))
}
updatePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
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

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await dbManager.getUserByEmail(playlist.ownerEmail);
        console.log("user._id: " + (user.id || user._id));
        console.log("req.userId: " + req.userId);
        
        if ((user.id || user._id) == req.userId) {
            console.log("correct user!");
            console.log("req.body.name: " + req.body.name);

            const updateData = {
                name: body.playlist.name,
                songs: body.playlist.songs
            };
            
            await dbManager.updatePlaylist(req.params.id, updateData);
            
            console.log("SUCCESS!!!");
            return res.status(200).json({
                success: true,
                id: playlist.id || playlist._id,
                message: 'Playlist updated!',
            })
        }
        else {
            console.log("incorrect user!");
            return res.status(400).json({ success: false, description: "authentication error" });
        }
    } catch (error) {
        console.log("FAILURE: " + JSON.stringify(error));
        return res.status(404).json({
            error,
            message: 'Playlist not updated!',
        })
    }
}

publishPlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
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
        })
    }
}

likePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
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
        })
    }
}

dislikePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
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
        })
    }
}

addComment = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
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
        })
    }
}

deleteComment = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
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
        })
    }
}

incrementListens = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
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
        })
    }
}

getPublishedPlaylists = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }

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
        })
    }
}

searchPlaylists = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
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
        const results = allPlaylists.filter(p => 
            p.published && (
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.ownerUsername.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
        
        return res.status(200).json({ 
            success: true, 
            data: results 
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            errorMessage: 'Error searching playlists',
        })
    }
}

getPlaylistsByUsername = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
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
        })
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
    getPlaylistsByUsername
}