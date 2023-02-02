const { npm_package_version } = require('../config/constants.js');

function redirectPartialOAuthUsers(request, response, next) {
	if (request.user.hasOnlyOAuth && request.url !== '/signup') return response.redirect('/signup');
	next();
}

function createAnonymousUser(request, _, next) {
	if (!request.user) request.user = { _id: request.session.id, hasOnlyOAuth: false };
	next();
}

function trackOldSessionID(request, _, next) {
	request.oldSessionId = request.session.id;
	next();
}

function exposeUserAndURLToView(request, response, next) {
	response.locals.url = request.url;
	response.locals.user = request.user;
	response.locals.version = npm_package_version;
	next();
}

module.exports = { redirectPartialOAuthUsers, createAnonymousUser, trackOldSessionID, exposeUserAndURLToView };