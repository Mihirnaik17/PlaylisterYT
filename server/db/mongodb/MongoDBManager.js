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
        const new_playlist = new Playlist(playlistData);
        return await new_playlist.save();
    }

    async getPlaylistById(playlistId){
        return await Playlist.findById({_id: playlistId})
    }

    async getPlaylistsByOwnerEmail(email) {
        return await Playlist.find({ ownerEmail: email });
    }
    
    async getAllPlaylists() {
        return await Playlist.find({});
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
        
        return await playlist.save();
    }

    async deletePlaylist(playlistId) {
        return await Playlist.findOneAndDelete({ _id: playlistId });
    }   
    
    // async clearAllPlaylists(){
    //     try{
    //         const playlists = await DatabaseManager.getAllPlaylists();
    //         for(let curPlayList of playlists){
    //             await DatabaseManager.deletePlaylist(curPlayList._id);
    //         }
    //         console.log("Playlists cleared");
    //     }
    //     catch(err){
    //         console.log(err);
    //     }
    // }

    // async clearAllUsers(){
    //     try{
    //         const Users = await DatabaseManager.getAllUsers();
    //         for(let curUser of Users){
    //             await DatabaseManager.deletePlaylist(curUser._id);
    //         }
    //         console.log("users cleared");
    //     }
    //     catch(err){
    //         console.log(err);
    //     }
    // }

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
                const playlist = await this.createPlaylist(playlistData);
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
    
    //reset mongo data methods


}

module.exports = MongoDBManager;

