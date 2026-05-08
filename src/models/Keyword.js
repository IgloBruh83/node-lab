const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Keyword = sequelize.define('Keyword', {
    value: { type: DataTypes.STRING, unique: true }
}, { tableName: 'keywords' });

module.exports = Keyword;