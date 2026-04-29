
class InvitationService {
    /**
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async send(data) {
        // ЗАГЛУШКА
        console.log(`DB: Створення запиту від ${data.fromId} до ${data.toId} зі статусом ${data.status}`);
        return {
            id: Math.floor(Math.random() * 1000), // ЗАГЛУШКА
            senderName: "Системний користувач",   // ЗАГЛУШКА
            status: data.status
        };
    }

    /**
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    async getByUserId(userId) {
        // ЗАГЛУШКА
        console.log(`DB: Пошук запрошень для користувача з ID: ${userId}`);
        return [
            {
                id: 101,
                senderName: "Марія",
                status: "pending"
            },
            {
                id: 102,
                senderName: "Андрій",
                status: "accepted"
            },
            {
                id: 105,
                senderName: "Олена",
                status: "pending"
            }
        ];
    }
}

module.exports = new InvitationService();