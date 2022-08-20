const PairwiseSorter = require('./sorter.js');

function listToSorter(list) {
	const sorter = new PairwiseSorter(list.items.length);

	for (let question = sorter.getQuestion(); question; question = sorter.getQuestion()) {
		const [ai, bi] = question;
		const a = list.items[ai]._id.toString();
		const b = list.items[bi]._id.toString();
		if (list.comparisons.has(a) && list.comparisons.get(a).has(b)) {
			sorter.addAnswer(list.comparisons.get(a).get(b).result);
		} else if (list.comparisons.has(b) && list.comparisons.get(b).has(a)) {
			sorter.addAnswer(list.comparisons.get(b).get(a).result);
		} else {
			break;
		}
	}

	return sorter;
}

const calculateProgress = (sorter) => sorter.size ? (sorter.current.item) / sorter.size : 1;

module.exports = { listToSorter, calculateProgress };