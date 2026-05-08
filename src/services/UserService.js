const db = require('../db');
const User = require('../models/User');

class UserService {
    _mapRowToUser(row, keywords = []) {
        return new User({
            id: row.id,
            email: row.email,
            password: row.password,
            name: row.name,
            age: row.age,
            gender: row.gender,
            publicInfo: {
                photo: row.photo_url,
                city: row.city,
                goal: row.goal,
                bio: row.bio
            },
            privateInfo: {
                phone: row.phone,
                email: row.email,
                social: row.social_links
            },
            keywords: keywords
        });
    }

    async create({ email, password, name = 'New User' }) {
        const query = `
            INSERT INTO users (email, password, name) 
            VALUES ($1, $2, $3) 
            RETURNING *`;
        const { rows } = await db.query(query, [email, password, name]);
        return this._mapRowToUser(rows[0]);
    }

    async getAll(excludeId = null) {
        let query = `
            SELECT u.*, 
                COALESCE(
                    array_agg(k.value) FILTER (WHERE k.value IS NOT NULL), 
                    '{}'
                ) as keyword_list
            FROM users u
            LEFT JOIN user_keywords uk ON u.id = uk.user_id
            LEFT JOIN keywords k ON uk.keyword_id = k.id `;

        const params = [];
        if (excludeId) {
            query += ` WHERE u.id != $1 `;
            params.push(excludeId);
        }

        query += ` GROUP BY u.id`;

        const { rows } = await db.query(query, params);
        return rows.map(row => this._mapRowToUser(row, row.keyword_list));
    }

    async getById(id, viewerId = null) {
        const userQuery = 'SELECT * FROM users WHERE id = $1';
        const keysQuery = `
            SELECT k.value 
            FROM keywords k
            JOIN user_keywords uk ON k.id = uk.keyword_id
            WHERE uk.user_id = $1`;
        
        const [userRes, keysRes] = await Promise.all([
            db.query(userQuery, [id]),
            db.query(keysQuery, [id])
        ]);

        if (userRes.rows.length === 0) return null;

        const user = userRes.rows[0];
        const keywords = keysRes.rows.map(r => r.value);

        let outgoingInvitation = null;
        if (viewerId && viewerId !== id) {
            const outQuery = 'SELECT id, status FROM invitations WHERE from_id = $1 AND to_id = $2 LIMIT 1';
            const outRes = await db.query(outQuery, [viewerId, id]);
            if (outRes.rows.length > 0) {
                outgoingInvitation = outRes.rows[0]; // { id, status }
            }
        }

        let isMatched = outgoingInvitation?.status === 'accepted';
        if (!isMatched && viewerId && viewerId !== id) {
            const matchQuery = `SELECT 1 FROM invitations WHERE status = 'accepted' AND from_id = $1 AND to_id = $2 LIMIT 1`;
            const matchRes = await db.query(matchQuery, [id, viewerId]);
            isMatched = matchRes.rows.length > 0;
        }

        if (!isMatched && viewerId !== id) {
            user.phone = null;
            user.email = null;
        }

        const mappedUser = this._mapRowToUser(user, keywords);
        mappedUser.outgoingInvitation = outgoingInvitation;
        
        return mappedUser;
    }

    async findByEmail(email) {
        const userQuery = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(userQuery, [email]);
        
        if (rows.length === 0) return null;
        
        const userId = rows[0].id;

        const keysQuery = `
            SELECT k.value 
            FROM keywords k
            JOIN user_keywords uk ON k.id = uk.keyword_id
            WHERE uk.user_id = $1`;
        
        const keysRes = await db.query(keysQuery, [userId]);
        const keywords = keysRes.rows.map(r => r.value);

        return this._mapRowToUser(rows[0], keywords);
    }

    async update(id, dto) {
        const userQuery = `
            UPDATE users SET 
                name = COALESCE($1, name),
                age = COALESCE($2, age),
                gender = COALESCE($3, gender),
                photo_url = COALESCE($4, photo_url),
                city = COALESCE($5, city),
                goal = COALESCE($6, goal),
                bio = COALESCE($7, bio),
                phone = COALESCE($8, phone),
                email = COALESCE($9, email)
            WHERE id = $10
            RETURNING *`;

        const values = [
            dto.name, 
            dto.age, 
            dto.gender,
            dto.publicInfo.photo, 
            dto.publicInfo.city, 
            dto.publicInfo.goal, 
            dto.publicInfo.bio,
            dto.privateInfo.phone, 
            dto.privateInfo.email,
            id
        ];

        await db.query(userQuery, values);

        if (dto.keywords) {
            await db.query('DELETE FROM user_keywords WHERE user_id = $1', [id]);

            for (const val of dto.keywords) {
                const keyRes = await db.query(`
                    INSERT INTO keywords (value) 
                    VALUES ($1) 
                    ON CONFLICT (value) DO UPDATE SET value = EXCLUDED.value 
                    RETURNING id`, [val]);
                
                const keywordId = keyRes.rows[0].id;

                await db.query(`
                    INSERT INTO user_keywords (user_id, keyword_id) 
                    VALUES ($1, $2) 
                    ON CONFLICT DO NOTHING`, [id, keywordId]);
            }
        }

        return this.getById(id);
    }

    async delete(id) {
        const query = 'DELETE FROM users WHERE id = $1';
        await db.query(query, [id]);
        return true;
    }
}

module.exports = new UserService();