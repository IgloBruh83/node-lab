const { User, PublicInfo, PrivateInfo, Keyword, Invitation } = require('../models');
const sequelize = require('../db');
const { Op } = require('sequelize');

class UserService {
    async create({ email, password, name }) {
        const t = await sequelize.transaction();
        try {
            const user = await User.create({ email, password, name }, { transaction: t });
            
            await PublicInfo.create({ user_id: user.id }, { transaction: t });
            await PrivateInfo.create({ user_id: user.id, email: email }, { transaction: t });
            
            await t.commit();
            return await this.getById(user.id);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async getAll({ excludeId, searchQuery, page = 1, limit = 6 }) {
        const offset = (page - 1) * limit;
        const where = {};

        if (excludeId) where.id = { [Op.ne]: excludeId };

        if (searchQuery) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${searchQuery}%` } },
                { '$Keywords.value$': { [Op.iLike]: `%${searchQuery}%` } }
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            include: [
                { model: PublicInfo, as: 'publicInfo' },
                { model: Keyword }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true, 
            subQuery: false,
            order: [['name', 'ASC']]
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            users: rows
        };
    }

    async getById(id, viewerId = null) {
        if (id === 'undefined') throw new Error("Invalid User ID");

        const user = await User.findByPk(id, {
            include: [
                { model: PublicInfo, as: 'publicInfo' },
                { model: Keyword }
            ]
        });

        if (!user) return null;

        if (viewerId && String(viewerId) !== String(id)) {
            const invite = await Invitation.findOne({
                where: {
                    [Op.or]: [
                        { from_id: viewerId, to_id: id },
                        { from_id: id, to_id: viewerId }
                    ]
                }
            });

            user.setDataValue('invitation', invite);

            if (invite && invite.status === 'accepted') {
                const priv = await PrivateInfo.findOne({ where: { user_id: id } });
                user.setDataValue('privateInfo', priv);
            }
        } else if (String(viewerId) === String(id)) {
            const priv = await PrivateInfo.findOne({ where: { user_id: id } });
            user.setDataValue('privateInfo', priv);
        }

        return user;
    }

    async update(id, dto) {
        const t = await sequelize.transaction();
        try {
            await User.update({ name: dto.name, age: dto.age, gender: dto.gender }, 
                { where: { id }, transaction: t });

            if (dto.publicInfo) {
                await PublicInfo.update(dto.publicInfo, { where: { user_id: id }, transaction: t });
            }

            if (dto.privateInfo) {
                await PrivateInfo.update(dto.privateInfo, { where: { user_id: id }, transaction: t });
            }

            if (dto.keywords) {
                const userInstance = await User.findByPk(id, { transaction: t });
                const keywordInstances = await Promise.all(
                    dto.keywords.map(val => Keyword.findOrCreate({ 
                        where: { value: val }, transaction: t 
                    }).then(res => res[0]))
                );
                await userInstance.setKeywords(keywordInstances, { transaction: t });
            }

            await t.commit();
            return await this.getById(id);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async delete(id) {
        return await User.destroy({ where: { id } });
    }

    async findByEmail(email) {
        return await User.findOne({ 
            where: { email }, 
            include: [
                { model: PublicInfo, as: 'publicInfo' },
                { model: PrivateInfo, as: 'privateInfo' },
                { model: Keyword }
            ] 
        });
    }
}

module.exports = new UserService();