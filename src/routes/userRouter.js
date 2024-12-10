const express = require('express');
const router = express.Router();

const userController = require('../app/controllers/userController.js');

router.get('/search', userController.search);
router.get('/myBook', userController.myBook);
router.get('/category/:slug', userController.viewCategory);
router.get('/book/:slug', userController.viewBook);
router.get('/', userController.index);
router.post('/borrow-book', userController.borrowBook);
router.post('/like-comment', userController.likeComment);
router.post('/dislike-comment', userController.dislikeComment);
router.post('/add-comment', userController.addComment); 
router.post('/rate-book', userController.rateBook);    
router.post('/edit-comment', userController.editComment);
router.post('/delete-comment', userController.deleteComment);
router.post('/add-to-favorite', userController.addFavorite);
router.post('/remove-from-favorite', userController.removeFavorite);

module.exports = router;