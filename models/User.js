const { model, Schema } = require('mongoose');

const ConnectedProvidersSchema = new Schema({
	googleId: {
		type: String,
	},
	discordId: {
		type: String,
	},
	githubId: {
		type: String,
	},
	twitterId: {
		type: String,
	},
}, { timestamps: false, _id: false });

const userSchema = new Schema({
	username: {
		type: String,
		minLength: 3
	},
	password: {
		type: String,
	},
	connected: {
		type: ConnectedProvidersSchema,
		default: () => ({})
	}
}, { timestamps: { createdAt: true } });

for (const method of ['updateOne', 'updateMany', 'findOneAndUpdate']) userSchema.pre(method, function (next) {
	this.options.runValidators = true;
	next();
});


module.exports = model('User', userSchema, 'users');