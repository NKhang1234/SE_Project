require("dotenv").config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const handlebars = require('express-handlebars');
const {neon} = require("@neondatabase/serverless");


const app = express();
const port = 3000;

const route = require('./routes/indexRouter.js');

// Connect to DB
const sql = neon(process.env.DATABASE_URL);

app.use(express.static(path.join(__dirname,'public')));

app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
// HTTP logger
// app.use(morgan("combined"));

// Tempalte Engine
app.engine('.hbs', handlebars.engine({
  extname: '.hbs'
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname,'resources', 'views'));

// console.log(`Path: ${path.join(__dirname,'resources/views')}`);

// Routes init
route(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
});