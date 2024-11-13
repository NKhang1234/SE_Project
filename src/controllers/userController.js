class userController {
    // [GET] /search
    search(req, res, next) {
        return 1;
    }

    // [GET] /caterogy/:slug
    viewCaterogy(req, res, next) {
        return 1;
    }

    // [GET] /book/:slug
    viewBook(req, res, next) {
        return 1;
    }

    // [GET] /
    index(req, res, next) {
        return 1;
    }
}

module.exports = new userController();
