require('dotenv').config();

module.exports = [
	['PORT', 1337],
	['MONGODB_URL', 'mongodb://localhost:27017/pairwise-sorter'],
	['SESSION_SECRET', 'secret'],
	['NODE_ENV'],
	['GOOGLE_CLIENT_ID'],
	['GOOGLE_CLIENT_SECRET'],
	['DISCORD_CLIENT_ID'],
	['DISCORD_CLIENT_SECRET'],
	['GITHUB_CLIENT_ID'],
	['GITHUB_CLIENT_SECRET'],
	['TWITTER_CONSUMER_KEY'],
	['TWITTER_CONSUMER_SECRET'],
	['TWITCH_CLIENT_ID'],
	['TWITCH_CLIENT_SECRET']
].reduce((acc, [key, defaultValue]) => {
	acc[key] = process.env[key] || defaultValue;
	return acc;
}, {});