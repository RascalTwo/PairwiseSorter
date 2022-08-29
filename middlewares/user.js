const addOauthAvailableToViewLocals = (oauthAvailable) => function exposeOAuthAvailableToViews(_, response, next) {
	response.locals.oauthAvailable = oauthAvailable;
	next();
}

module.exports = { addOauthAvailableToViewLocals };