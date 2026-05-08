const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const PrivateInfo = sequelize.define('PrivateInfo', {
    phone: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    social: { type: DataTypes.JSONB, field: 'social_links' }
}, { tableName: 'private_info', timestamps: false });

module.exports = PrivateInfo;