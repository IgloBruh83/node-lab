
const ViewProfileDTO = require('./ViewProfileDTO');

class ViewFullProfileDTO extends ViewProfileDTO {
    constructor(data) {
        super(data);

        const priv = data.dataValues?.privateInfo || data.privateInfo || {};
        this.phone = priv.phone || null;
        this.privateEmail = priv.email || null;
        this.social = priv.social || {};

        const invite = data.dataValues?.invitation || data.invitation;
        this.outgoingInvitation = invite ? { 
            id: invite.id, 
            status: invite.status 
        } : null;
    }
}

module.exports = ViewFullProfileDTO;