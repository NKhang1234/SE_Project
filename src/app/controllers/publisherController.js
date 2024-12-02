const db = require('../Models');

class publisherController {
    // [GET] Path: publisher/offer
    async offer(req, res) {
        try {
            db.sequelize
                .query(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"
                )
                .then(([results, metadata]) => {
                    console.log('Tables:', results);
                })
                .catch((error) => {
                    console.error('Error fetching tables:', error);
                });
        } catch (e) {
            console.log(e.sql);
        }
    }

    // [GET] Path: publisher/offerStatus
    offerStatus(req, res) {
        res.render('OfferStatus');
    }

    // [PUT] publisher/edit
    edit(req, res) {
        res.render('edit');
    }

    // [POST] publisher/add
    add(req, res) {
        res.render('add');
    }
}

module.exports = new publisherController();
