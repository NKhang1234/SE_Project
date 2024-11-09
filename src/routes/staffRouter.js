const express = require('express');
const router = express.Router();

const staffController = require('../app/controllers/staffController.js');

router.get('/catalogManage', staffController.catalogManage);
router.get('/memberManage', staffController.memberManage);
router.get('/stockManage', staffController.stockManage);
router.get('/checkInOut', staffController.checkInOut);

module.exports = router;