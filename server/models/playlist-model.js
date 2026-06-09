const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
        lastAccessed: { type: Date, default: Date.now },
        published: { type: Boolean, required: true, default: false },
        likes: { type: Number, required: true, default: 0 },
        dislikes: { type: Number, required: true, default: 0 },
        likedBy: { type: [String], default: [] },    //added for likes    
        dislikedBy: { type: [String], default: [] },     // and this for dislikes
        listens: { type: Number, required: true, default: 0 },
        comments: {
            type: [{
                user: { type: String, required: false },
                text: { type: String, required: false },
                createdAt: { type: Date, default: Date.now }
            }],
            default: []
        }
    },
    { timestamps: true },
)

playlistSchema.index({ ownerEmail: 1, lastAccessed: -1 });
playlistSchema.index({ published: 1, likes: -1 });
playlistSchema.index({ published: 1, listens: -1 });
playlistSchema.index({ name: 1 });

module.exports = mongoose.model('Playlist', playlistSchema)