const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const invitationRoutes = require('./invitation.routes');

router.use('/users', userRoutes);
router.use('/invitations', invitationRoutes);

module.exports = router;