const express = require('express');

const app = express();

app.get('/', (_, response) => response.sendFile('./public/index.html', { root: __dirname }));

module.exports = app;