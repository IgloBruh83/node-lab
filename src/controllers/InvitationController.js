const CreateInvitationDTO = require('../dtos/CreateInvitationDTO');
const ViewInvitationDTO = require('../dtos/ViewInvitationDTO');
const InvitationService = require('../services/InvitationService');

class InvitationController {
    async create(req, res) {
        try {
            const invitationData = new CreateInvitationDTO({
                fromId: req.user?.id || 777,
                toId: req.body.toId
            });

            const invitation = await InvitationService.send(invitationData);
            res.status(201).json(new ViewInvitationDTO(invitation));
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getMyInvitations(req, res) {
        try {
            const list = await InvitationService.getByUserId(req.user.id);
            
            const formattedList = list.map(item => new ViewInvitationDTO(item));
            
            res.json(formattedList);
        } catch (error) {
            res.status(500).json({ error: "Помилка сервера" });
        }
    }
}

module.exports = new InvitationController();