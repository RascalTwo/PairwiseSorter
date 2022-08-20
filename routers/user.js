const PromiseRouter = require('express-promise-router');
const passport = require('passport');
const { GOOGLE_CLIENT_ID, DISCORD_CLIENT_ID, GITHUB_CLIENT_ID, TWITTER_CONSUMER_KEY, TWITCH_CLIENT_ID, DROPBOX_CLIENT_ID } = require('../config/constants');

const { logout, login, signup } = require('../controllers/user.js');
const { redirectPartialOAuthUsers } = require('../middlewares/index.js');
const router = PromiseRouter();


router.get('/logout', logout);

router.use(redirectPartialOAuthUsers);

const hasGoogle = !!GOOGLE_CLIENT_ID;

if (hasGoogle) {
	router.get('/login/google', passport.authenticate('google'));
	router.get('/oauth2/redirect/google',
		passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }),
		(_, response) => response.redirect('/')
	);
}

const hasDiscord = !!DISCORD_CLIENT_ID;
if (hasDiscord) {
	router.get('/login/discord', passport.authenticate('discord'));
	router.get('/oauth2/redirect/discord',
		passport.authenticate('discord', { failureRedirect: '/login', failureMessage: true }),
		(_, response) => response.redirect('/')
	);
}

const hasGithub = !!GITHUB_CLIENT_ID;
if (hasGithub) {
	router.get('/login/github', passport.authenticate('github'));
	router.get('/oauth2/redirect/github',
		passport.authenticate('github', { failureRedirect: '/login', failureMessage: true }),
		(_, response) => response.redirect('/')
	);
}

const hasTwitter = !!TWITTER_CONSUMER_KEY;
if (hasTwitter) {
	router.get('/login/twitter', passport.authenticate('twitter'));
	router.get('/oauth2/redirect/twitter',
		passport.authenticate('twitter', { failureRedirect: '/login', failureMessage: true }),
		(_, response) => response.redirect('/')
	);
}

const hasTwitch = !!TWITCH_CLIENT_ID;
if (hasTwitch) {
	router.get('/login/twitch', passport.authenticate('twitch'));
	router.get('/oauth2/redirect/twitch',
		passport.authenticate('twitch', { failureRedirect: '/login', failureMessage: true }),
		(_, response) => response.redirect('/')
	);
}

const hasDropbox = !!DROPBOX_CLIENT_ID;
if (hasDropbox) {
	router.get('/login/dropbox', passport.authenticate('dropbox-oauth2'));
	router.get('/oauth2/redirect/dropbox',
		passport.authenticate('dropbox-oauth2', { failureRedirect: '/login', failureMessage: true }),
		(_, response) => response.redirect('/')
	);
}

const oauthAvailable = {
	google: hasGoogle,
	discord: hasDiscord,
	github: hasGithub,
	twitter: hasTwitter,
	twitch: hasTwitch,
	dropbox: hasDropbox
};

router.route('/login')
	.get((request, response) => response.render('login', {
		url: request.url,
		user: request.user,
		oauthAvailable
	}))
	.post(passport.authenticate('local', { failureRedirect: '/login' }), login);

router.route('/signup')
	.get((request, response) => response.render('signup', {
		url: request.url,
		user: request.user,
		oauthAvailable
	}))
	.post(signup);

router.get('/profile', (request, response) => response.render('profile', {
	url: request.url,
	user: request.user,
	oauthAvailable
}));

router.get('/logout/:provider', async (request, response) => {
	const { provider } = request.params;
	if (provider in oauthAvailable) {
		request.user.connected[provider + 'Id'] = undefined;
		await request.user.save();
		return response.redirect('/');
	}
	return response.status(404).send();
});


module.exports = router;