const mongoose = require('mongoose')
const Schema = mongoose.Schema
/*
    This is where we specify the format of the data we're going to put into
    the database.
    
    @author McKilla Gorilla
*/
const playlistSchema = new Schema(
    {
        name: {type: String, required: true },
        ownerEmail: {type: String, required: true },
        ownerUsername: {type: String, required: true },
        songs: { 
            type: [{
                title: { type: String, required: true },

                artist: { type: String, required: true },

                year: { type: Number, required: true },

                youTubeId: { type: String, required: true }
            }], 

            required: true,
            default: []
        },
        published: { type: Boolean, required: true, default: false },
        likes: { type: Number, required: true, default: 0 },
        dislikes: { type: Number, required: true, default: 0 },
        listens: { type: Number, required: true, default: 0 },
        comments: {
            type: [{
                username: { type: String, required: true },
                comment:{ type: String, required: true },
                createdAt:  { type: Date, default: Date.now }
            }],
            default: []
        }
    },
    { timestamps: true },
)

module.exports = mongoose.model('Playlist', playlistSchema)