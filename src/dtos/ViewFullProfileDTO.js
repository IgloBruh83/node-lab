const ViewProfileDTO = require('./ViewProfileDTO');

class ViewFullProfileDTO extends ViewProfileDTO {
    /**
     * @param {Object} data
     */
    constructor(data) {
        super(data);

        const privateInfo = data.privateInfo || {};
        this.phone = privateInfo.phone || null;
        this.privateEmail = privateInfo.email || null;
        this.social = privateInfo.social || {};

        this.outgoingInvitation = data.outgoingInvitation || null;
    }
}

module.exports = ViewFullProfileDTO;