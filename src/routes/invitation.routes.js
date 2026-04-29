const express = require('express');
const router = express.Router();
const InvitationController = require('../controllers/InvitationController');

router.post('/', InvitationController.create);
router.get('/my', InvitationController.getMyInvitations);

module.exports = router;