const db = require('./db');

class UserService {
    
    async findById(userId) {
        const userRes = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) return null;
        const row = userRes.rows[0];

        const keywordRes = await db.query(
            'SELECT k.value FROM keywords k JOIN user_keywords uk ON k.id = uk.keyword_id WHERE uk.user_id = $1', 
            [userId]
        );
        
        return this._mapToDto(row, keywordRes.rows.map(k => k.value));
    }

    async getAllUsers() {
        try {
            // Отримуємо всіх користувачів та їхні ключові слова одним запитом
            const query = `
                SELECT u.*, array_agg(k.value) FILTER (WHERE k.value IS NOT NULL) as keywords
                FROM users u
                LEFT JOIN user_keywords uk ON u.id = uk.user_id
                LEFT JOIN keywords k ON uk.keyword_id = k.id
                GROUP BY u.id
                ORDER BY u.id;
            `;

            const res = await db.query(query);

            return res.rows.map(row => this._mapToDto(row, row.keywords || []));
        } catch (err) {
            console.error("Помилка в UserService.getAllUsers:", err);
            throw err;
        }
    }

    async createUser(userData) {
        const query = `
            INSERT INTO users (email, password, name, age, gender)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;
        const values = [
            userData.email,
            userData.password,
            userData.name,
            userData.age,
            userData.gender
        ];

        const res = await db.query(query, values);
        return res.rows[0];
    }

    async updateUser(userId, updateData) {
        const query = `
            UPDATE users SET
                name = $1, age = $2, gender = $3,
                photo_url = $4, city = $5, goal = $6, bio = $7,
                phone = $8, email = $9, social_links = $10
            WHERE id = $11
            RETURNING *;
        `;

        const values = [
            updateData.name,
            updateData.age,
            updateData.gender,
            updateData.publicInfo?.photo,
            updateData.publicInfo?.city,
            updateData.publicInfo?.goal,
            updateData.publicInfo?.bio,
            updateData.privateInfo?.phone,
            updateData.privateInfo?.email,
            updateData.privateInfo?.social,
            userId
        ];

        const res = await db.query(query, values);
        if (res.rows.length === 0) throw new Error("Користувача не знайдено");

        return this._mapToDto(res.rows[0], []); 
    }

    _mapToDto(row, keywords = []) {
        return {
            id: row.id,
            name: row.name,
            age: row.age,
            gender: row.gender,
            publicInfo: {
                city: row.city,
                goal: row.goal,
                bio: row.bio,
                photo: row.photo_url
            },
            privateInfo: {
                phone: row.phone,
                email: row.email,
                social: row.social_links
            },
            keywords: keywords
        };
    }
}

module.exports = new UserService();