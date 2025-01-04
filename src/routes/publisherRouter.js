const express = require("express");
const router = express.Router();
const multer = require('multer');

const publisherController = require('../app/controllers/publisherController.js');
const site = require('../app/controllers/siteController.js');
const upload = multer({ dest: 'src/resources/img' });

router.use(site.publisherAuthenticated);
// Test upload image
router.post('/upload', upload.single('image'), publisherController.upload);
// Xem danh sach cac offer
router.get("/offerStatus", publisherController.offerStatus);
router.get(
  "/offerStatus/:type/:content",
  publisherController.offerStatusFilter
);

// them mot offer
router.post('/add', upload.single('book_img'), publisherController.add);

// neu co add page
router.get("/add", publisherController.getAddPage);

// sua mot offer
router.get("/edit/:id", publisherController.editPage);
router.post("/edit", upload.single("book_img"), publisherController.edit);

module.exports = router;
