const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const PublicInfo = sequelize.define('PublicInfo', {
    photo: { type: DataTypes.STRING, field: 'photo_url' },
    city: { type: DataTypes.STRING },
    goal: { type: DataTypes.STRING },
    bio: { type: DataTypes.TEXT }
}, { tableName: 'public_info', timestamps: false });

module.exports = PublicInfo;