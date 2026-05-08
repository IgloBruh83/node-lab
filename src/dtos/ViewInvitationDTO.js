class ViewInvitationDTO {
    /**
     * @param {Object} row
     */
    constructor(row) {
        this.id = row.id;
        this.status = row.status;
        
        this.fromId = row.from_id;
        this.toId = row.to_id;

        this.senderName = row.sender_name;
        this.senderAge = row.sender_age;

        this.receiverName = row.receiver_name;
        this.receiverAge = row.receiver_age;
    }
}

module.exports = ViewInvitationDTO;