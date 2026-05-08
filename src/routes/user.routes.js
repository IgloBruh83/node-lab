const router = require('express').Router();
const UserCtrl = require('../controllers/UserController');

router.post('/', UserCtrl.create);
router.get('/', UserCtrl.getAll);
router.get('/:id', UserCtrl.getById);
router.put('/:id', UserCtrl.update);
router.delete('/:id', UserCtrl.delete);

module.exports = router;