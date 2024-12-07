const express = require('express');
const router = express.Router();

const publisherController = require('../app/controllers/publisherController.js');

// Xem danh sach cac offer
router.get('/offerStatus', publisherController.offerStatus);

// them mot offer
router.post('/add', publisherController.add);
// neu co add page
router.get('/add', publisherController.getAddPage);

// sua mot offer
router.get('/edit/:id', publisherController.editPage);
router.put('/edit', publisherController.edit);

module.exports = router;
