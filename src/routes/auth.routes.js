const express = require('express');
const router = express.Router();
const AuthCtrl = require('../controllers/AuthController');

router.post('/login', AuthCtrl.login);

module.exports = router;