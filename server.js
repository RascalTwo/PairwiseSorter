const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(require('./routes.js'));

module.exports = app;