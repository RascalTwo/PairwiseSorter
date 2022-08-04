const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20');
const bcrypt = require('bcrypt');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('./constants');
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

passport.use(new GoogleStrategy({
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

module.exports = (app) => {
	app.use(passport.initialize());
	app.use(passport.session());
};