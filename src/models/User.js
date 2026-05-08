const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING },
    age: { type: DataTypes.INTEGER },
    gender: { type: DataTypes.STRING }
}, { tableName: 'users', timestamps: false });

module.exports = User;