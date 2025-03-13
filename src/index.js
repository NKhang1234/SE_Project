require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const handlebars = require("express-handlebars");
const { neon } = require("@neondatabase/serverless");
const db = require("./app/Models");

const session = require("express-session");
const bcrypt = require("bcryptjs");
const PgSession = require("connect-pg-simple")(session);

const pool = require("./config/db/index.js"); // Import the pool
const connectDB = require("./config/sequelize");

const app = express();
const port = 3000;

const route = require("./routes/indexRouter.js");

// Connect to DB with Neon (for querying)
const sql = neon(process.env.DATABASE_URL);

// Create a pg Pool for session store (this should use the pg Pool object)

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: "session",
    }),
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

// Create a pg Pool for session store (this should use the pg Pool object)

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: "session",
    }),
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

//connect to DB sequelize
connectDB(db.sequelize);

app.use(express.static(path.join(__dirname, '/resources')));

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
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "resources", "views"));

// console.log(`Path: ${path.join(__dirname,'resources/views')}`);
// Routes init
route(app);

app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
