const User = require('./User');
const PublicInfo = require('./PublicInfo');
const PrivateInfo = require('./PrivateInfo');
const Keyword = require('./Keyword');
const Invitation = require('./Invitation');

User.hasOne(PublicInfo, { foreignKey: 'user_id', as: 'publicInfo', onDelete: 'CASCADE' });
PublicInfo.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(PrivateInfo, { foreignKey: 'user_id', as: 'privateInfo', onDelete: 'CASCADE' });
PrivateInfo.belongsTo(User, { foreignKey: 'user_id' });

User.belongsToMany(Keyword, { through: 'user_keywords', foreignKey: 'user_id' });
Keyword.belongsToMany(User, { through: 'user_keywords', foreignKey: 'keyword_id' });

User.hasMany(Invitation, { as: 'SentInvitations', foreignKey: 'from_id' });
User.hasMany(Invitation, { as: 'ReceivedInvitations', foreignKey: 'to_id' });
Invitation.belongsTo(User, { as: 'Sender', foreignKey: 'from_id' });
Invitation.belongsTo(User, { as: 'Receiver', foreignKey: 'to_id' });

module.exports = {
    User,
    PublicInfo,
    PrivateInfo,
    Keyword,
    Invitation
};