class Invitation {
    /**
     * @param {Object} data
     * @param {number} data.id
     * @param {number} data.fromId
     * @param {number} data.toId
     * @param {string} data.status
     */
    constructor({ id, fromId, toId, status }) {
        this.id = id;
        this.fromId = fromId;
        this.toId = toId;
        this.status = status;
    }
}

module.exports = Invitation;