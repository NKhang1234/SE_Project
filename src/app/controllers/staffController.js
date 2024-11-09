class staffController {
    
    // [GET] Path: ./staff/catalogManage
    catalogManage(req, res) {
        res.render('staffCatalog');
    }
    // [GET] Path: ./staff/memberManage
    memberManage(req, res) {
        res.render('staffMember');
    }
    // [GET] Path: ./staff/stockManage
    stockManage(req,res) {
        res.render('staffStock');
    }
    // [GET] Path: ./staff/checkInOut
    checkInOut(req,res) {
        res.render('staffCheckInOut');
    }
}

module.exports = new staffController;