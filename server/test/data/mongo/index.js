const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });
const dbManager = require('../../../db'); // Import your database manager
const testData = require("../example-db-data.json");
// const bcrypt = require('bcryptjs');



// //We are trying to keep all the mongo related code in one file so I am going to implement this
// // code in the mongodbManager file and just call them here.


// async function clearCollection(collection, collectionName) {
//     try {
//         await collection.deleteMany({});
//         console.log(collectionName + " cleared");
//     }
//     catch (err) {
//         console.log(err);
//     }
// }

// async function fillCollection(collection, collectionName, data) {
//     for (let i = 0; i < data.length; i++) {
//         let doc = new collection(data[i]);
//         await doc.save();
//     }
//     console.log(collectionName + " filled");
// }

// async function resetMongo() {
//     const Playlist = require('../../../models/playlist-model')
//     const User = require("../../../models/user-model")
//     const testData = require("../example-db-data.json")

//     console.log("Resetting the Mongo DB")
//     await clearCollection(Playlist, "Playlist");
//     await clearCollection(User, "User");
//     await fillCollection(Playlist, "Playlist", testData.playlists);
//     await fillCollection(User, "User", testData.users);
// }

// const mongoose = require('mongoose')
// mongoose
//     .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
//     .then(() => { resetMongo() })
//     .catch(e => {
//         console.error('Connection error', e.message)
//     })


dbManager.initialize()
    .then(() => {
        console.log("Database initialized");
        return dbManager.resetDatabase(testData);
    })
    .then(() => {
        console.log("Reset complete!");
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
