
const fs = require('fs');
const path = require('path');

const db = require('../Models');

class publisherController {
  // [POST] publisher/upload

  async upload(req, res) {
    const file = req.file;

    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    // Đổi tên file để dễ quản lý hơn (giữ nguyên định dạng file)
    const fileExtension = path.extname(file.originalname);
    const newFileName = `${file.filename}${fileExtension}`;
    const newFilePath = path.join("src/resources/img", newFileName);

    // Đổi tên file đã lưu tạm thành file chính thức
    fs.renameSync(file.path, newFilePath);

    res.status(200).send({
      message: "File uploaded successfully!",
      fileName: newFileName,
    });
  }

  // [GET] publisher/offerStatus
  async offerStatus(req, res) {
    try {
      // publisher_id = 1;
      const publisher_id = req.session.userId;
      const offers = await db.sequelize.query(
        `SELECT * 
                FROM offer
                JOIN discount 
                ON offer.publisher_id = discount.publisher_id 
                AND offer.offer_id = discount.offer_id
                WHERE offer.publisher_id = ${req.session.userId}`,
                {
                    type: db.Sequelize.QueryTypes.SELECT, // Chỉ định kiểu truy vấn là SELECT để trả về kết quả dạng mảng
                }
          );
      // Define the status icons
      const statusIcons = {
        APPROVED: `<img src="https://cdn.builder.io/api/v1/image/assets/TEMP/ee0cca023482c1b42f15837018bb1b29fea9f8d63d8432e18bbdccbe8167fd74?apiKey=fe65ef85b375408eac075f18f305b6ac&" alt="Duyệt" class="w-6 h-6" />`,
        WAITING: `<img src="https://cdn.builder.io/api/v1/image/assets/TEMP/5edc6e5ed0ce82ac85919810c1b0ca814030f79dcb582b1c5992605a49a3c7e8?apiKey=fe65ef85b375408eac075f18f305b6ac&" alt="Đang duyệt" class="w-6 h-6" />`,
        DENIED: `<img src="https://cdn.builder.io/api/v1/image/assets/TEMP/d13737129550f166971476e89e300864e16a7ec104029eb4325a4e0635ac7e12?apiKey=fe65ef85b375408eac075f18f305b6ac&" alt="Không duyệt" class="w-6 h-6" />`,
      };

      // Map offers to add the icon property
      const offersWithIcons = offers.map((offer) => {
        return {
          ...offer,
          statusIcon: statusIcons[offer.status] || "", // Add the appropriate icon
        };
      });

      // res.json(offers);
      res.render("publisherOfferStatus", { offers: offersWithIcons });
    } catch (error) {
      console.error("Error saving publisher:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
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
    // if (type && content) {
    //   if (type === "title") {
    //     whereConditions += ` AND offer.book_title LIKE %:content%`; // Lọc theo title
    //   } else if (type === "category") {
    //     whereConditions += ` AND offer.book_category LIKE %:content%`; // Lọc theo category
    //   } else if (type === "discount") {
    //     whereConditions += ` AND discount.discount > :content`; // Lọc theo discount lớn hơn content
    //   } else if (type === "status") {
    //     whereConditions += ` AND offer.status = :content`; // Lọc theo status
    //   } else if (type === "ISBN") {
    //     whereConditions += ` AND offer.book_code LIKE %:content%`; // Lọc theo ISBN (book_code)
    //   }
    // }
    if (type && content) {
      let isValid = false;

      // Kiểm tra content có hợp lệ không
      if (type === "title") {
        const result = await db.sequelize.query(
          `SELECT COUNT(*) as count FROM offer WHERE book_title LIKE :content`,
          {
            replacements: { content: `%${content}%` },
            type: db.Sequelize.QueryTypes.SELECT,
          }
        );
        isValid = result[0].count > 0;
        if (isValid) {
          whereConditions += ` AND offer.book_title LIKE :content`;
        }
      } else if (type === "category") {
        const result = await db.sequelize.query(
          `SELECT COUNT(*) as count FROM offer WHERE book_category LIKE :content`,
          {
            replacements: { content: `%${content}%` },
            type: db.Sequelize.QueryTypes.SELECT,
          }
        );
        isValid = result[0].count > 0;
        if (isValid) {
          whereConditions += ` AND offer.book_category LIKE :content`;
        }
      } else if (type === "discount") {
        const result = await db.sequelize.query(
          `SELECT COUNT(*) as count FROM discount WHERE discount > :content`,
          {
            replacements: { content },
            type: db.Sequelize.QueryTypes.SELECT,
          }
        );
        isValid = result[0].count > 0;
        if (isValid) {
          whereConditions += ` AND discount.discount > :content`;
        }
      } else if (type === "status") {
        const validStatuses = ["APPROVED", "WAITING", "DENIED"];
        isValid = validStatuses.includes(content);
        if (isValid) {
          whereConditions += ` AND offer.status = :content`;
        }
      }

      // Nếu content không hợp lệ
      if (!isValid) {
        return res.render("publisherOfferStatus", {
          message:
            "Content không hợp lệ hoặc không tồn tại trong cơ sở dữ liệu",
        });
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

      const statusIcons = {
        APPROVED: `<img src="https://cdn.builder.io/api/v1/image/assets/TEMP/ee0cca023482c1b42f15837018bb1b29fea9f8d63d8432e18bbdccbe8167fd74?apiKey=fe65ef85b375408eac075f18f305b6ac&" alt="Duyệt" class="w-6 h-6" />`,
        WAITING: `<img src="https://cdn.builder.io/api/v1/image/assets/TEMP/5edc6e5ed0ce82ac85919810c1b0ca814030f79dcb582b1c5992605a49a3c7e8?apiKey=fe65ef85b375408eac075f18f305b6ac&" alt="Đang duyệt" class="w-6 h-6" />`,
        DENIED: `<img src="https://cdn.builder.io/api/v1/image/assets/TEMP/d13737129550f166971476e89e300864e16a7ec104029eb4325a4e0635ac7e12?apiKey=fe65ef85b375408eac075f18f305b6ac&" alt="Không duyệt" class="w-6 h-6" />`,
      };

      const offersWithIcons = offers.map((offer) => ({
        ...offer,
        statusIcon: statusIcons[offer.status] || "",
      }));

      // Render bảng dữ liệu sau khi lọc
      // res.json(offers); // Trả về kết quả tìm được
      res.render("publisherOfferStatus", { offers: offersWithIcons });
    } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message, // Bao gồm chi tiết lỗi để debug
      });
    }
  }

