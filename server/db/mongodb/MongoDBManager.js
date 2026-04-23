const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });
const DatabaseManager = require('../DatabaseManager');
const mongoose = require('mongoose');
const User = require('../../models/user-model');
const Playlist = require('../../models/playlist-model');


class MongoDBManager extends DatabaseManager{

    async initialize(){
        await mongoose.connect(process.env.DB_CONNECT, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log('Connected to MongoDB');
    }


    async getUserById(userId){
        return await User.findOne({ _id: userId });
    }
    
    async getUserByEmail(email) {
        return await User.findOne({ email: email });
    }

    async getUserByUsername(username) {
        return await User.findOne({ username: username });
    }
    
    async createUser(userData) {
        const newUser = new User(userData);
        return await newUser.save();
    }

    async addPlaylistToUser (userId, playlistId ){
        const user = await User.findOne({_id: userId});
        if(!user){
            throw new Error('User not found');
        }

        user.playlists.push(playlistId);
        return await user.save();
    }

    async createPlaylist(playlistData){
        const playlistWithDefaults = {
            ...playlistData,
            published: playlistData.published !== undefined ?  playlistData.published : false,
            likes: playlistData.likes !== undefined  ? playlistData.likes : 0,
            dislikes: playlistData.dislikes !== undefined ? playlistData.dislikes : 0,
            listens: playlistData.listens !== undefined ? playlistData.listens : 0,
            comments: playlistData.comments || [],
            songs: playlistData.songs || []
        };
        
        const new_playlist = new Playlist(playlistWithDefaults);
        return await new_playlist.save();
    }

    async getPlaylistById(playlistId){
        return await Playlist.findOne({_id: playlistId})
    }

    async getPlaylistsByOwnerEmail(email) {
        return await Playlist.find({ ownerEmail: email });
    }
    
    async getAllPlaylists() {
        return await Playlist.find({});
    }

    getPublishedPlaylistsCursor() {
        return Playlist
            .find({ published: true })
            .select('name ownerEmail ownerUsername likes dislikes likedBy dislikedBy listens comments published lastAccessed createdAt updatedAt')
            .lean()
            .cursor();
    }
    
    async updatePlaylist(playlistId, updateData) {
    const playlist = await Playlist.findOne({ _id: playlistId });
    if (!playlist) {
        throw new Error('Playlist not found');
    }
    
    if (updateData.name !== undefined) {
        playlist.name = updateData.name;
    }
    if (updateData.songs !== undefined) {
        playlist.songs = updateData.songs;
    }
    if (updateData.published !== undefined) {
        playlist.published = updateData.published;
    }
    if (updateData.likes !== undefined) {
        playlist.likes = updateData.likes;
    }
    if (updateData.dislikes !== undefined) {
        playlist.dislikes = updateData.dislikes;
    }
    if (updateData.likedBy !== undefined) {
        playlist.likedBy = updateData.likedBy;
    }
    if (updateData.dislikedBy !== undefined) {
        playlist.dislikedBy = updateData.dislikedBy;
    }
    if (updateData.listens !== undefined) {
        playlist.listens = updateData.listens;
    }
    if (updateData.comments !== undefined) {
        playlist.comments = updateData.comments;
    }
    if (updateData.publishedDate !== undefined) {
        playlist.publishedDate = updateData.publishedDate;
    }
    
    return await playlist.save();
}


    async deletePlaylist(playlistId) {
        return await Playlist.findOneAndDelete({ _id: playlistId });
    }   

    async clearAllPlaylists(){
        await Playlist.deleteMany({});
        console.log("Playlists cleared");
    }

    async clearAllUsers(){
        await User.deleteMany({});
        console.log("Users cleared");
    }

    async getAllUsers(){
        return await User.find({});
    }

    async deleteUser(userId) {
        return await User.findOneAndDelete({ _id: userId });
    }

    async resetDatabase(testData){
        try{
            console.log("resetting the DB");
            await this.clearAllPlaylists();
            await this.clearAllUsers();

            for(let userData of testData.users){
                await this.createUser(userData);
            }
            console.log("users filled");

            for (let playlistData of testData.playlists) {
                
                const playlistWithDefaults = {
                    ...playlistData,
                    published: playlistData.published !== undefined ? playlistData.published : false,
                    likes: playlistData.likes !== undefined ? playlistData.likes : 0,
                    dislikes: playlistData.dislikes !== undefined ? playlistData.dislikes : 0,
                    listens: playlistData.listens !== undefined ? playlistData.listens : 0,
                    comments: playlistData.comments || [],
                    songs: playlistData.songs || []
                };
                
                const playlist = await this.createPlaylist(playlistWithDefaults);
                
                const user = await this.getUserByEmail(playlistData.ownerEmail);
                if (user) {
                    await this.addPlaylistToUser(user._id, playlist._id);
                }
            }
            console.log("Playlists filled");
            console.log("Database reset complete!");

        } catch (err) {
            console.error("Error resetting database:", err);
            throw err;
        }
    }

}

module.exports = MongoDBManager;