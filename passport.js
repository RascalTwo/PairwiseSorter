const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20');
const DiscordStrategy = require('passport-discord').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const bcrypt = require('bcrypt');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } = require('./constants');
const User = require('./models/User');


passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => User.findById(id).then(user => done(null, user)).catch(done));
passport.use(new LocalStrategy((username, password, done) => {
	User.findOne({ username: new RegExp('^' + username + '$', 'i') }).then(async user => {
		if (!user) {
			return done(null, false, { message: 'Incorrect username.' });
		}
		if (!await bcrypt.compare(password, user.password)) {
			return done(null, false, { message: 'Incorrect password.' });
		}

		return done(null, user);
	}).catch(done);
}));


const createOAuthVerification = slug => ({ user }, access, refresh, params, profile, done) => {
	if (user.createdAt) {
		user.connected[slug + 'Id'] = profile.id;
		return user.save().then(user => done(null, user)).catch(done);
	}

	User.findOne({ [`connected.${slug}Id`]: profile.id }).then(async user => {
		if (user) return done(null, user);

		return done(null, await new User({
			connected: {
				[slug + 'Id']: profile.id
			}
		}).save());
	}).catch(done);
};


if (GOOGLE_CLIENT_ID) passport.use(new GoogleStrategy({
	clientID: GOOGLE_CLIENT_ID,
	clientSecret: GOOGLE_CLIENT_SECRET,
	callbackURL: '/oauth2/redirect/google',
	passReqToCallback: true,
	scope: ['profile'],
	state: true
}, createOAuthVerification('google')));

if (DISCORD_CLIENT_ID) passport.use(new DiscordStrategy({
	clientID: DISCORD_CLIENT_ID,
	clientSecret: DISCORD_CLIENT_SECRET,
	callbackURL: '/oauth2/redirect/discord',
	passReqToCallback: true,
	scope: ['identify'],
}, createOAuthVerification('discord')));

if (GITHUB_CLIENT_ID) passport.use(new GithubStrategy({
	clientID: GITHUB_CLIENT_ID,
	clientSecret: GITHUB_CLIENT_SECRET,
	callbackURL: '/oauth2/redirect/github',
	passReqToCallback: true
}, createOAuthVerification('github')));

if (TWITTER_CONSUMER_KEY) passport.use(new TwitterStrategy({
	consumerKey: TWITTER_CONSUMER_KEY,
	consumerSecret: TWITTER_CONSUMER_SECRET,
	callbackURL: '/oauth2/redirect/twitter',
	passReqToCallback: true
}, createOAuthVerification('twitter')));

module.exports = (app) => {
	app.use(passport.initialize());
	app.use(passport.session());
};