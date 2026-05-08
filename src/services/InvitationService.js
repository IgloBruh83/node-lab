const db = require('../db');
const Invitation = require('../models/Invitation');

class InvitationService {
    _mapRowToInvitation(row) {
        return new Invitation({
            id: row.id,
            fromId: row.from_id,
            toId: row.to_id,
            status: row.status
        });
    }

    async create(dto) {
        const query = `
            INSERT INTO invitations (from_id, to_id, status)
            VALUES ($1, $2, $3)
            RETURNING *`;
        const { rows } = await db.query(query, [dto.fromId, dto.toId, dto.status]);
        return this._mapRowToInvitation(rows[0]);
    }

    async getByUserId(userId) {
        const query = `
            SELECT 
                i.*, 
                u_from.name as sender_name, 
                u_from.age as sender_age,
                u_to.name as receiver_name, 
                u_to.age as receiver_age
            FROM invitations i
            JOIN users u_from ON i.from_id = u_from.id
            JOIN users u_to ON i.to_id = u_to.id
            WHERE i.from_id = $1 OR i.to_id = $1`;
        
        const { rows } = await db.query(query, [userId]);
        return rows; 
    }

    async getById(id) {
        const { rows } = await db.query('SELECT * FROM invitations WHERE id = $1', [id]);
        return rows[0] ? this._mapRowToInvitation(rows[0]) : null;
    }

    async updateStatus(id, status) {
        const query = `
            UPDATE invitations 
            SET status = $1 
            WHERE id = $2 
            RETURNING *`;
        const { rows } = await db.query(query, [status, id]);
        return rows[0] ? this._mapRowToInvitation(rows[0]) : null;
    }

    async delete(id) {
        await db.query('DELETE FROM invitations WHERE id = $1', [id]);
        return true;
    }
}

module.exports = new InvitationService();