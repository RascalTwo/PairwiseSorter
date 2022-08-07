const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20');
const DiscordStrategy = require('passport-discord').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcrypt');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = require('./constants');
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

if (GOOGLE_CLIENT_ID) passport.use(new GoogleStrategy({
	clientID: GOOGLE_CLIENT_ID,
	clientSecret: GOOGLE_CLIENT_SECRET,
	callbackURL: '/oauth2/redirect/google',
	scope: ['profile'],
	state: true
}, (access, refresh, profile, done) => {
	User.findOne({ 'connected.googleId': profile.id }).then(async user => {
		if (user) return done(null, user);

		return done(null, await new User({
			username: profile.displayName,
			connected: {
				googleId: profile.id
			}
		}).save());
	}).catch(done);
}));

if (DISCORD_CLIENT_ID) passport.use(new DiscordStrategy({
	clientID: DISCORD_CLIENT_ID,
	clientSecret: DISCORD_CLIENT_SECRET,
	callbackURL: '/oauth2/redirect/discord',
	scope: ['identify'],
}, (access, refresh, profile, done) => {
	User.findOne({ 'connected.discordId': profile.id }).then(async user => {
		if (user) return done(null, user);

		return done(null, await new User({
			username: profile.username + '#' + profile.discriminator,
			connected: {
				discordId: profile.id
			}
		}).save());
	}).catch(done);
}));

if (GITHUB_CLIENT_ID) passport.use(new GithubStrategy({
	clientID: GITHUB_CLIENT_ID,
	clientSecret: GITHUB_CLIENT_SECRET,
	callbackURL: '/oauth2/redirect/github'
}, (access, refresh, profile, done) => {
	User.findOne({ 'connected.githubId': profile.id }).then(async user => {
		if (user) return done(null, user);

		return done(null, await new User({
			username: profile.username,
			connected: {
				githubId: profile.id
			}
		}).save());
	}).catch(done);
}));

module.exports = (app) => {
	app.use(passport.initialize());
	app.use(passport.session());
};