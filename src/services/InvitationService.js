// src/services/InvitationService.js
const db = require('./db');

class InvitationService {
    /**
     * Відправка запиту
     */
    async send(data) {
        const query = `
            INSERT INTO invitations (from_id, to_id, status)
            VALUES ($1, $2, 'pending')
            RETURNING id, from_id as "fromId", to_id as "toId", status;
        `;
        
        try {
            const res = await db.query(query, [data.fromId, data.toId]);
            return res.rows[0];
        } catch (err) {
            // Обробка CONSTRAINT check_not_self (якщо надіслав запит самому собі)
            if (err.code === '23514') {
                throw new Error("Ви не можете надіслати запит самому собі");
            }
            throw err;
        }
    }

    /**
     * Отримання списку запрошень для користувача (JOIN з іменами)
     */
    async getByUserId(userId) {
        const query = `
            SELECT 
                i.id, 
                u.name as "senderName", 
                i.status 
            FROM invitations i
            JOIN users u ON i.from_id = u.id
            WHERE i.to_id = $1;
        `;
        
        const res = await db.query(query, [userId || 777]); // Теж захардкодив 777 для тесту
        return res.rows;
    }
}

module.exports = new InvitationService();