const express = require('express');
const router = express.Router();

const staffController = require('../app/controllers/staffController.js');

router.get('/catalogManage', staffController.catalogManage);
router.get('/catalogAdd', staffController.catalogAdd);
router.get('/catalogUpdate', staffController.catalogUpdate);
router.get('/offerApprove', staffController.offerApprove);

module.exports = router;