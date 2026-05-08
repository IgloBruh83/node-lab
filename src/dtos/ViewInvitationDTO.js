class ViewInvitationDTO {
    /**
     * @param {Object} inv
     */
    constructor(inv) {
        this.id = inv.id;
        this.status = inv.status;
        
        this.fromId = inv.from_id;
        this.toId = inv.to_id;

        if (inv.Sender) {
            this.senderName = inv.Sender.name;
            this.senderAge = inv.Sender.age;
        }

        if (inv.Receiver) {
            this.receiverName = inv.Receiver.name;
            this.receiverAge = inv.Receiver.age;
        }
    }
}

module.exports = ViewInvitationDTO;