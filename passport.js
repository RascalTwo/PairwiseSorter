const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20');
const DiscordStrategy = require('passport-discord').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const TwitchStrategy = require('passport-twitch-new').Strategy;
const DropboxStrategy = require('passport-dropbox-oauth2').Strategy;
const bcrypt = require('bcrypt');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, DROPBOX_CLIENT_ID, DROPBOX_CLIENT_SECRET } = require('./config/constants');
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
	User.findOne({ [`connected.${slug}Id`]: profile.id }).then(async foundUser => {
		if (user.createdAt) {
			if (foundUser) {
				return done(`This ${slug} account is already connected to another local account`);
			}
			user.connected[slug + 'Id'] = profile.id;
			return user.save().then(user => done(null, user)).catch(done);
		}

		if (foundUser) return done(null, foundUser);

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

if (TWITCH_CLIENT_ID) passport.use(new TwitchStrategy({
	clientID: TWITCH_CLIENT_ID,
	clientSecret: TWITCH_CLIENT_SECRET,
	callbackURL: '/oauth2/redirect/twitch',
	passReqToCallback: true,
	scope: 'user_read'
}, createOAuthVerification('twitch')));

if (DROPBOX_CLIENT_ID) passport.use('dropbox', new DropboxStrategy({
	apiVersion: '2',
	clientID: DROPBOX_CLIENT_ID,
	clientSecret: DROPBOX_CLIENT_SECRET,
	callbackURL: '/oauth2/redirect/dropbox',
	passReqToCallback: true,
}, createOAuthVerification('dropbox')));

module.exports = (app) => {
	app.use(passport.initialize());
	app.use(passport.session());
};