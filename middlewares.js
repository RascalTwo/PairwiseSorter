const { ObjectId } = require('mongodb');

const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('./constants.js');

module.exports.handleToken = function handleToken(request, response, next) {
	let token = request.get('Authorization')?.split(' ')[1];
	if (!token) {
		token = jwt.sign({ id: new ObjectId() }, JWT_SECRET, { expiresIn: '1d' });
		return response.json({ token, list: [] });
	}
	jwt.verify(token, JWT_SECRET, (err, { id, ...decoded}) => {
		if (err) return next(err);
		request.user = { id: new ObjectId(id), ...decoded };
		request.token = token;
		next();
	});
};

module.exports.requireToken = function requireToken(request, response, next) {
	let token = request.get('Authorization').split(' ')[1];
	if (!token) return response.status(401).end();
	jwt.verify(token, JWT_SECRET, (err, decoded) => {
		if (err) return next(err);
		request.user = decoded;
		next();
	});
};