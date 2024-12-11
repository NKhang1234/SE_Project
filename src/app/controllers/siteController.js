require("dotenv").config();
const {neon} = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
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
    // [GET] Path: ./account
    async viewAccount(req, res) {
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

    async register(req, res) {
      const { username, role, password } = req.body;
      try {
        // const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO user_account (username, role, hashed_password) VALUES ($1, $2, $3)';
        await pool.query(query, [username, role, password]);
        res.redirect('/login');
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
        if (password === user.hashed_password) {
          req.session.userId = user.user_id;
          req.session.userName = user.username;
          req.session.userRole = user.role;
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
      res.send('Logged out');
      });
    }
    checkSession(req, res) {
      res.json(req.session);
    }
    // Helper function to check if a user is authenticated
    isAuthenticated(req, res, next) {
      if (req.session.userId) {
        return next();
      }
      res.status(401).send('Unauthorized');
    }
}

module.exports = new siteController;