const List = require('../models/List');
const PairwiseSorter = require('../sorter.js');
const { listToSorter, calculateProgress } = require('../helpers.js');

async function createList(request, response, next) {
	if (request.body.name === '') return lists(request, response, next, { message: 'List name cannot be empty' });

	const newList = await new List({
		owner: request.user._id,
		name: request.body.name,
	}).save();

	response.redirect('/list/' + newList._id.toString() + '#sorted-tab');
}

async function createItems(request, response, next) {
	const names = request.body.names?.split('\n').map(line => line.trim()).filter(Boolean) || [];
	if (!names.length) return getList(request, response, next, { message: 'At least one item name required' });

	await List.updateOne({
		_id: request.params.list,
		owner: request.user._id,
	}, {
		$push: {
			items: {
				$each: names.map(name => ({
					name: name,
				}))
			}
		}
	});

	response.redirect('/list/' + request.params.list + '#sorted-tab');
}

function getSortStates(list){
	const sorter = new PairwiseSorter(list.items.length);

	const states = [];

	for (let question = sorter.getQuestion(); question; question = sorter.getQuestion()) {
		states.push({ order: sorter.getOrder(), current: { ...sorter.current }});
		const [ai, bi] = question;
		const a = list.items[ai]._id.toString();
		const b = list.items[bi]._id.toString();
		const current = { ...sorter.current };
		if (list.comparisons.has(a) && list.comparisons.get(a).has(b)) {
			const result = list.comparisons.get(a).get(b).result;
			if (result === -1) current.max = current.try;
			else current.min = current.try + 1;

			sorter.addAnswer(result);
		} else if (list.comparisons.has(b) && list.comparisons.get(b).has(a)) {
			const result = list.comparisons.get(b).get(a).result;
			if (result === -1) current.max = current.try;
			else current.min = current.try + 1;

			sorter.addAnswer(result);
		} else {
			break;
		}
		states.push({ order: sorter.getOrder(), current});
	}

	states.push({ order: sorter.getOrder() });

	return states;
}

async function getList(request, response) {
	const list = await List.findOne({ _id: request.params.list });
	if (!list) return response.status(404).end();

	const isOwner = list.owner.equals(request.user._id);
	if (!isOwner && !list.public) return response.status(403).end();

	const sorter = listToSorter(list);

	const denormalizedComparisons = [];
	for (const a of list.comparisons.keys()) {
		for (const b of list.comparisons.get(a).keys()) {
			denormalizedComparisons.push({
				a, b,
				...list.comparisons.get(a).get(b).toObject()
			});
		}
	}

	return response.render('list', {
		url: request.url,
		user: request.user,
		isOwner,
		list,
		denormalizedComparisons: denormalizedComparisons.sort((a, b) => b.createdAt - a.createdAt),
		listProgress: calculateProgress(sorter),
		order: sorter.getOrder(),
		sortStates: getSortStates(list),
		...arguments[3] || {}
	});
}


async function compareItems(request, response) {
	await List.updateOne({
		_id: request.params.list,
		owner: request.user._id,
	}, {
		$set: {
			[`comparisons.${request.params.a}.${request.params.b}`]: {
				result: +request.body.result
			},
		}
	});

	response.redirect('/list/' + request.params.list + '/comparisons');
}

async function getNextComparison(request, response) {
	const list = await List.findOne({
		_id: request.params.list,
		owner: request.user._id,
	});
	const sorter = listToSorter(list);
	const question = sorter.getQuestion();
	if (!question) return response.redirect('/list/' + request.params.list + '#sorted-tab');
	return response.render('comparisons', {
		url: request.url,
		user: request.user,
		list,
		listProgress: calculateProgress(sorter),
		comparison: {
			a: list.items[question[0]],
			b: list.items[question[1]],
		}
	});
}

async function deleteList(request, response) {
	await List.deleteOne({
		_id: request.params.list,
		owner: request.user._id,
	});

	response.redirect('/');
}

async function deleteItem(request, response) {
	const filter = {
		_id: request.params.list,
		owner: request.user._id,
	};

	const { comparisons } = await List.findOneAndUpdate(filter, {
		$pull: { items: { _id: request.params.item } },
		$unset: { [`comparisons.${request.params.item}`]: 1 }
	});

	const $unset = generateNestedUnsets(request.params.item, comparisons);
	if (Object.keys($unset).length) await List.updateOne(filter, { $unset });

	response.redirect('/list/' + request.params.list + '#unsorted-tab');
}

function generateNestedUnsets(deleting, comparisons) {
	const $unset = {};
	for (const key of comparisons.keys()) {
		if (comparisons.get(key).has(deleting)) {
			$unset[`comparisons.${key}.${deleting}`] = 1;
		}
	}
	return $unset;
}

async function resetItem(request, response) {
	const filter = {
		_id: request.params.list,
		owner: request.user._id,
	};

	const { comparisons } = await List.findOneAndUpdate(filter, {
		$unset: { [`comparisons.${request.params.item}`]: 1 }
	});

	const $unset = generateNestedUnsets(request.params.item, comparisons);
	if (Object.keys($unset).length) await List.updateOne(filter, { $unset });

	response.redirect('/list/' + request.params.list + '#sorted-tab');
}

async function resetComparison(request, response) {
	await List.updateOne({
		_id: request.params.list,
		owner: request.user._id,
	}, {
		$unset: {
			[`comparisons.${request.params.a}.${request.params.b}`]: 1,
		}
	});

	response.redirect('/list/' + request.params.list + '#comparisons-tab');
}

async function resetListComparisons(request, response) {
	await List.updateOne({
		_id: request.params.list,
		owner: request.user._id,
	}, {
		$set: {
			comparisons: {},
		}
	});

	response.redirect('/list/' + request.params.list + '#sorted-tab');
}

async function patchList(request, response, next) {
	if (request.body.name === '') return getList(request, response, next, { message: 'New list name cannot be empty' });

	const updateFilter = {
		$set: {}
	};

	if ('public' in request.body) {
		if (request.body.public === 'true') {
			request.body.public = true;
		} else if (request.body.public === 'false') {
			updateFilter.$unset = { public: 1 };
			delete request.body.public;
		} else {
			return getList(request, response, next, { message: 'Invalid public value' });
		}
	}

	Object.assign(updateFilter.$set, request.body);

	await List.updateOne({
		_id: request.params.list,
		owner: request.user._id,
	}, updateFilter);

	response.redirect('/list/' + request.params.list + '#sorted-tab');
}

async function renderItemRenamePage(request, response) {
	const list = await List.findOne({
		_id: request.params.list,
		owner: request.user._id,
	});

	if (!list) return response.redirect('/');
	const itemID = request.params.item;
	const item = list.items.find(item => item._id.equals(itemID));
	if (!item) return response.redirect('/');
	return response.render('rename-item', {
		url: request.url,
		user: request.user,
		list: list,
		item,
		...arguments[3] || {}
	});
}

async function patchItem(request, response, next) {
	if (request.body.name === '') return renderItemRenamePage(request, response, next, { message: 'New item name cannot be empty' });
	await List.updateOne({
		_id: request.params.list,
		owner: request.user._id,
		items: { $elemMatch: { _id: request.params.item } }
	}, {
		$set: {
			'items.$.name': request.body.name
		}
	});

	response.redirect('/list/' + request.params.list + '#unsorted-tab');
}

module.exports = { createList, createItems, deleteList, deleteItem, resetItem, resetComparison, resetListComparisons, compareItems, getNextComparison, getList, renderItemRenamePage, patchItem, patchList };