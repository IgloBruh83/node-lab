const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Invitation = sequelize.define('Invitation', {
    status: { type: DataTypes.STRING, defaultValue: 'pending' }
}, { tableName: 'invitations' });

module.exports = Invitation;