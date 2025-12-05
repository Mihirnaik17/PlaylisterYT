const mongoose = require('mongoose')
const Schema = mongoose.Schema

const songSchema = new Schema(
    {
        title: { 
            type: String, 
            required: true 
        },
        artist: { 
            type: String, 
            required: true 
        },
        year: { 
            type: Number, 
            required: true 
        },
        youTubeId: { 
            type: String, 
            required: true 
        },
        
        ownerEmail: { 
            type: String, 
            required: true 
        },
        ownerUsername: { 
            type: String, 
            required: true 
        },
        listens: { 
            type: Number, 
            required: true, 
            default: 0 
        },

        playlists: { 
            type: [Schema.Types.ObjectId], 
            ref: 'Playlist',
            default: [] 
        }
    },
    { timestamps: true }
)
songSchema.index( { title:1, artist: 1, year: 1 }, { unique: true })

module.exports = mongoose.model('Song', songSchema)