const express = require('express');
const router = express.Router();
const InvitationCtrl = require('../controllers/InvitationController');

router.post('/', InvitationCtrl.create);
router.get('/user/:userId', InvitationCtrl.getUserInvitations);
router.patch('/:id/status', InvitationCtrl.updateStatus);
router.delete('/:id', InvitationCtrl.delete);

module.exports = router;