function redirectPartialOAuthUsers(request, response, next) {
	if (request.user.hasOnlyOAuth && request.url !== '/signup') return response.redirect('/signup');
	next();
}

function addOauthAvailableToViewLocals(oauthAvailable) {
	return (_, response, next) => {
		response.locals.oauthAvailable = oauthAvailable;
		next();
	}
}

module.exports = { redirectPartialOAuthUsers, addOauthAvailableToViewLocals };