const db = require('../Models');
const moment = require('moment'); // thư viện chỉnh lại format timestamp

class userController {
    
    // [GET] Path: ./user/    // TODO: Thêm cách để người dùng thêm thể loại yêu thích
    async index(req, res) {
        try {
            // 1. Truy Vấn Tất Cả Các Thể Loại Sách
            const categories = await db.sequelize.query(
                `SELECT 
                    category_id, 
                    category_name,
                    category_img,
                    slug
                FROM 
                    category 
                ORDER BY 
                    category_name ASC`,
                {
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            // 2. Truy Vấn 6 Cuốn Sách Nổi Bật (Random)
            const featuredBooks = await db.sequelize.query(
                `SELECT 
                    book_code, 
                    book_title, 
                    book_img 
                FROM 
                    book 
                ORDER BY 
                    RANDOM() 
                LIMIT 6`,
                {
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            // 3. Render Trang Index Với Dữ Liệu
            res.render('userHomepage', { // Đảm bảo tên template đúng
                categories,
                featuredBooks
            });
        } catch (error) {
            console.error('Error fetching index data:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    // [GET] Path: ./user/mybook
    async myBook(req, res) {
        console.log("sdfsdfsdfsdfsdfsdf", req.session.userId);
        try {
            const user_id = req.session.userId; 
            console.log("sdfsdfsdfsdfsdfsdf", user_id);
            
            // 1. Truy Vấn Sách Đã Mượn
            const borrowedBooks = await db.sequelize.query(
                `SELECT 
                    bb.borrow_date,
                    bb.return_date,
                    b.book_code,
                    b.book_title,
                    b.book_img,
                    c.category_name,
                    AVG(r.rating_score)::NUMERIC(10, 2) AS average_rating,
                    COUNT(r.user_id) AS total_ratings
                FROM 
                    borrowing_books AS bb
                JOIN 
                    book AS b ON bb.book_code = b.book_code
                JOIN 
                    category AS c ON b.category_id = c.category_id
                LEFT JOIN 
                    rating AS r ON b.book_code = r.book_code
                WHERE 
                    bb.member_id = 8
                GROUP BY 
                    bb.book_code, b.book_code, c.category_name, bb.borrow_date, bb.return_date
                ORDER BY 
                    bb.borrow_date DESC`,
                {
                    replacements: { user_id: user_id },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );
    
            // 2. Truy Vấn Sách Yêu Thích
            const favoriteBooks = await db.sequelize.query(
                `SELECT 
                    fb.book_code,
                    b.book_code,
                    b.book_title,
                    b.book_img,
                    c.category_name,
                    AVG(r.rating_score)::NUMERIC(10, 2) AS average_rating,
                    COUNT(r.user_id) AS total_ratings
                FROM 
                    favorite_books AS fb
                JOIN 
                    book AS b ON fb.book_code = b.book_code
                JOIN 
                    category AS c ON b.category_id = c.category_id
                LEFT JOIN 
                    rating AS r ON b.book_code = r.book_code
                WHERE 
                    fb.member_id = 8
                GROUP BY 
                    b.book_code, c.category_name, fb.book_code`,
                {
                    replacements: { user_id: user_id },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );
    
            // 3. Truy Vấn Thể Loại Yêu Thích
            const favoriteCategories = await db.sequelize.query(
                `SELECT 
                    fc.member_id,
                    fc.category_id,
                    c.category_name,
                    c.category_img,
                    c.slug,
                    AVG(r.rating_score)::NUMERIC(10, 2) AS average_rating,
                    COUNT(r.user_id) AS total_ratings
                FROM 
                    favorite_categories AS fc
                JOIN 
                    category AS c ON fc.category_id = c.category_id
                LEFT JOIN 
                    book AS b ON c.category_id = b.category_id
                LEFT JOIN 
                    rating AS r ON b.book_code = r.book_code
                WHERE 
                    fc.member_id = :user_id
                GROUP BY 
                    fc.member_id, fc.category_id, c.category_name, c.category_img, c.slug
                ORDER BY 
                    c.category_name ASC`,
                {
                    replacements: { user_id: user_id },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );
            
            // 4. Truy Vấn Tất Cả Thể Loại Cho Thanh Tìm Kiếm
            const allCategories = await db.sequelize.query(
                `SELECT * FROM category ORDER BY category_name ASC`,
                {
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );
            
            res.render('userMyBook', {
                borrowedBooks,
                favoriteBooks,
                favoriteCategories,
                allCategories,
                user_id
            });
    
        } catch (error) {
            console.log('Error fetching dashboard data:', error);
            res.status(500).send('Internal Server Error');
        }
    }    

    // [GET] Path: ./user/search
    async search(req, res) {
        try {
            const user_id =  8; // Thay 8 bằng user_id từ session
            const { book_title, category_id } = req.query;

            // Tạo điều kiện tìm kiếm
            let conditions = [];
            let replacements = {};

            if (book_title) {
                conditions.push(`b.book_title ILIKE :book_title`);
                replacements.book_title = `%${book_title}%`;
            }

            if (category_id) {
                conditions.push(`b.category_id = :category_id`);
                replacements.category_id = category_id;
            }

            let whereClause = '';
            if (conditions.length > 0) {
                whereClause = `WHERE ${conditions.join(' OR ')}`;
            }

            // Truy vấn sách theo tiêu chí tìm kiếm
            const searchedBooks = await db.sequelize.query(
                `SELECT 
                    b.book_code,
                    b.book_title,
                    b.book_img,
                    c.category_name,
                    AVG(r.rating_score)::NUMERIC(10, 2) AS average_rating,
                    COUNT(r.user_id) AS total_ratings
                FROM 
                    book AS b
                JOIN 
                    category AS c ON b.category_id = c.category_id
                LEFT JOIN 
                    rating AS r ON b.book_code = r.book_code
                ${whereClause}
                GROUP BY 
                    b.book_code, c.category_name
                ORDER BY 
                    b.book_title ASC`,
                {
                    replacements,
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            // Truy vấn tất cả các category để hiển thị trong kết quả tìm kiếm
            const allCategories = await db.sequelize.query(
                `SELECT * FROM category ORDER BY category_name ASC`,
                {
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            res.render('userResult', {
                searchedBooks,
                allCategories,
                searchParams: { book_title, category_id },
                user_id
            });

        } catch (error) {
            console.error('Error during search:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    // [GET] Path: ./user/caterogy/:slug
    async viewCategory(req, res) {
        try {
            const category_slug = req.params.slug; // Lấy slug của category từ URL
            const user_id = req.session.userId; // Lấy từ session, nếu không có thì null

            // Truy vấn thông tin chi tiết của category dựa vào slug
            const category = await db.sequelize.query(
                `SELECT * FROM category WHERE slug = :slug`,
                {
                    replacements: { slug: category_slug },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            if (category.length === 0) {
                return res.status(404).send('Category not found');
            }

            const category_id = category[0].category_id;

            // Truy vấn các sách thuộc category này, bao gồm averageRating, totalRatings và phân bố đánh giá
            const books = await db.sequelize.query(
                `SELECT 
                    b.*, 
                    c.category_name,
                    AVG(r.rating_score)::NUMERIC(10,2) AS average_rating,
                    COUNT(r.user_id) AS total_ratings
                 FROM 
                    book AS b 
                 JOIN 
                    category AS c 
                 ON 
                    b.category_id = c.category_id 
                 LEFT JOIN 
                    rating AS r 
                 ON 
                    b.book_code = r.book_code 
                 WHERE 
                    b.category_id = :category_id
                 GROUP BY 
                    b.book_code, c.category_name`,
                {
                    replacements: { category_id },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            // Truy vấn tất cả các category khác để hiển thị
            const allCategories = await db.sequelize.query(
                `SELECT * FROM category WHERE slug != :slug`,
                {
                    replacements: { slug: category_slug },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            res.render('userCategories', {
                category: category[0],
                books,
                allCategories,
                user_id
            });

        } catch (error) {
            console.error('Error fetching category details:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    // [GET] Path: ./user/book/:slug
    async viewBook(req, res) {
        try {
            const book_code = req.params.slug; // Lấy mã sách từ URL
            const user_id = req.session.userId; // đang hardcode, sau này sẽ lấy từ session

            // Truy vấn thông tin chi tiết của sách
            const book = await db.sequelize.query(
                `SELECT 
                    b.*, 
                    c.category_name AS book_category 
                FROM 
                    book AS b 
                JOIN 
                    category AS c 
                ON 
                    b.category_id = c.category_id 
                WHERE 
                    b.book_code = :book_code`,
                {
                    replacements: { book_code },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            // Truy vấn sách liên quan
            const relatedBooks = await db.sequelize.query(
                `SELECT 
                    rb.related_book_code, 
                    b.book_title, 
                    b.book_img 
                FROM 
                    related_book AS rb 
                JOIN 
                    book AS b 
                ON 
                    rb.related_book_code = b.book_code 
                WHERE 
                    rb.book_code = :book_code`,
                {
                    replacements: { book_code },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            // Truy vấn bình luận
            const comments = await db.sequelize.query(
                `SELECT 
                    c.content, 
                    c.timestamp, 
                    c.number_of_like, 
                    c.number_of_dislike, 
                    ua.username AS user_name,
                    c.user_id AS comment_user_id,
                    ua.avatar_image AS user_avatar
                FROM 
                    comment AS c 
                JOIN 
                    member AS m 
                ON 
                    c.user_id = m.member_id 
                JOIN 
                    user_account as ua
                ON 
                    ua.user_id = m.member_id
                WHERE 
                    c.book_code = :book_code 
                ORDER BY 
                    c.timestamp DESC`,
                {
                    replacements: { book_code },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            // 4. Tính tổng số bình luận
            const totalComments = comments.length;

            // Kiểm tra xem người dùng đã mượn sách này chưa 
            let hasBorrowed = false;
            if (user_id) {
                const existingBorrow = await db.sequelize.query(
                    `SELECT * FROM borrowing_books 
                     WHERE member_id = :user_id 
                     AND book_code = :book_code `,
                    {
                        replacements: { user_id: user_id, book_code },
                        type: db.Sequelize.QueryTypes.SELECT
                    }
                );

                hasBorrowed = existingBorrow.length > 0;
            }

            // Tính điểm đánh giá trung bình và tổng số đánh giá
            const rating = await db.sequelize.query(
                `SELECT 
                    AVG(r.rating_score) AS average_rating, 
                    COUNT(r.user_id) AS total_ratings 
                FROM 
                    rating AS r 
                WHERE 
                    r.book_code = :book_code`,
                {
                    replacements: { book_code },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            // Lấy điểm đánh giá của người dùng hiện tại
            let userRating = null;
            if (user_id) {
                const userRatingResult = await db.sequelize.query(
                    `SELECT rating_score 
                    FROM rating 
                    WHERE user_id = :user_id 
                    AND book_code = :book_code`,
                    {
                        replacements: { user_id: user_id, book_code },
                        type: db.Sequelize.QueryTypes.SELECT
                    }
                );
                
                userRating = userRatingResult.length > 0 ? userRatingResult.rating_score : null;
            }

            // Kiểm tra xem sách có nằm trong danh sách yêu thích của người dùng không
            let isFavorite = false;
            if (user_id) {
                const favorite = await db.sequelize.query(
                    `SELECT 
                        * 
                    FROM 
                        favorite_books 
                    WHERE 
                        member_id = :user_id 
                    AND 
                        book_code = :book_code`,
                    {
                        replacements: { user_id: user_id, book_code },
                        type: db.Sequelize.QueryTypes.SELECT
                    }
                );
                isFavorite = favorite.length > 0;
            }

            // Truy vấn số lượng đánh giá cho từng mức sao
            const ratingCounts = await db.sequelize.query(
                `SELECT 
                    rating_score, COUNT(*) AS count 
                FROM 
                    rating 
                WHERE 
                    book_code = :book_code 
                GROUP BY 
                    rating_score 
                ORDER BY 
                    rating_score ASC`,
                {
                    replacements: { book_code },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            // Chuyển đổi kết quả thành một đối tượng dễ sử dụng trong view
            const ratingSummary = {
                rating1: 0,
                rating2: 0,
                rating3: 0,
                rating4: 0,
                rating5: 0
            };

            ratingCounts.forEach(r => {
                const key = `rating${r.rating_score}`;
                ratingSummary[key] = parseInt(r.count);
            });

            const categories = await db.sequelize.query(
                `SELECT 
                    category_id, 
                    category_name,
                    category_img,
                    slug 
                FROM 
                    category 
                ORDER BY 
                    category_name ASC`,
                {
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );
            // Render kết quả ra view
            res.render('userBookDetail', {
                book: book[0],
                relatedBooks,
                comments,
                totalComments,
                averageRating: rating[0]?.average_rating ? parseFloat(rating[0].average_rating).toFixed(2) : 0,
                totalRatings: rating[0]?.total_ratings || 0,
                userRating,
                isFavorite,
                hasBorrowed,
                ratingSummary,
                user_id,
                categories
            });
        } catch (error) {
            console.error('Error fetching book details:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    // [POST] Path: ./user/like-comment
    async likeComment(req, res) {
        try {
            const user_id = req.session.userId; // Hard code user_id (hoặc lấy từ session nếu có)
            const { comment_user_id, timestamp } = req.body;

            if (!user_id || !comment_user_id || !timestamp) {
                return res.status(400).send('Missing required fields');
            }

            const formattedTimestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');

            // Kiểm tra xem người dùng đã like hoặc dislike comment này chưa
            const [existingReaction] = await db.sequelize.query(
                `SELECT reaction FROM comment_reactions 
                 WHERE user_id = :user_id 
                 AND comment_user_id = :comment_user_id 
                 AND timestamp = :formattedTimestamp`,
                {
                    replacements: { user_id: user_id, comment_user_id, formattedTimestamp },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            if (existingReaction) {
                if (existingReaction.reaction === 'like') {
                    // Nếu đã like, bỏ like
                    await db.sequelize.query(
                        `DELETE FROM comment_reactions 
                         WHERE user_id = :user_id 
                         AND comment_user_id = :comment_user_id 
                         AND timestamp = :formattedTimestamp`,
                        {
                            replacements: { user_id: user_id, comment_user_id, formattedTimestamp },
                            type: db.Sequelize.QueryTypes.DELETE
                        }
                    );
                    // Giảm số lượng like trong bảng comment
                    await db.sequelize.query(
                        `UPDATE comment 
                         SET number_of_like = number_of_like - 1 
                         WHERE user_id = :comment_user_id 
                         AND timestamp = :formattedTimestamp`,
                        {
                            replacements: { comment_user_id, formattedTimestamp },
                            type: db.Sequelize.QueryTypes.UPDATE
                        }
                    );
                } else if (existingReaction.reaction === 'dislike') {
                    // Nếu đã dislike, chuyển thành like
                    await db.sequelize.query(
                        `UPDATE comment_reactions 
                         SET reaction = 'like' 
                         WHERE user_id = :user_id 
                         AND comment_user_id = :comment_user_id 
                         AND timestamp = :formattedTimestamp`,
                        {
                            replacements: { user_id: user_id, comment_user_id, formattedTimestamp },
                            type: db.Sequelize.QueryTypes.UPDATE
                        }
                    );
                    // Tăng số lượng like và giảm số lượng dislike trong bảng comment
                    await db.sequelize.query(
                        `UPDATE comment 
                         SET number_of_like = number_of_like + 1, 
                             number_of_dislike = number_of_dislike - 1 
                         WHERE user_id = :comment_user_id 
                         AND timestamp = :formattedTimestamp`,
                        {
                            replacements: { comment_user_id, formattedTimestamp },
                            type: db.Sequelize.QueryTypes.UPDATE
                        }
                    );
                }
            } else {
                // Nếu chưa có reaction nào, thêm like mới
                await db.sequelize.query(
                    `INSERT INTO comment_reactions (user_id, comment_user_id, timestamp, reaction) 
                     VALUES (:user_id, :comment_user_id, :formattedTimestamp, 'like')`,
                    {
                        replacements: { user_id: user_id, comment_user_id, formattedTimestamp },
                        type: db.Sequelize.QueryTypes.INSERT
                    }
                );
                // Tăng số lượng like trong bảng comment
                await db.sequelize.query(
                    `UPDATE comment 
                     SET number_of_like = number_of_like + 1 
                     WHERE user_id = :comment_user_id 
                     AND timestamp = :formattedTimestamp`,
                    {
                        replacements: { comment_user_id, formattedTimestamp },
                        type: db.Sequelize.QueryTypes.UPDATE
                    }
                );
            }

            res.redirect('back');
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    // [POST] Path: ./user/dislike-comment
    async dislikeComment(req, res) {
        try {
            const user_id = req.session.userId; // Hard code user_id (hoặc lấy từ session nếu có)
            const { comment_user_id, timestamp } = req.body;

            if (!user_id || !timestamp) {
                return res.status(400).send('Missing required fields');
            }

            const formattedTimestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');

            // Kiểm tra xem người dùng đã like hoặc dislike comment này chưa
            const [existingReaction] = await db.sequelize.query(
                `SELECT reaction FROM comment_reactions 
                 WHERE user_id = :user_id 
                 AND comment_user_id = :comment_user_id 
                 AND timestamp = :formattedTimestamp`,
                {
                    replacements: { user_id: user_id, comment_user_id, formattedTimestamp },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            if (existingReaction) {
                if (existingReaction.reaction === 'dislike') {
                    // Nếu đã dislike, bỏ dislike
                    await db.sequelize.query(
                        `DELETE FROM comment_reactions 
                         WHERE user_id = :user_id 
                         AND comment_user_id = :comment_user_id 
                         AND timestamp = :formattedTimestamp`,
                        {
                            replacements: { user_id: user_id, comment_user_id, formattedTimestamp },
                            type: db.Sequelize.QueryTypes.DELETE
                        }
                    );
                    // Giảm số lượng dislike trong bảng comment
                    await db.sequelize.query(
                        `UPDATE comment 
                         SET number_of_dislike = number_of_dislike - 1 
                         WHERE user_id = :comment_user_id 
                         AND timestamp = :formattedTimestamp`,
                        {
                            replacements: { comment_user_id, formattedTimestamp },
                            type: db.Sequelize.QueryTypes.UPDATE
                        }
                    );
                } else if (existingReaction.reaction === 'like') {
                    // Nếu đã like, chuyển thành dislike
                    await db.sequelize.query(
                        `UPDATE comment_reactions 
                         SET reaction = 'dislike' 
                         WHERE user_id = :user_id 
                         AND comment_user_id = :comment_user_id 
                         AND timestamp = :formattedTimestamp`,
                        {
                            replacements: { user_id: user_id, comment_user_id, formattedTimestamp },
                            type: db.Sequelize.QueryTypes.UPDATE
                        }
                    );
                    // Tăng số lượng dislike và giảm số lượng like trong bảng comment
                    await db.sequelize.query(
                        `UPDATE comment 
                         SET number_of_dislike = number_of_dislike + 1, 
                             number_of_like = number_of_like - 1 
                         WHERE user_id = :comment_user_id 
                         AND timestamp = :formattedTimestamp`,
                        {
                            replacements: { comment_user_id, formattedTimestamp },
                            type: db.Sequelize.QueryTypes.UPDATE
                        }
                    );
                }
            } else {
                // Nếu chưa có reaction nào, thêm dislike mới
                await db.sequelize.query(
                    `INSERT INTO comment_reactions (user_id, comment_user_id, timestamp, reaction) 
                     VALUES (:user_id, :comment_user_id, :formattedTimestamp, 'dislike')`,
                    {
                        replacements: { user_id: user_id, comment_user_id, formattedTimestamp },
                        type: db.Sequelize.QueryTypes.INSERT
                    }
                );
                // Tăng số lượng dislike trong bảng comment
                await db.sequelize.query(
                    `UPDATE comment 
                     SET number_of_dislike = number_of_dislike + 1 
                     WHERE user_id = :comment_user_id 
                     AND timestamp = :formattedTimestamp`,
                    {
                        replacements: { comment_user_id, formattedTimestamp },
                        type: db.Sequelize.QueryTypes.UPDATE
                    }
                );
            }

            res.redirect('back');
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    // [POST] Path: ./user/add-comment
    async addComment(req, res) {
        try {
            const user_id = req.session.userId; // Hard code user_id (hoặc lấy từ session nếu có)
            const { book_code, content } = req.body;

            if (!user_id || !book_code || !content) {
                return res.status(400).send('Missing required fields');
            }

            const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

            // Insert comment vào bảng comment
            await db.sequelize.query(
                `INSERT INTO comment (user_id, timestamp, content, number_of_like, number_of_dislike, book_code) 
                 VALUES (:user_id, :timestamp, :content, 0, 0, :book_code)`,
                {
                    replacements: { user_id: user_id, timestamp, content, book_code },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );

            res.redirect('back');
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    // [POST] Path: /user/rate-book
    async rateBook(req, res) {
        try {
            const user_id = req.session.userId; // Hard code user_id (hoặc lấy từ session nếu có)
            const { book_code, rating_score } = req.body;

            if (!user_id || !book_code || !rating_score) {
                return res.status(400).send('Missing required fields');
            }

            const score = parseFloat(rating_score);
            if (isNaN(score) || score < 1 || score > 5) {
                return res.status(400).send('Invalid rating score');
            }

            const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

            // Kiểm tra xem người dùng đã đánh giá sách này chưa
            const existingRating = await db.sequelize.query(
                `SELECT * FROM rating 
                WHERE user_id = :user_id 
                AND book_code = :book_code`,
                {
                    replacements: { user_id: user_id, book_code },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            if (existingRating.length > 0) {
                // Nếu đã đánh giá, cập nhật điểm đánh giá
                await db.sequelize.query(
                    `UPDATE rating 
                    SET rating_score = :rating_score, timestamp = :timestamp 
                    WHERE user_id = :user_id 
                    AND book_code = :book_code`,
                    {
                        replacements: { rating_score: score, timestamp, user_id, book_code },
                        type: db.Sequelize.QueryTypes.UPDATE
                    }
                );

            } else {
                // Nếu chưa đánh giá, thêm mới đánh giá
                await db.sequelize.query(
                    `INSERT INTO rating (user_id, timestamp, rating_score, book_code) 
                    VALUES (:user_id, :timestamp, :rating_score, :book_code)`,
                    {
                        replacements: { user_id: user_id, timestamp, rating_score: score, book_code },
                        type: db.Sequelize.QueryTypes.INSERT
                    }
                );

            }

            res.redirect('back');
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    // [POST] Path: /user/edit-comment
    async editComment(req, res) {
        try {
            const user_id = req.session.userId; // Hard code user_id (hoặc lấy từ session nếu có)
            const {timestamp, content } = req.body;

            if (!user_id || !content ) {
                return res.status(400).send('Missing required fields');
            }
            
            const formattedTimestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');

            // Kiểm tra xem bình luận có thuộc về người dùng không
            const comment = await db.sequelize.query(
                `SELECT * FROM comment 
                WHERE timestamp = :formattedTimestamp 
                AND user_id = :user_id`,
                {
                    replacements: { formattedTimestamp, user_id },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            // Cập nhật nội dung bình luận
            await db.sequelize.query(
                `UPDATE comment 
                SET content = :content, timestamp = :new_timestamp 
                WHERE timestamp = :formattedTimestamp`,
                {
                    replacements: { content, new_timestamp: moment().format('YYYY-MM-DD HH:mm:ss'), formattedTimestamp },
                    type: db.Sequelize.QueryTypes.UPDATE
                }
            );

            //res.status(200).send('Bình luận đã được chỉnh sửa thành công.');

            res.redirect('back');
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    // [POST] Path: /user/delete-comment
    async deleteComment(req, res) {
        try {
            const user_id = req.session.userId;
            const { timestamp } = req.body;

            const formattedTimestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');

            if (!user_id || !timestamp) {
                return res.status(400).send('Missing required fields');
            }

            // Kiểm tra xem bình luận có thuộc về người dùng không
            const [comment] = await db.sequelize.query(
                `SELECT * FROM comment 
                WHERE timestamp = :formattedTimestamp 
                AND user_id = :user_id`,
                {
                    replacements: { formattedTimestamp, user_id },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            if (comment.length === 0) {
                return res.status(404).send('Comment not found or unauthorized');
            }

            // Xóa bình luận
            await db.sequelize.query(
                `DELETE FROM comment 
                WHERE timestamp = :formattedTimestamp`,
                {
                    replacements: { formattedTimestamp },
                    type: db.Sequelize.QueryTypes.DELETE
                }
            );

            //res.status(200).send('Bình luận đã được xóa thành công.');

            res.redirect('back');
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    // [POST] Path: /user/add-favorite
    async addFavorite(req, res) {
        try {
            const user_id = req.session.userId; // Hard code user_id (hoặc lấy từ session nếu có)
            const { book_code } = req.body;

            if (!user_id || !book_code) {
                return res.status(400).send('Missing required fields');
            }

            // Kiểm tra xem sách đã nằm trong danh sách yêu thích của người dùng chưa
            const favorite = await db.sequelize.query(
                `SELECT * FROM favorite_books 
                 WHERE member_id = :user_id 
                 AND book_code = :book_code`,
                {
                    replacements: { user_id: user_id, book_code },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            if (favorite.length > 0) {
                return res.status(400).send('Book is already in favorites');
            }

            // Thêm sách vào danh sách yêu thích
            await db.sequelize.query(
                `INSERT INTO favorite_books (member_id, book_code) 
                 VALUES (:user_id, :book_code)`,
                {
                    replacements: { user_id: user_id, book_code },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );

            //res.status(201).send('Sách đã được thêm vào danh sách yêu thích.');

            res.redirect('back');
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    // [POST] Path: /user/remove-favorite
    async removeFavorite(req, res) {
        try {
            const user_id = req.session.userId; // Hard code user_id (hoặc lấy từ session nếu có)
            const { book_code } = req.body;

            if (!user_id || !book_code) {
                return res.status(400).send('Missing required fields');
            }

            // Kiểm tra xem sách đã nằm trong danh sách yêu thích của người dùng chưa
            const favorite = await db.sequelize.query(
                `SELECT * FROM favorite_books 
                 WHERE member_id = :user_id 
                 AND book_code = :book_code`,
                {
                    replacements: { user_id: user_id, book_code },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            if (favorite.length === 0) {
                return res.status(400).send('Book is not in favorites');
            }

            // Xóa sách khỏi danh sách yêu thích
            await db.sequelize.query(
                `DELETE FROM favorite_books 
                 WHERE member_id = :user_id 
                 AND book_code = :book_code`,
                {
                    replacements: { user_id: user_id, book_code },
                    type: db.Sequelize.QueryTypes.DELETE
                }
            );

            //res.status(200).send('Sách đã được xóa khỏi danh sách yêu thích.');

            res.redirect('back');
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    // [POST] Path: ./user/borrow-book (hàm chưa hoàn thiện)
    async borrowBook(req, res) {
        try {
            const user_id = req.session.userId; // Hard code user_id (hoặc lấy từ session nếu có)
            const { book_code } = req.body;

            if (!user_id || !book_code) {
                return res.status(400).send('Missing required fields');
            }

            // // Kiểm tra xem sách có tồn tại và còn đủ lượng để mượn không
            // const book = await db.sequelize.query(
            //     `SELECT available_copies 
            //      FROM book 
            //      WHERE book_code = :book_code`,
            //     {
            //         replacements: { book_code },
            //         type: db.Sequelize.QueryTypes.SELECT
            //     }
            // );

            // if (book.length === 0) {
            //     return res.status(404).send('Book not found');
            // }

            // if (book[0].available_copies < 1) {
            //     return res.status(400).send('No copies available for borrowing');
            // }

            // // Kiểm tra xem người dùng đã mượn cuốn sách này chưa và chưa trả
            // const existingBorrow = await db.sequelize.query(
            //     `SELECT * FROM borrowing_books 
            //      WHERE member_id = :user_id 
            //      AND book_code = :book_code 
            //      AND return_date IS NULL`,
            //     {
            //         replacements: { user_id: user_id, book_code },
            //         type: db.Sequelize.QueryTypes.SELECT
            //     }
            // );

            // if (existingBorrow.length > 0) {
            //     return res.status(400).send('You have already borrowed this book and have not returned it yet');
            // }

            const borrow_date = moment().format('YYYY-MM-DD');
            const due_date = moment().add(14, 'days').format('YYYY-MM-DD'); // Ví dụ: mượn trong 14 ngày

            // Tạo bản ghi mượn sách
            await db.sequelize.query(
                `INSERT INTO borrowing_books (member_id, book_code, borrow_date, return_date) 
                 VALUES (:user_id, :book_code, :borrow_date, :due_date)`,
                {
                    replacements: { user_id: user_id, book_code, borrow_date, due_date },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );

            // // Cập nhật số lượng sách có sẵn
            // await db.sequelize.query(
            //     `UPDATE book 
            //      SET available_copies = available_copies - 1 
            //      WHERE book_code = :book_code`,
            //     {
            //         replacements: { book_code },
            //         type: db.Sequelize.QueryTypes.UPDATE
            //     }
            // );

            // Ghi log hành động mượn sách
            await db.sequelize.query(
                `INSERT INTO logs (details, timestamp, action, user_id) 
                 VALUES (:details, :timestamp, :action, :user_id)`,
                {
                    replacements: {
                        details: `User ${user_id} borrowed book '${book_code}'. Due date: ${due_date}`,
                        timestamp: borrow_date,
                        action: 'BORROW_BOOK',
                        user_id: user_id
                    },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );

            //res.status(201).send('Bạn đã mượn sách thành công.');

            res.redirect('back');
        } catch (error) {
            console.error('Error borrowing book:', error);
            res.status(500).send('Internal Server Error');
        }
    }

}

module.exports = new userController;
