const userRouter = require('./userRouter.js');
const staffRouter = require('./staffRouter.js');
const publisherRouter = require('./publisherRouter.js');
const siteRouter = require('./siteRouter.js');


function route(app) {
    app.use('/user', userRouter);
    app.use('/staff', staffRouter);
    app.use('/publisher', publisherRouter);
    app.use('/', siteRouter);
}

module.exports = route;