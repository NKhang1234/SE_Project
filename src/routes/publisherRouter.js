const express = require('express');
const router = express.Router();

const publisherController = require('../app/controllers/publisherController.js');

router.get('/offer', publisherController.offer);
router.get('/offerStatus', publisherController.offerStatus);

module.exports = router;