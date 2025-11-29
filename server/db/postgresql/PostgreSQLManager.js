const DatabaseManager = require('../DatabaseManager');
const { Sequelize, DataTypes } = require('sequelize');

const bcrypt = require('bcryptjs');


//Most of them as very similar to MongoDBManager , I just had to make minute changes in it.
class PostgreSQLManager extends DatabaseManager {
    constructor() {
        super();
        this.sequelize = null;
        this.User = null;
        this.Playlist = null;
    }

    async initialize() {
        this.sequelize = new Sequelize(
            process.env.POSTGRES_DB,
            process.env.POSTGRES_USER,
            process.env.POSTGRES_PASSWORD,
            {
                host: process.env.POSTGRES_HOST,
                port: process.env.POSTGRES_PORT,
                dialect: 'postgres',
                logging: false 
            }
        );
        await this.sequelize.authenticate();
        console.log('Connected to PostgreSQL');

        this.User = require('../../models/sequelize/user-model')(this.sequelize);
        this.Playlist = require('../../models/sequelize/playlist-model')(this.sequelize);

        this.User.hasMany(this.Playlist, { foreignKey: 'userId', as: 'playlists' });
        this.Playlist.belongsTo(this.User, { foreignKey: 'userId', as: 'owner' });

        await this.sequelize.sync();
        console.log('Database synced');
    }

    async getUserById(userId) {
        return await this.User.findByPk(userId);
    }

    async getUserByEmail(email) {
        return await this.User.findOne({ where: { email: email } });
    }

    async createUser(userData) {
        return await this.User.create(userData);
    }

    async addPlaylistToUser(userId, playlistId) {
        const playlist = await this.Playlist.findByPk(playlistId);
        if (!playlist) {
            throw new Error('Playlist not found');
        }
        playlist.userId = userId;
        return await playlist.save();
    }

    async createPlaylist(playlistData) {
        return await this.Playlist.create(playlistData);
    }

    async getPlaylistById(playlistId) {
        return await this.Playlist.findByPk(playlistId);
    }

    async getPlaylistsByOwnerEmail(email) {
        return await this.Playlist.findAll({ where: { ownerEmail: email } });
    }

    async getAllPlaylists() {
        return await this.Playlist.findAll();
    }

    async updatePlaylist(playlistId, updateData) {
        const playlist = await this.Playlist.findByPk(playlistId);
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
        const playlist = await this.Playlist.findByPk(playlistId);
        if (playlist) {
            await playlist.destroy();
            return playlist;
        }
        return null;
    }

    async getAllUsers() {
        return await this.User.findAll();
    }

    async deleteUser(userId) {
        const user = await this.User.findByPk(userId);
        if (user) {
            await user.destroy();
            return user;
        }
        return null;
    }

    async clearAllPlaylists() {
        await this.sequelize.query('TRUNCATE TABLE "playlists" CASCADE');
        console.log("Playlists cleared");
    }

    async clearAllUsers() {
        await this.sequelize.query('TRUNCATE TABLE "users" CASCADE');
        console.log("Users cleared");
    }

    async resetDatabase(testData) {
        try {
            console.log("Resetting the PostgreSQL DB");
            await this.clearAllPlaylists();
            await this.clearAllUsers();

            for (let userData of testData.users) {
                if (userData.passwordHash && !userData.passwordHash.startsWith('$2a$')) {
                    const saltRounds = 10;
                    const salt = await bcrypt.genSalt(saltRounds);
                    userData.passwordHash = await bcrypt.hash(userData.passwordHash, salt);
                }
                await this.createUser(userData);
            }
            console.log("Users filled");
            for (let playlistData of testData.playlists) {
                const playlist = await this.createPlaylist(playlistData);
                const user = await this.getUserByEmail(playlistData.ownerEmail);
                if (user) {
                    await this.addPlaylistToUser(user.id, playlist.id);
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

module.exports = PostgreSQLManager;