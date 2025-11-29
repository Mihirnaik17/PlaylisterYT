const mongoose = require('mongoose')
const Schema = mongoose.Schema
/*
    This is where we specify the format of the data we're going to put into
    the database.
    
    @author McKilla Gorilla
*/
const playlistSchema = new Schema(
    {
        name: { type: String, required: true },
        ownerEmail: { type: String, required: true },
        songs: { type: [{
            title: String,
            artist: String,
            year: Number,
            youTubeId: String
        }], required: true },
        ownerUsername: {type: String, required: true},
        published: { type: Boolean, required: true},
        likes: {type: Number,required: true},
        Dislikes: {type: Number,required: true},
        listens: {type: Number,required: true},
        comments: [{
            username: String,
            comment: String,
            timestamps: Data
        }]
    },
    { timestamps: true },
)

module.exports = mongoose.model('Playlist', playlistSchema)
