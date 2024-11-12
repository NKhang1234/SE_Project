class userController {
    // [GET] /search
    search() {
        return 1;
    }

    // [GET] /caterogy/:slug
    viewCaterogy() {
        return 1;
    }

    // [GET] /book/:slug
    viewBook() {
        return 1;
    }

    // [GET] /
    index() {
        return 1;
    }
}

module.exports = new userController();
