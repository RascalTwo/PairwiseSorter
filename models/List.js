const { model, Schema, Types } = require('mongoose');
const PairwiseSorter = require('../sorter.js');

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
	htmlGeneratingCode: {
		type: String,
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
}, {
	timestamps: true,
	methods: {
		getSorter({ states: getStates = false } = {}) {
			if (getStates && this._sorterStates) return { sorter: this._sorter, states: this._sorterStates}
			if (this._sorter) return { sorter: this._sorter };

			const sorter = new PairwiseSorter(this.items.length);

			const states = [];

			for (let question = sorter.getQuestion(); question; question = sorter.getQuestion()) {
				if (getStates) states.push({ order: sorter.getOrder(), current: { ...sorter.current } });
				const [ai, bi] = question;
				const a = this.items[ai]._id.toString();
				const b = this.items[bi]._id.toString();
				const current = getStates ? { ...sorter.current } : undefined;
				if (this.comparisons.has(a) && this.comparisons.get(a).has(b)) {
					const result = this.comparisons.get(a).get(b).result;
					if (getStates) {
						if (result === -1) current.max = current.try;
						else current.min = current.try + 1;
					}

					sorter.addAnswer(result);
				} else if (this.comparisons.has(b) && this.comparisons.get(b).has(a)) {
					const result = this.comparisons.get(b).get(a).result;
					if (getStates) {
						if (result === -1) current.max = current.try;
						else current.min = current.try + 1;
					}

					sorter.addAnswer(result);
				} else {
					break;
				}
				if (getStates) states.push({ order: sorter.getOrder(), current });
			}

			if (getStates) states.push({ order: sorter.getOrder() });

			if (getStates) this._sorterStates = states;
			this._sorter = sorter

			return { sorter, states: getStates ? states : undefined };
		},
		getSortInfo({ progress = false, order = false, states = false }) {
			const { sorter, states: gotStates} = this.getSorter({ states });
			return {
				progress: progress ? sorter.getProgress() : undefined,
				order: order ? sorter.getOrder() : undefined,
				states: states ? gotStates : undefined,
			}
		},
	}
});

for (const method of ['updateOne', 'updateMany', 'findOneAndUpdate']) listSchema.pre(method, function (next) {
	this.options.runValidators = true;
	next();
});


module.exports = model('List', listSchema, 'lists');