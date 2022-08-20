function redirectPartialOAuthUsers(request, response, next) {
	if (request.user.hasOnlyOAuth && request.url !== '/signup') return response.redirect('/signup');
	next();
}

module.exports = { redirectPartialOAuthUsers };