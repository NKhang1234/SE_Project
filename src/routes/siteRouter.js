const express = require('express');
const router = express.Router();

const siteController = require('../app/controllers/siteController.js');

router.get('/register', siteController.register);
router.get('/account', siteController.account)
router.get('/', siteController.login);
router.post('/change-password', siteController.changePassword);
router.post('/change-email', siteController.changeEmail);
router.post('/change-avatar', siteController.changeAvatar);

module.exports = router;