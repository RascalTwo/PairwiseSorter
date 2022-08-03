const express = require('express');
const methodOverride = require('method-override');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { NODE_ENV } = require('./constants');

const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride((request) => {
	if (request.body && typeof request.body === 'object' && '_method' in request.body) {
		const method = request.body._method;
		delete request.body._method;
		return method;
	}
	if ('_method' in request.query) {
		const method = request.query._method;
		delete request.query._method;

		if (!('body' in request)) request.body = {};
		Object.assign(request.body, request.query);
		request.query = {};

		return method;
	}
}, { methods: ['GET', 'POST'] }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.static('./public'));
app.use(cookieParser());

app.use(require('./routes.js'));

module.exports = app;