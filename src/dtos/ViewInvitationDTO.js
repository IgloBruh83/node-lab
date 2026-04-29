class ViewInvitationDTO {
    /**
     * @param {Object} data
     * @param {number} data.id
     * @param {string} data.senderName
     * @param {string} data.status
     */
    constructor({ id, senderName, status }) {
        this.id = id;
        this.senderName = senderName;
        this.status = status;
    }
}

module.exports = ViewInvitationDTO;