  // [GET] publisher/add
  async getAddPage(req, res) {
    res.render("publisherOffer");
  }

  async add(req, res) {
    try {
      // **1. Xử lý file ảnh**
      const publisher_id = req.session.userId;
      const file = req.file;
      let newFileName = null;
      if (file) {
        const fileExtension = path.extname(file.originalname); // Lấy đuôi file
        newFileName = `${file.filename}${fileExtension}`; // Đặt tên file mới
        const newFilePath = path.join("src/resources/img", newFileName);

        // Đổi tên file để lưu đúng đường dẫn
        fs.renameSync(file.path, newFilePath);
      }

      // **2. Lấy dữ liệu từ body**
      const {
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

      // Kiểm tra các trường bắt buộc
      if (!book_title || !book_author) {
        return res.status(400).send("Missing required fields");
      }

      // **3. Chèn dữ liệu vào bảng offer**
      const [offerResult] = await db.sequelize.query(
        `INSERT INTO offer 
              (publisher_id, book_img, book_code, book_title, book_author, book_category, language, publish_date, base_price, number_of_discount, status) 
              VALUES 
              (:publisher_id, :book_img, :book_code, :book_title, :book_author, :book_category, :language, :publish_date, :base_price, :number_of_discount, :status)
              RETURNING *`,
        {
          replacements: {
            publisher_id: publisher_id || 4,
            book_img: newFileName || null, // Lưu tên file ảnh nếu có
            book_code: book_code || null,
            book_title: book_title,
            book_author: book_author,
            book_category: book_category || null,
            language: language || "Tiếng Việt",
            publish_date: publish_date || new Date().toISOString().slice(0, 10),
            base_price: base_price || 0,
            number_of_discount: number_of_discount || 0,
            status: "WAITING",
          },
        }
      );

      const offerId = offerResult[0].offer_id;

      // **4. Chèn dữ liệu vào bảng discount (nếu có)**
      if (discount) {
        await db.sequelize.query(
          `INSERT INTO discount (publisher_id, offer_id, discount)
                VALUES (?, ?, ?)`,
          {
            replacements: [publisher_id || 4, offerId, discount],
          }
        );
      }

      // **5. Phản hồi thành công**
      // res.status(200).send({
      //   message: "Thêm sách và giảm giá thành công",
      //   book_img: newFileName,
      // });
      res.redirect("/publisher/offerStatus");
      // res.status(200).json();
    } catch (error) {
      console.error("Error saving publisher:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  // [GET] publisher/edit/:id
  async editPage(req, res) {
    try {
      const { id } = req.params;
      const offers = await db.sequelize.query(
        `SELECT * 
                FROM offer
                JOIN discount 
                ON offer.publisher_id = discount.publisher_id 
                AND offer.offer_id = discount.offer_id
                WHERE offer.publisher_id = ${req.session.userId} AND offer.offer_id = ${id}`,
        {
          type: db.Sequelize.QueryTypes.SELECT, // Chỉ định kiểu truy vấn là SELECT để trả về kết quả dạng mảng
        }
      );
      // res.json(offers[0]);
      res.render("publisherOfferEdit", offers[0]);
    } catch (error) {
      console.error("Error saving publisher:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message, // Chi tiết lỗi (nếu cần thiết)
      });
    }
  }
  // [PUT] publisher/edit
  async edit(req, res) {
    try {
      console.log(req.body);
      const file = req.file;
      const {
        offer_id,
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
        return res.status(400).send("Missing required fields");
      }

      // Truy vấn ảnh cũ
      const [currentOffer] = await db.sequelize.query(
        `SELECT book_img FROM offer WHERE offer_id = :offer_id AND publisher_id = :publisher_id`,
        {
          replacements: {
            offer_id: offer_id,
            publisher_id: req.session.userId || 4,
          },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      );

      if (!currentOffer) {
        return res.status(404).send("Offer not found");
      }

      let book_img = currentOffer.book_img; // Ảnh mặc định

      // Nếu có file mới upload
      if (file) {
        const oldImagePath =
          currentOffer.book_img &&
          path.join("src/resources/img", currentOffer.book_img);

        // Xóa ảnh cũ nếu tồn tại
        if (currentOffer.book_img && fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }

        // Đổi tên file mới
        const fileExtension = path.extname(file.originalname);
        const newFileName = `${file.filename}${fileExtension}`;
        const newFilePath = path.join("src/resources/img", newFileName);

        fs.renameSync(file.path, newFilePath); // Lưu file mới
        book_img = newFileName; // Cập nhật đường dẫn ảnh
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
            publisher_id: req.session.userId || 4,
            offer_id: offer_id,
            book_img: book_img,
            book_code: book_code || null,
            book_title: book_title,
            book_author: book_author,
            book_category: book_category || null,
            language: language || "Tiếng Việt",
            publish_date: publish_date || new Date().toISOString().slice(0, 10),
            base_price: base_price || 0,
            number_of_discount: number_of_discount || 0,
          },

        }
      );

      // Kiểm tra nếu không có bản ghi nào được cập nhật
      if (updateResult[0] === 0) {
        return res.status(404).send("Offer not found or no changes made");
      }

      // Cập nhật bảng discount nếu có
      if (discount) {
        await db.sequelize.query(
          `UPDATE discount SET discount = :discount WHERE offer_id = :offer_id`,
          {
            replacements: {
              discount: discount,
              offer_id: offer_id,
            },
          }
        );
      }

      // Trả về giao diện với dữ liệu mới
      // res.render("/publisher/edit", {
      //   offer_id,
      //   book_img,
      //   book_title,
      //   book_author,
      //   book_category,
      //   language,
      //   publish_date,
      //   base_price,
      //   number_of_discount,
      //   discount,
      // });
      // res.status(200).json({
      //   message: "Chỉnh sửa sách và giảm giá thành công",
      //   book_img: book_img,
      // });
      console.log("Chỉnh sửa sách và giảm giá thành công");

      res.redirect("/publisher/offerStatus");
    } catch (error) {
      console.error("Error updating offer:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
}

module.exports = new publisherController();
