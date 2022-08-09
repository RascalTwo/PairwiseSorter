const { ObjectId } = require('mongodb');

const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('./config/constants.js');

module.exports.parseToken = parseToken;
function parseToken(request, _, next) {
	let { token } = request.cookies;
	if (!token) return next();
	jwt.verify(token, JWT_SECRET, (err, decoded) => {
		if (err) return next(err);
		request.user = decoded;
		request.token = token;
		next();
	});
}

module.exports.handleToken = function handleToken(request, response, next) {
	return parseToken(request, response, (err) => {
		if (err) console.error(err);

		if (!request.token) {
			const _id = new ObjectId();
			request.user = { _id };

			const token = jwt.sign({ _id }, JWT_SECRET, { expiresIn: '1d' });
			request.token = token;

			response.cookie('token', token);
		}

		next();
	});
};

module.exports.requireToken = function requireToken(request, response, next) {
	return parseToken(request, response, (err) => {
		if (err) return next(err);

		if (!request.token) return response.status(401).end();
		next();
	});
};