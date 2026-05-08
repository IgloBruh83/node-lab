const InvitationService = require('../services/InvitationService');
const CreateInvitationDTO = require('../dtos/CreateInvitationDTO');
const ViewInvitationDTO = require('../dtos/ViewInvitationDTO');

class InvitationController {
    async create(req, res) {
        try {
            const dto = new CreateInvitationDTO({
                fromId: req.body.fromId, 
                toId: req.body.toId
            });
            const invitation = await InvitationService.create(dto);
            res.status(201).json(invitation);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getUserInvitations(req, res) {
        try {
            const userId = req.params.userId;
            const data = await InvitationService.getByUserId(userId);
            
            const response = data.map(row => new ViewInvitationDTO(row));
            
            res.json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const updated = await InvitationService.updateStatus(id, status);
            if (!updated) return res.status(404).json({ message: "Запит не знайдено" });
            
            res.json(updated);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await InvitationService.delete(req.params.id);
            res.json({ message: "Запит видалено" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new InvitationController();