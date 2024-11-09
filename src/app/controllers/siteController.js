require("dotenv").config();
const {neon} = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

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
}

module.exports = new siteController;