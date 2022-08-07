const PromiseRouter = require('express-promise-router');
const passport = require('passport');
const { GOOGLE_CLIENT_ID, DISCORD_CLIENT_ID, GITHUB_CLIENT_ID } = require('./constants');

const { homepage, lists, createList, createItems, compareItems, getList, getNextComparison, logout, login, signup, deleteList, deleteItem, resetItem, resetListComparisons, resetComparison, renderItemRenamePage, patchItem, patchList } = require('./controllers.js');
const router = PromiseRouter();

router.use((request, _, next) => {
	if (!request.user) request.user = { _id: request.session.id };
	request.oldSessionId = request.session.id;
	request.user.hasOnlyOAuth = !request.user.username && request.user.createdAt;
	next();
});

router.get('/logout', logout);

router.use((request, response, next) => {
	if (request.user.hasOnlyOAuth && request.url !== '/signup') return response.redirect('/signup');
	next();
});

router.get('/', homepage);
router.get('/lists', lists);


router.post('/list', createList);

router.route('/list/:list')
	.get(getList)
	.post(createItems)
	.patch(patchList)
	.delete(deleteList);

router.route('/list/:list/comparisons')
	.get(getNextComparison)
	.put(resetListComparisons);

router.route('/list/:list/:item')
	.get(renderItemRenamePage)
	.patch(patchItem)
	.delete(deleteItem);

router.put('/list/:list/:item/comparisons', resetItem);

router.route('/list/:list/:a/:b')
	.post(compareItems)
	.delete(resetComparison);

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

const oauthAvailable = {
	google: hasGoogle,
	discord: hasDiscord,
	github: hasGithub
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