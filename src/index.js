require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const handlebars = require('express-handlebars');
const { neon } = require('@neondatabase/serverless');
const db = require('./app/Models');
const connectDB = require('./config/sequelize');

const app = express();
const port = 3000;

const route = require('./routes/indexRouter.js');

// Connect to DB
const sql = neon(process.env.DATABASE_URL);

//connect to DB sequelize
connectDB(db.sequelize);

app.use(express.static(path.join(__dirname, 'public')));

app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());
// HTTP logger
// app.use(morgan("combined"));

// Tempalte Engine
app.engine(
    '.hbs',
    handlebars.engine({
        extname: '.hbs',
        helpers: {
            eq: (a, b) => a === b,
            gt: function(a, b, options) {
                return (a > b) ? options.fn(this) : options.inverse(this);
            },
            ifCond: function(v1, operator, v2, options) {
                switch (operator) {
                    case '==':
                        return (v1 == v2) ? options.fn(this) : options.inverse(this);
                    case '===':
                        return (v1 === v2) ? options.fn(this) : options.inverse(this);
                    case '!=':
                        return (v1 != v2) ? options.fn(this) : options.inverse(this);
                    case '!==':
                        return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                    case '<':
                        return (v1 < v2) ? options.fn(this) : options.inverse(this);
                    case '<=':
                        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                    case '>':
                        return (v1 > v2) ? options.fn(this) : options.inverse(this);
                    case '>=':
                        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                    case '&&':
                        return (v1 && v2) ? options.fn(this) : options.inverse(this);
                    case '||':
                        return (v1 || v2) ? options.fn(this) : options.inverse(this);
                    default:
                        return options.inverse(this);
                }
            }
        }
    })
);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

// console.log(`Path: ${path.join(__dirname,'resources/views')}`);

// Routes init
route(app);

app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
