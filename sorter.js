// https://stackoverflow.com/a/32002512/12773549
module.exports = class PairwiseSorter {
	/**
	 * @param {number} size
	 */
	constructor(size) {
		this.size = size;
		this.items = [{ item: 0, equals: [] }];
		this.current = { item: 1, try: 0, min: 0, max: 1 };
	}

	/**
	 * @param {-1 | 0 | 1} preference
	 */
	addAnswer(preference) {
		if (!preference) {
			this.items[this.current.try].equals.push(this.current.item);
			this.current = { item: ++this.current.item, try: 0, min: 0, max: this.items.length };
			return;
		}

		if (preference === -1) this.current.max = this.current.try;
		else this.current.min = this.current.try + 1;

		if (this.current.min !== this.current.max) return;
		this.items.splice(this.current.min, 0, { item: this.current.item, equals: [] });
		this.current = { item: ++this.current.item, try: 0, min: 0, max: this.items.length };
	}

	/**
	 * @returns {[number, number]}
	 */
	getQuestion() {
		if (this.current.item >= this.size) return null;
		this.current.try = Math.floor((this.current.min + this.current.max) / 2);
		return [this.current.item, this.items[this.current.try].item];
	}

	/**
	 * @returns {number[]}
	 */
	getOrder() {
		const indexes = [];
		for (const i in this.items) {
			indexes.push(this.items[i].item);
			for (const j in this.items[i].equals) {
				indexes.push(this.items[i].equals[j]);
			}
		}

		return indexes;
	}
};
