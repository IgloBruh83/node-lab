const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.post('/register', UserController.register);
router.get('/profile/:id', UserController.getProfile);
router.put('/profile/:id', UserController.updateProfile);

module.exports = router;