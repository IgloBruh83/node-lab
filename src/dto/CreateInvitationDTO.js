class CreateInvitationDTO {
    /**
     * @param {Object} data
     * @param {number} data.fromId
     * @param {number} data.toId
     */
    constructor({ fromId, toId }) {
        if (fromId === toId) {
            throw new Error("Ви не можете відправити запит самому собі");
        }
        this.fromId = fromId;
        this.toId = toId;
        this.status = 'pending';
    }
}

module.exports = CreateInvitationDTO;