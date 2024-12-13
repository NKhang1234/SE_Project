const express = require('express');
const router = express.Router();

const staffController = require('../app/controllers/staffController.js');

router.get('/catalogManage', staffController.catalogManage);
router.get('/catalogAdd', staffController.catalogAdd);
router.get('/catalogUpdate', staffController.catalogUpdate);
router.get('/offerApprove', staffController.offerApprove);
router.get('/staffHome', staffController.staffHome);

// Route quản lý danh sách sách
router.get('/api/catalogManage', staffController.getBooks);

// Route tìm kiếm, lọc hoặc sắp xếp sách
router.get('/api/catalogManage/search', staffController.searchBooks);

// Route lấy danh sách categories
router.get('/api/catalogManage/category', staffController.getCategories);

// Route thêm sách mới
router.post('/api/catalogAdd', staffController.addBook);

// Route cập nhật thông tin sách
router.put('/api/catalogUpdate/:book_code', staffController.updateBook);

// Route xoá sách
router.delete('/api/catalogDelete/:book_code', staffController.deleteBook);

// Route lấy danh sách offer và thông tin publisher
router.get('/api/offerList', staffController.getOffers);

// Route tìm kiếm offer theo tiêu đề, tác giả hoặc lọc theo nhà xuất bản
router.get('/api/offerList/search', staffController.searchOffers);

// Route lấy danh sách nhà xuất bản
router.get('/api/offerList/publishers', staffController.getPublisherName);

// Route cập nhật trạng thái offer
router.put('/api/offerApprove/:offer_id/status', staffController.updateOfferStatus);


module.exports = router;