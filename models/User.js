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
	twitchId: {
		type: String,
	},
	dropboxId: {
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
}, {
	timestamps: { createdAt: true },
	virtuals: {
		hasOnlyOAuth: {
			get() {
				return !this.username
			}
		}
	}
});

userSchema.virtual('lists', {
  ref: 'List',
  localField: '_id',
  foreignField: 'owner'
});

for (const method of ['updateOne', 'updateMany', 'findOneAndUpdate']) userSchema.pre(method, function (next) {
	this.options.runValidators = true;
	next();
});


module.exports = model('User', userSchema, 'users');