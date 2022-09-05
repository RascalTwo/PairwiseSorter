const List = require('../models/List');

async function create(request, response, next) {
	if (request.body.name === '') return lists(request, response, next, { message: 'List name cannot be empty' });

	const newList = await new List({
		owner: request.user._id,
		name: request.body.name,
	}).save();

	response.redirect('/list/' + newList._id.toString() + '#sorted-tab');
}

async function createItems(request, response, next) {
	const names = request.body.names?.split('\n').map(line => line.trim()).filter(Boolean) || [];
	if (!names.length) return render(request, response, next, { message: 'At least one item name required' });

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


async function render(request, response) {
	const list = await List.findOne({ _id: request.params.list });
	if (!list) return response.status(404).end();

	const isOwner = list.owner.equals(request.user._id);
	if (!isOwner && !list.public) return response.status(403).end();

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
		isOwner,
		list,
		denormalizedComparisons: denormalizedComparisons.sort((a, b) => b.createdAt - a.createdAt),
		...list.getSortInfo({ progress: true, order: true, states: true }),
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

async function renderNextComparison(request, response) {
	const list = await List.findOne({
		_id: request.params.list,
		owner: request.user._id,
	});
	const question = list.getSorter().sorter.getQuestion();
	if (!question) return response.redirect('/list/' + request.params.list + '#sorted-tab');
	return response.render('comparisons', {
		list,
		...list.getSortInfo({ progress: true }),
		comparison: {
			a: list.items[question[0]],
			b: list.items[question[1]],
		}
	});
}

async function del(request, response) {
	await List.deleteOne({
		_id: request.params.list,
		owner: request.user._id,
	});

	response.redirect('/');
}

async function delItem(request, response) {
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

async function resetItemComparison(request, response) {
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

async function resetComparisons(request, response) {
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

async function update(request, response, next) {
	if (request.body.name === '') return render(request, response, next, { message: 'New list name cannot be empty' });

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
			return render(request, response, next, { message: 'Invalid public value' });
		}
	}

	if (request.body.htmlGeneratingCode === '') {
		updateFilter.$unset = { htmlGeneratingCode: 1 };
		delete request.body.htmlGeneratingCode;
	}

	Object.assign(updateFilter.$set, request.body);

	await List.updateOne({
		_id: request.params.list,
		owner: request.user._id,
	}, updateFilter);

	response.redirect('/list/' + request.params.list + '#sorted-tab');
}

async function renderItemRename(request, response) {
	const list = await List.findOne({
		_id: request.params.list,
		owner: request.user._id,
	});

	if (!list) return response.redirect('/');
	const itemID = request.params.item;
	const item = list.items.find(item => item._id.equals(itemID));
	if (!item) return response.redirect('/');
	return response.render('rename-item', {
		list,
		item,
		...arguments[3] || {}
	});
}

async function updateItem(request, response, next) {
	if (request.body.name === '') return renderItemRename(request, response, next, { message: 'New item name cannot be empty' });
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

async function bulkEditItems(request, response) {
	const newNames = new Set(request.body.newNames.split('\n').map(s => s.trim()).filter(Boolean));

	const list = await List.findOne({ _id: request.params.list, owner: request.user._id });

	const deletedIDs = new Set();
	for (let i = list.items.length - 1; i >= 0; i--) {
		if (newNames.has(list.items[i].name)) newNames.delete(list.items[i].name);
		else deletedIDs.add(list.items.splice(i, 1)[0].id);
	}

	for (const name of newNames) list.items.push({ name });

	for (const [key, sub] of list.comparisons) {
		if (deletedIDs.has(key)) {
			list.comparisons.delete(key);
			deletedIDs.delete(key);
			continue;
		}

		for (const key of sub.keys()) {
			if (deletedIDs.has(key)) {
				sub.delete(key);
				deletedIDs.delete(key);
			}
		}
	}
	await list.save();

	return response.redirect('/list/' + request.params.list + '#sorted-tab')
}

async function toggleItemCompleted(request, response){
	const completed = request.body.value === 'true';

	await List.updateOne({
		_id: request.params.list,
		owner: request.user._id,
		items: { $elemMatch: { _id: request.params.item } }
	}, completed ? {
		$set: {
			'items.$.completedAt': Date.now()
		}
	} : {
		$unset: {
			'items.$.completedAt': 1
		}
	});

	return response.redirect('/list/' + request.params.list + '#sorted-tab')
}

module.exports = { create, createItems, del, delItem, resetItem, resetItemComparison, resetComparisons, compareItems, renderNextComparison, render, renderItemRename, updateItem, update, bulkEditItems, toggleItemCompleted };