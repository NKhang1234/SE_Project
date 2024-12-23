const db = require('../Models');
const publisher_id = 4;

class publisherController {
    // [GET] publisher/offerStatus
    async offerStatus(req, res) {
        try {
            // publisher_id = 1;
            const offers = await db.sequelize.query(
                `SELECT * 
                FROM offer
                JOIN (SELECT publisher_id, offer_id, ARRAY_AGG(discount) AS discount
                    FROM discount
                    GROUP BY publisher_id, offer_id) AS discount 
                ON offer.publisher_id = discount.publisher_id 
                AND offer.offer_id = discount.offer_id
                WHERE offer.publisher_id = ${req.session.userId}`,
                {
                    type: db.Sequelize.QueryTypes.SELECT, // Chỉ định kiểu truy vấn là SELECT để trả về kết quả dạng mảng
                }
            );
            res.json(offers);
        } catch (error) {
            console.error('Error saving publisher:', error);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: error.message, // Chi tiết lỗi (nếu cần thiết)
            });
        }
    }

    // [GET] publisher/offerStatus/:type/:content
    async offerStatusFilter(req, res) {
        const { type, content } = req.params; // Lấy các tham số từ URL hoặc query string
        let publisher_id = req.session.userId;
        let whereConditions = `WHERE offer.publisher_id = :publisher_id`; // Điều kiện mặc định là publisher_id

        // Xử lý điều kiện lọc theo type và content
        if (type && content) {
            if (type === 'title') {
                whereConditions += ` AND offer.book_title LIKE %:content%`; // Lọc theo title
            } else if (type === 'category') {
                whereConditions += ` AND offer.book_category LIKE %:content%`; // Lọc theo category
            } else if (type === 'discount') {
                whereConditions += ` AND discount.discount > :content`; // Lọc theo discount lớn hơn content
            } else if (type === 'status') {
                whereConditions += ` AND offer.status = :content`; // Lọc theo status
            } else if (type === 'ISBN') {
                whereConditions += ` AND offer.book_code LIKE %:content%`; // Lọc theo ISBN (book_code)
            }
        }

        try {
            const offers = await db.sequelize.query(
                `SELECT * 
                FROM offer
                JOIN discount 
                ON offer.publisher_id = discount.publisher_id 
                AND offer.offer_id = discount.offer_id
                ${whereConditions}`, // Thêm các điều kiện lọc vào câu truy vấn
                {
                    replacements: {
                        publisher_id, // Publisher ID từ request
                        content: content, // Dùng % để tìm kiếm theo kiểu LIKE
                    },
                    type: db.Sequelize.QueryTypes.SELECT, // Chỉ định kiểu truy vấn là SELECT để trả về kết quả dạng mảng
                }
            );

            res.json(offers); // Trả về kết quả tìm được
        } catch (error) {
            console.error('Error fetching offers:', error);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: error.message, // Bao gồm chi tiết lỗi để debug
            });
        }
    }

    // [GET] publisher/add
    async getAddPage(req, res) {
        res.send('addPage');
    }

    // [POST] publisher/add
    async add(req, res) {
        try {
            console.log(req.body);
            const {
                book_img,
                book_code,
                book_title,
                book_author,
                book_category,
                language,
                publish_date,
                base_price,
                number_of_discount,
                discount,
            } = req.body;

            // Kiểm tra các giá trị cần thiết
            if (!book_title || !book_author) {
                return res.status(400).send('Missing required fields');
            }

            // Chèn dữ liệu vào bảng
            const [offerResult] = await db.sequelize.query(
                `INSERT INTO offer 
                (publisher_id, book_img, book_code, book_title, book_author, book_category, language, publish_date, base_price, number_of_discount, status) 
                VALUES 
                (:publisher_id, :book_img, :book_code, :book_title, :book_author, :book_category, :language, :publish_date, :base_price, :number_of_discount, :status)
                RETURNING *`,
                {
                    replacements: {
                        publisher_id: req.session.userId || 4,
                        book_img: book_img || null, // If no image, set to null
                        book_code: book_code || null, // If no book code, set to null
                        book_title: book_title,
                        book_author: book_author,
                        book_category: book_category || null,
                        language: language || 'Tiếng Việt', // Default language
                        publish_date:
                            publish_date ||
                            new Date().toISOString().slice(0, 10), // Default to current date
                        base_price: base_price || 0, // Default base price
                        number_of_discount: number_of_discount || 0, // Default discount number
                        status: 'WAITING', // Default status
                    },
                }
            );
            const offerId = offerResult[0].offer_id;
            if (Array.isArray(discount) && discount.length > 0) {
                for (const item of discount) {
                    await db.sequelize.query(
                        `INSERT INTO discount (publisher_id ,offer_id, discount)
                        VAlUES (?, ?, ?)`,
                        {
                            replacements: [
                                req.session.userId,
                                offerId,
                                item.value,
                            ],
                        }
                    );
                }
            }
            // Redirect hoặc render thông báo thành công
            res.status(200).send('Thêm sách và giảm giá thành công');
            // req.flash('success', 'Thêm offer thành công!');
            // res.redirect('/publisher/offerStatus'); // Chuyển hướng đến trang danh sách nhà xuất bản
        } catch (error) {
            console.error('Error saving publisher:', error);
            // req.flash('error', 'Lỗi khi thêm sách. Vui lòng thử lại.');
            // res.redirect('/publisher/offerStatus');
            res.status(500).send('Internal Server Error');
        }
    }

    // [GET] publisher/edit/:id
    async editPage(req, res) {
        try {
            const { id } = req.params;
            const offers = await db.sequelize.query(
                `SELECT * 
                FROM offer
                JOIN (SELECT publisher_id, offer_id, ARRAY_AGG(discount) AS discount
                    FROM discount
                    GROUP BY publisher_id, offer_id) AS discount 
                ON offer.publisher_id = discount.publisher_id 
                AND offer.offer_id = discount.offer_id
                WHERE offer.publisher_id = ${req.session.userId} AND offer.offer_id = ${id}`,
                {
                    type: db.Sequelize.QueryTypes.SELECT, // Chỉ định kiểu truy vấn là SELECT để trả về kết quả dạng mảng
                }
            );
            res.json(offers[0]);
        } catch (error) {
            console.error('Error saving publisher:', error);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: error.message, // Chi tiết lỗi (nếu cần thiết)
            });
        }
    }
    // [PUT] publisher/edit
    async edit(req, res) {
        try {
            console.log(req.body);
            const {
                offer_id,
                book_img,
                book_code,
                book_title,
                book_author,
                book_category,
                language,
                publish_date,
                base_price,
                number_of_discount,
                discount,
            } = req.body;

            // Kiểm tra các giá trị cần thiết
            if (!book_title || !book_author || !offer_id) {
                return res.status(400).send('Missing required fields');
            }

            // Cập nhật dữ liệu vào bảng offer
            const [updateResult] = await db.sequelize.query(
                `UPDATE offer 
                SET book_img = :book_img, 
                    book_code = :book_code, 
                    book_title = :book_title, 
                    book_author = :book_author, 
                    book_category = :book_category, 
                    language = :language, 
                    publish_date = :publish_date, 
                    base_price = :base_price, 
                    number_of_discount = :number_of_discount
                WHERE offer_id = :offer_id AND publisher_id = :publisher_id`,
                {
                    replacements: {
                        publisher_id: req.session.userId || 4, // Chỉnh sửa theo publisher_id (giả sử bạn đã có publisher_id)
                        offer_id: offer_id, // Dùng offer_id từ request body để cập nhật đúng bản ghi
                        book_img: book_img || null,
                        book_code: book_code || null,
                        book_title: book_title,
                        book_author: book_author,
                        book_category: book_category || null,
                        language: language || 'Tiếng Việt', // Ngôn ngữ mặc định
                        publish_date:
                            publish_date ||
                            new Date().toISOString().slice(0, 10),
                        base_price: base_price || 0,
                        number_of_discount: number_of_discount || 0,
                    },
                }
            );

            // Kiểm tra nếu không có bản ghi nào được cập nhật
            if (updateResult[0] === 0) {
                return res
                    .status(404)
                    .send('Offer not found or no changes made');
            }

            // Xoá tất cả các discount cũ và thêm mới
            await db.sequelize.query(
                `DELETE FROM discount WHERE offer_id = :offer_id`,
                {
                    replacements: { offer_id: offer_id },
                }
            );

            // Thêm các discount mới nếu có
            if (Array.isArray(discount) && discount.length > 0) {
                for (const item of discount) {
                    await db.sequelize.query(
                        `INSERT INTO discount (publisher_id ,offer_id, discount)
                        VALUES (?, ?, ?)`,
                        {
                            replacements: [
                                req.session.userId,
                                offer_id,
                                item.value,
                            ],
                        }
                    );
                }
            }

            // Thành công
            // req.flash('success', 'Sửa offer thành công!');
            // res.redirect('/publisher/offerStatus'); // Chuyển hướng đến trang danh sách nhà xuất bản
            res.status(200).send('Chỉnh sửa sách và giảm giá thành công');
        } catch (error) {
            console.error('Error updating offer:', error);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: error.message, // Chi tiết lỗi (nếu cần thiết)
            });
            // req.flash('error', 'Lỗi khi sửa sách. Vui lòng thử lại.');
            // res.redirect('/publisher/offerStatus');
        }
    }
}

module.exports = new publisherController();
