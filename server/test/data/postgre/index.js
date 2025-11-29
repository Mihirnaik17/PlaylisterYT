const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });

const dbManager = require('../../../db');
const testData = require("../example-db-data.json");
//const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });

// const { Sequelize, DataTypes } = require('sequelize');


// // Now we have to make the connection to the server

// const sequelize = new Sequelize(
//     process.env.POSTGRES_DB,      
//     process.env.POSTGRES_USER,    
//     process.env.POSTGRES_PASSWORD, 
//     {
//         host: process.env.POSTGRES_HOST,
//         port: process.env.POSTGRES_PORT,
//         dialect: 'postgres',
//         logging: false 
//     }
// );

// const User = sequelize.define('User', {
//     firstName: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     lastName: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     email: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true 
//     },
//     passwordHash: {
//         type: DataTypes.STRING,
//         allowNull: false
//     }
// }, {
//     tableName: 'Users',
//     timestamps: true  
// });

// const Playlist = sequelize.define('Playlist', {
//     name: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     ownerEmail: {
//         type: DataTypes.STRING, 
//         allowNull: false
//     },
//     songs: {
//         type: DataTypes.JSONB, 
//         allowNull: false,
//         defaultValue: []
//     }
// }, {
//     tableName: 'Playlists',
//     timestamps: true
// });

// User.hasMany(Playlist, {
//     foreignKey: 'ownerId',
//     onDelete: 'CASCADE'
// });

// Playlist.belongsTo(User, {
//     foreignKey: 'ownerId',
//     as:'owner'
// });


// async function fillTable(model, tableName, data){
//     try{
//         await model.bulkCreate(data,{
//             validate: true
//         });
//         console.log(tableName+" filled");
//     }
//     catch(err){
//         console.log(err);
//     }
// }

// async function resetPostgres(){

//     const testData = require("../example-db-data.json");
//     console.log("Resetting the Postgres DB");

//     await sequelize.sync({force:true});
//     console.log(
//         "tables created"
//     );
//     const usersData = testData.users.map(user => ({
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         passwordHash: user.passwordHash
//     }));
//     await fillTable(User, "User", usersData);
//     const createdUsers = await User.findAll();
//     const emailToIdMap = {};
//     createdUsers.forEach(user => {
//         emailToIdMap[user.email] = user.id;
//     });

//     const playlistsData = testData.playlists.map(playlist => {
//         return {
//             name: playlist.name,
//             ownerEmail: playlist.ownerEmail,
//             songs: playlist.songs,
//             ownerId: emailToIdMap[playlist.ownerEmail]  
//         };
//     });
//     await fillTable(Playlist, "Playlist", playlistsData);
//     console.log("Postgres DB reset complete!");
// }

// sequelize.authenticate()
//     .then(() => {
//         console.log('Connected to PostgreSQL');
//         return resetPostgres();
//     })
//     .then(() => {
//         console.log('Reset complete');
//         process.exit(0);  
//     })
//     .catch(err => {
//         console.error('Error:', err);
//         process.exit(1);  
//     });


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