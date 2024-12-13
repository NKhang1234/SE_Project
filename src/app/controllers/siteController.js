require("dotenv").config();
const {neon} = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
const db = require('../Models');
const pool = require('../../config/db/index.js'); // Import the pool

class siteController {
    // [GET] Path: ./
    viewLogin(req, res) {
        res.render('siteLogin',{layout: false});
    }
    // [GET] Path: ./register
    viewRegister(req, res) {
        res.render('siteRegister',{layout: false});
    }

    async register(req, res) {
      const { username, role, password } = req.body;
      try {
         // Check if username already exists
          const checkQuery = 'SELECT * FROM user_account WHERE username = $1';
          const checkResult = await pool.query(checkQuery, [username]);

          if (checkResult.rows.length > 0) {
            // If username exists, send an error response
            return res.status(400).send('Username already taken');
          }
          // const hashedPassword = await bcrypt.hash(password, 10);
          const query = 'INSERT INTO user_account (username, role, hashed_password) VALUES ($1, $2, $3)';
          await pool.query(query, [username, role, password]);
          res.redirect('/'); // login page
          //res.send('User registered');
      } catch (err) {
        console.error(err);
        res.status(500).send('Error registering user');
      }
    }

    async login(req, res) {
      const { username, password } = req.body;
      console.log(req.body);
      try {
        const query = 'SELECT * FROM user_account WHERE username = $1';
        const { rows } = await pool.query(query, [username]);
        if (rows.length === 0) {
          return res.status(401).send('Invalid credentials');
        }
    
        const user = rows[0];
        // const match = await bcrypt.compare(password, user.password);
        console.log(user);
        if (password === user.hashed_password) {
          req.session.userId = user.user_id;
          req.session.userName = user.username;
          req.session.userRole= user.role;
          console.log(req.session.userId);

          if(user.role === 'User') {
            res.redirect('/user');
          } else if(user.role === 'Publisher') {
            res.redirect('/publisher/offerStatus');
          } else if(user.role === 'Staff') {
            res.redirect('/staff/catalogManage');
          }
        } else {
          res.status(401).send('Invalid credentials');
        }
      } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in');
      }
    }
    async logout(req, res) {
      req.session.destroy(err => {
      if (err) {
          return res.status(500).send('Error logging out');
      }
      res.redirect('/'); // login page
      //res.send('Logged out');
      });
    }
    checkSession(req, res) {
      res.json(req.session);
    }
    // Helper function to check if a user is authenticated
    userAuthenticated(req, res, next) {
      if (req.session.userId && req.session.userRole === 'User') {
        return next();
      }
      res.status(401).send('Unauthorized');
    }

    // Helper function to check if a user is authenticated
    publisherAuthenticated(req, res, next) {
      if (req.session.userId && req.session.userRole === 'Publisher') {
        return next();
      }
      res.status(401).send('Unauthorized');
    }

    // Helper function to check if a user is authenticated
    staffAuthenticated(req, res, next) {
      if (req.session.userId && req.session.userRole === 'Staff') {
        return next();
      }
      res.status(401).send('Unauthorized');
    }

    // [GET] Path: ./account
    async account(req, res) {
      try {
          const user_id = req.session.userId; // Lấy user_id từ session:  req.session.userId
          if (!user_id) {
              return res.redirect('/login'); // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
          }
  
          // Truy vấn thông tin người dùng
          const user = await db.sequelize.query(
              `SELECT ua.username, ua.email, ua.avatar_image
               FROM user_account ua
               WHERE ua.user_id = :user_id`,
              {
                  replacements: { user_id: user_id },
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
          const user_id = req.session.userId;
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
                  replacements: { user_id: user_id },
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
          const user_id = req.session.userId;
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

          res.redirect('back');
          // res.send('Thay đổi email thành công');
      } catch (error) {
          console.error('Error changing email:', error);
          res.status(500).send('Internal Server Error');
      }
  }

  // [POST] Path: ./change-avatar
  async changeAvatar(req, res) {
      try {
          const user_id = req.session.userId;
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
          res.redirect('back');

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

// Hàm hỗ trợ so sánh mật khẩu
async function compare(password, hashedPassword) {
  return password === hashedPassword;
}

module.exports = new siteController;