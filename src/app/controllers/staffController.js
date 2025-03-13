const pool = require('../../config/db/index.js');

class staffController {
    
    // [GET] Path: ./staff/catalogManage
    catalogManage(req, res) {
        res.render('staffCatalog');
    }
    // [GET] Path: ./staff/catalogAdd
    catalogAdd(req, res) {
        res.render('staffCatalogAdd');
    }
    // [GET] Path: ./staff/catalogUpdate
    catalogUpdate(req,res) {
        const { type, content } = req.params;
        res.render('staffCatalogUpdate');
    }
    // [GET] Path: ./staff/offerApprove
    offerApprove(req,res) {
        res.render('staffOfferApprove');
    }
    // [GET] Path: ./staff/staffHome
    staffHome(req,res) {
        res.render('staffHome');
    }
    // [GET] Lấy danh sách sách
    async getBooks(req, res) {
        try {
            const result = await pool.query('SELECT book_code, book_title, book_author, book_img, book_weight, category_id, book_img, book_provider, book_publisher, book_cover, publish_date, language, book_size, description, rating_score FROM book');
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }

    // [GET] Lấy danh sách sách sau khi tìm kiếm, lọc hoặc sắp xếp
    async searchBooks(req, res)  {
        const { query, category_id, year, sort_by, sort_order } = req.query;
    
        // Xây dựng điều kiện WHERE cho lọc
        const filters = [];
        const values = [];
        let index = 1;
    
        if (query) {
            filters.push(`(LOWER(book_title) LIKE LOWER($${index}) OR LOWER(book_author) LIKE LOWER($${index}))`);
            values.push(`%${query}%`);
            index++;
        }
    
        if (category_id) {
            filters.push(`category_id = $${index}`);
            values.push(category_id);
            index++;
        }
    
        if (year) {
            filters.push(`EXTRACT(YEAR FROM publish_date) = $${index}`);
            values.push(year);
            index++;
        }
    
        // Tạo câu truy vấn sắp xếp
        let orderBy = '';
        if (sort_by) {
            const validSortFields = ['publish_date', 'rating_score'];
            const validSortOrder = ['asc', 'desc'];
            if (validSortFields.includes(sort_by) && (!sort_order || validSortOrder.includes(sort_order.toLowerCase()))) {
                orderBy = `ORDER BY ${sort_by} ${sort_order ? sort_order.toUpperCase() : 'ASC'}`;
            }
        }
    
        // Kết hợp các điều kiện
        const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
        const queryString = `
            SELECT * 
            FROM book 
            ${whereClause} 
            ${orderBy}
        `;
    
        try {
            const result = await pool.query(queryString, values);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error searching and filtering books:', error);
            res.status(500).json({ message: 'Lỗi khi tìm kiếm sách' });
        }
    };

    // [GET] Lấy danh sách danh mục
    async getCategories(req, res)  {
        try {
            const result = await pool.query('SELECT category_id, category_name FROM category');
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    };

    // [POST] Thêm sách mới
    async addBook(req, res) {
        const {
            title,
            author,
            weight,
            category_id,
            img,
            provider,
            publisher,
            cover,
            publish_date,
            language,
            size,
            description,
            rating_score,
        } = req.body;

        try {
            const result = await pool.query(
                `INSERT INTO book (
                    book_title, 
                    book_author, 
                    book_weight, 
                    category_id, 
                    book_img, 
                    book_provider, 
                    book_publisher, 
                    book_cover, 
                    publish_date, 
                    language, 
                    book_size, 
                    description, 
                    rating_score
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
                RETURNING *`,
                [
                    title, author, weight, category_id, img, provider, publisher, cover,
                    publish_date, language, size, description, rating_score,
                ]
            );
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error adding book:', error);
            res.status(500).send('Server error');
        }
    }

    // [PUT] Cập nhật thông tin sách
    async updateBook(req, res) {
        const { book_code } = req.params;
        const {
            category_id,
            book_img,
            book_title,
            book_provider,
            book_publisher,
            book_author,
            book_cover,
            publish_date,
            language,
            book_weight,
            book_size,
            description,
            rating_score,
        } = req.body;

        try {
            const result = await pool.query(
                `UPDATE book SET 
                    category_id = $1,
                    book_img = $2,
                    book_title = $3,
                    book_provider = $4,
                    book_publisher = $5,
                    book_author = $6,
                    book_cover = $7,
                    publish_date = $8,
                    language = $9,
                    book_weight = $10,
                    book_size = $11,
                    description = $12,
                    rating_score = $13
                WHERE book_code = $14
                RETURNING *`,
                [
                    category_id,
                    book_img,
                    book_title,
                    book_provider,
                    book_publisher,
                    book_author,
                    book_cover,
                    publish_date,
                    language,
                    book_weight,
                    book_size,
                    description,
                    rating_score,
                    book_code,
                ]
            );

            if (result.rowCount === 0) {
                return res.status(404).send('Book not found');
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating book:', error);
            res.status(500).send('Server error');
        }
    }

    // [DELETE] Xoá sách
    async deleteBook(req, res) {
        const { book_code } = req.params;

        try {
            const result = await pool.query('DELETE FROM book WHERE book_code = $1 RETURNING *', [book_code]);
            if (result.rowCount === 0) {
                return res.status(404).send('Book not found');
            }

            res.status(200).send({ message: 'Book deleted successfully' });
        } catch (error) {
            console.error('Error deleting book:', error);
            res.status(500).send('Server error');
        }
    }

    // [GET] Lấy danh sách offer
    async getOffers(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    offer.offer_id,
                    offer.book_img,
                    offer.book_code,
                    offer.book_title,
                    offer.book_author,
                    offer.book_category,
                    offer.language,
                    offer.publish_date,
                    offer.base_price,
                    offer.number_of_discount,
                    offer.status,
                    publisher.publisher_name
                FROM offer
                LEFT JOIN publisher ON offer.publisher_id = publisher.publisher_id
            `);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching offers:', error);
            res.status(500).send('Server error');
        }
    }

    // [GET] Lấy danh sách offer theo tiêu đề, tác giả hoặc lọc theo nhà xuất bản
    async searchOffers(req, res)  {
        const { query = '', publisher = '' } = req.query;
      
        try {
          const result = await pool.query(
            `
            SELECT 
              offer.offer_id,
              offer.book_img,
              offer.book_title,
              offer.book_author,
              offer.book_category,
              offer.language,
              offer.publish_date,
              offer.base_price,
              offer.status,
              publisher.publisher_name
            FROM offer
            LEFT JOIN publisher ON offer.publisher_id = publisher.publisher_id
            WHERE ($1 = '' OR offer.book_title ILIKE $1 OR offer.book_author ILIKE $1)
               AND ($2 = '' OR publisher.publisher_name = $2)`,
            [ `%${query}%`, publisher ]
          );
      
          res.json(result.rows);
        } catch (error) {
          console.error('Error during search:', error);
          res.status(500).send('Internal Server Error');
        }
    }

    // [GET] lấy danh sách nhà xuất bản
    async getPublisherName(req, res)  {
        try {
            const result = await pool.query('SELECT DISTINCT publisher_name FROM publisher');
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách nhà xuất bản:', error);
            res.status(500).send('Lỗi server');
        }
    }

    // [PUT] Cập nhật trạng thái offer
    async updateOfferStatus(req, res) {
        const { offer_id } = req.params;
        const { status } = req.body;

        if (!['APPROVED', 'DENIED'].includes(status)) {
            return res.status(400).send('Invalid status');
        }

        try {
            const result = await pool.query(
                `UPDATE offer 
                 SET status = $1 
                 WHERE offer_id = $2 
                 RETURNING *`,
                [status, offer_id]
            );

            if (result.rowCount === 0) {
                return res.status(404).send('Offer not found');
            }

            // Lấy lại thông tin đầy đủ bao gồm publisher_name
            const offerWithPublisher = await pool.query(`
                SELECT 
                    offer.offer_id,
                    offer.book_img,
                    offer.book_code,
                    offer.book_title,
                    offer.book_author,
                    offer.book_category,
                    offer.language,
                    offer.publish_date,
                    offer.base_price,
                    offer.number_of_discount,
                    offer.status,
                    publisher.publisher_name
                FROM offer
                LEFT JOIN publisher ON offer.publisher_id = publisher.publisher_id
                WHERE offer.offer_id = $1
            `, [offer_id]);

            res.json(offerWithPublisher.rows[0]);
        } catch (error) {
            console.error('Error updating offer status:', error);
            res.status(500).send('Server error');
        }
    }

}   

module.exports = new staffController;