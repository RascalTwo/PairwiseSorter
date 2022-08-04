const { model, Schema } = require('mongoose');

module.exports = model('User', new Schema({
	username: {
		type: String,
		required: true,
		minLength: 3
	},
	password: {
		type: String,
		required: true
	}
}, { timestamps: { createdAt: true } }), 'users');