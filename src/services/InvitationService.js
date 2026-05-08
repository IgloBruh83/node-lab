const { Invitation, User } = require('../models');
const sequelize = require('../db');
const { Op } = require('sequelize');

class InvitationService {
    async create(dto) {
        const t = await sequelize.transaction();
        try {
            if (dto.fromId === dto.toId) {
                throw new Error("Ви не можете надіслати запит самому собі");
            }

            const invitation = await Invitation.create({
                from_id: dto.fromId,
                to_id: dto.toId,
                status: 'pending'
            }, { transaction: t });

            await t.commit();
            return invitation;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async getByUserId(userId) {
        return await Invitation.findAll({
            where: {
                [Op.or]: [{ from_id: userId }, { to_id: userId }]
            },
            include: [
                { model: User, as: 'Sender', attributes: ['name', 'age'] },
                { model: User, as: 'Receiver', attributes: ['name', 'age'] }
            ]
        });
    }

    async updateStatus(id, status) {
        const inv = await Invitation.findByPk(id);
        if (inv) {
            inv.status = status;
            await inv.save();
        }
        return inv;
    }

    async delete(id) {
        return await Invitation.destroy({ where: { id } });
    }
}

module.exports = new InvitationService();