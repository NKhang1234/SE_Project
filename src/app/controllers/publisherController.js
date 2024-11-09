class publisherController {
    
    // [GET] Path: ./publisher/catalogManage
    offer(req, res) {
        res.render('publisherOffer');
    }
    // [GET] Path: ./publisher/memberManage
    offerStatus(req, res) {
        res.render('publisherOfferStatus');
    }
    
}

module.exports = new publisherController;