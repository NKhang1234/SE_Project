require("dotenv").config();
const {neon} = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
const db = require('../Models')
class siteController {
    // [GET] Path: ./
    login(req, res) {
        res.render('siteLogin',{layout: false});
    }
    // [GET] Path: ./register
    register(req, res) {
        res.render('siteRegister',{layout: false});
    }
    // [GET] Path: ./account
    async account(req, res) {
        res.render('siteAccount',{layout: false});
        /* try {
            const result = await sql`SELECT * FROM test`;
            
            // Check if the result is not empty and send the first row
            if (result && result.length > 0) {
              res.json(result[0]);  // Send the first record as JSON response
            } else {
              res.status(404).json({ message: 'No data found' }); // If no records found
            }
          } catch (error) {
            // Handle potential errors in database query
            console.error("Error fetching account data:", error);
            res.status(500).json({ message: 'Internal Server Error' });
        } */
    }

    // [GET] Path: ./account
    async account(req, res) {
      try {
          const user_id = 8; // Lấy user_id từ session:  req.session.user_id
          if (!user_id) {
              return res.redirect('/login'); // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
          }
  
          // Truy vấn thông tin người dùng
          const user = await db.sequelize.query(
              `SELECT ua.username, ua.email, ua.avatar_image, m.membership_type
               FROM user_account ua
               JOIN member m ON ua.user_id = m.member_id
               WHERE ua.user_id = :user_id`,
              {
                  replacements: { user_id },
                  type: db.Sequelize.QueryTypes.SELECT
              }
          );
          const allCategories = await db.sequelize.query(
            `SELECT * FROM category`,
            {
                type: db.Sequelize.QueryTypes.SELECT
            }
        );


      if (user.length === 0) {
          return res.status(404).send('User not found');
      }

      res.render('siteAccount', {
          user: user[0],
          allCategories: allCategories
      });
      } catch (error) {
          console.error('Error fetching user account:', error);
          res.status(500).send('Internal Server Error');
      }
  }

    // [POST] Path: ./update-password
    async changePassword(req, res) {
      try {
          const user_id = 8;
          if (!user_id) {
              return res.redirect('/login');
          }

          const { currentPassword, newPassword, confirmPassword } = req.body;

          // Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp không
          if (newPassword !== confirmPassword) {
              return res.status(400).send('Mật khẩu mới và xác nhận mật khẩu không khớp');
          }

          // Lấy mật khẩu hiện tại từ cơ sở dữ liệu
          const user = await db.sequelize.query(
              `SELECT hashed_password FROM user_account WHERE user_id = :user_id`,
              {
                  replacements: { user_id },
                  type: db.Sequelize.QueryTypes.SELECT
              }
          );

          if (user.length === 0) {
              return res.status(404).send('User not found');
          }

          // Kiểm tra mật khẩu hiện tại có đúng không
          const isMatch = await compare(currentPassword, user[0].hashed_password);
          if (!isMatch) {
              return res.status(400).send('Mật khẩu hiện tại không đúng');
          }

          // Hash mật khẩu mới (kiểu kiểu z :v)
          const hashedPassword = newPassword;

          // Cập nhật mật khẩu trong cơ sở dữ liệu
          await db.sequelize.query(
              `UPDATE user_account SET hashed_password = :newPassword WHERE user_id = :user_id`,
              {
                  replacements: { newPassword: hashedPassword, user_id },
                  type: db.Sequelize.QueryTypes.UPDATE
              }
          );

          res.send('Thay đổi mật khẩu thành công');
      } catch (error) {
          console.error('Error changing password:', error);
          res.status(500).send('Internal Server Error');
      }
  }

  // [POST] Path: ./change-email
  async changeEmail(req, res) {
      try {
          const user_id = 8;
          if (!user_id) {
              return res.redirect('/login');
          }

          const { newEmail } = req.body;

          // Kiểm tra định dạng email hợp lệ (có thể thêm kiểm tra chi tiết hơn)
          if (!validateEmail(newEmail)) {
              return res.status(400).send('Địa chỉ email không hợp lệ');
          }

          // Cập nhật email trong cơ sở dữ liệu
          await db.sequelize.query(
              `UPDATE user_account SET email = :newEmail WHERE user_id = :user_id`,
              {
                  replacements: { newEmail, user_id },
                  type: db.Sequelize.QueryTypes.UPDATE
              }
          );

          res.send('Thay đổi email thành công');
      } catch (error) {
          console.error('Error changing email:', error);
          res.status(500).send('Internal Server Error');
      }
  }

  // [POST] Path: ./change-avatar
  async changeAvatar(req, res) {
      try {
          const user_id = 8;
          if (!user_id) {
              return res.redirect('/login');
          }

          const { newAvatar } = req.body;            

          // Cập nhật email trong cơ sở dữ liệu
          await db.sequelize.query(
              `UPDATE user_account SET avatar_image = :newAvatar WHERE user_id = :user_id`,
              {
                  replacements: { newAvatar, user_id },
                  type: db.Sequelize.QueryTypes.UPDATE
              }
          );

          res.send('Thay đổi Avatar thành công');
      } catch (error) {
          console.error('Error changing email:', error);
          res.status(500).send('Internal Server Error');
      }
  }


}

// Hàm hỗ trợ kiểm tra email hợp lệ
function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}


module.exports = new siteController;