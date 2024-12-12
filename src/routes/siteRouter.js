const express = require('express');
const router = express.Router();

const siteController = require('../app/controllers/siteController.js');

// Routes authentication
router.post('/register', siteController.register);
router.post('/login', siteController.login);
router.post('/logout', siteController.logout);
router.get('/check-session', siteController.checkSession);

router.get('/register', siteController.viewRegister);
router.get('/account', siteController.account);
router.get('/', siteController.viewLogin);
router.post('/change-password', siteController.changePassword);
router.post('/change-email', siteController.changeEmail);
router.post('/change-avatar', siteController.changeAvatar);

module.exports = router;