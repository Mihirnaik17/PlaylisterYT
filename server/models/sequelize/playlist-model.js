const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Playlist = sequelize.define('Playlist', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ownerEmail: {
            type: DataTypes.STRING,
            allowNull: false
        },
        songs: {
            type: DataTypes.JSON, 
            allowNull: true,
            defaultValue: []
        }
    }, {
        timestamps: true,
        tableName: 'playlists'
    });

    return Playlist;
};