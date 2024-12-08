class userController {
    
    // [GET] Path: ./user/
    index(req, res) {
        res.render('userHomepage');
    }
    // [GET] Path: ./user/search
    search(req, res) {
        res.render('userResult');
    }
    // [GET] Path: ./user/category/:slug
    viewCaterogy(req,res) {
        res.render('userCategories');
    }
    // [GET] Path: ./user/book/:slug
    viewBook(req,res) {
        res.render('userBookDetail');
    }
    
    // [GET] Path: ./user/mybook
    myBook(req, res){
        res.render('userMyBook');
    }
}

module.exports = new userController;