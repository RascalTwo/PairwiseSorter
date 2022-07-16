const express = require('express');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('./public'));
app.use(express.json());

app.get('/', (_, response) => response.render('index'));

app.use('/api', require('./routes.js'));

module.exports = app;