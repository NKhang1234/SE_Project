const express = require('express');
const router = express.Router();

const userController = require('../app/controllers/userController.js');

router.get('/search', userController.search);
router.get('/caterogy/:slug', userController.viewCaterogy);
router.get('/book/:slug', userController.viewBook);
router.get('/', userController.index);
router.get('/mybook', userController.myBook);

module.exports = router;