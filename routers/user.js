const PromiseRouter = require('express-promise-router');
const passport = require('passport');
const { GOOGLE_CLIENT_ID, DISCORD_CLIENT_ID, GITHUB_CLIENT_ID, TWITTER_CONSUMER_KEY, TWITCH_CLIENT_ID, DROPBOX_CLIENT_ID } = require('../config/constants');

const userController = require('../controllers/user.js');
const { redirectPartialOAuthUsers } = require('../middlewares/index.js');
const { addOauthAvailableToViewLocals } = require('../middlewares/user.js');


router.get('/logout', userController.logout);
router.get('/logout/:provider', userController.logoutOfProvider);

router.use(redirectPartialOAuthUsers);


router.use(addOauthAvailableToViewLocals(Object.entries({
	dropbox: DROPBOX_CLIENT_ID,
	twitter: TWITTER_CONSUMER_KEY,
	discord: DISCORD_CLIENT_ID,
	github: GITHUB_CLIENT_ID,
	twitch: TWITCH_CLIENT_ID,
	google: GOOGLE_CLIENT_ID,
}).reduce((oauthAvailable, [provider, clientId]) => {
	if (!clientId) return { [provider]: false, ...oauthAvailable };

	router.get('/login/' + provider, passport.authenticate(provider));
	router.get('/oauth2/redirect/' + provider,
		passport.authenticate(provider, { successRedirect: '/', failureRedirect: '/login', failureMessage: true })
	);

	return { [provider]: true, ...oauthAvailable };
}, {})));

router.route('/login')
	.get(userController.renderLogin)
	.post(passport.authenticate('local', { failureRedirect: '/login' }), userController.login);

router.route('/signup')
	.get(userController.renderSignup)
	.post(userController.signup);

router.get('/user/:username', userController.renderProfile)


module.exports = router;