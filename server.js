const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { NODE_ENV } = require('./constants');

const app = express();

app.set('view engine', 'ejs');
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(require('./routes.js'));

module.exports = app;