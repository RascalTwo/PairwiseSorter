const { model, Schema, Types } = require('mongoose');

const listSchema = new Schema({
	owner: {
		type: Types.ObjectId,
		required: true,
		ref: 'User'
	},
	name: {
		type: String,
		required: true,
		minLength: 3
	},
	public: {
		type: Boolean,
		validate: {
			validator: (value) => value === true,
			message: props => `${props.value} can only be true`
		},
	},
	items: [new Schema({ name: { type: String, minLength: 1, required: true } }, { timestamps: true })],
	comparisons: {
		type: Map,
		default: new Map(),
		of: {
			type: Map,
			of: new Schema({
				result: {
					type: Number,
					validate: {
						validator: (value) => [-1, 0, 1].includes(value),
						message: props => `${props.value} is not -1, 0, or 1`
					},
					required: true
				}, createdAt: {
					type: Date,
					default: Date.now,
				}
			}, { timestamps: true })
		}
	}
}, { timestamps: true });

for (const method of ['updateOne', 'updateMany', 'findOneAndUpdate']) listSchema.pre(method, function (next) {
	this.options.runValidators = true;
	next();
});


module.exports = model('List', listSchema, 'lists');