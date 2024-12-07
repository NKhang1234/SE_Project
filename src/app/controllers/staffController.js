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
        res.render('staffCatalogUpdate');
    }
    // [GET] Path: ./staff/offerApprove
    offerApprove(req,res) {
        res.render('staffOfferApprove');
    }
}

module.exports = new staffController;