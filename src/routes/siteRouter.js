const express = require('express');
const router = express.Router();

const siteController = require('../app/controllers/siteController.js');

// Routes authentication
router.post('/register', siteController.register);
router.post('/login', siteController.login);
router.post('/logout', siteController.logout);
router.get('/check-session', siteController.checkSession);

router.get('/register', siteController.viewRegister);
router.get('/account', siteController.viewAccount)
router.get('/login', siteController.viewLogin);

module.exports = router;