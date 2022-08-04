const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const List = require('./models/List');
const User = require('./models/User');
const PairwiseSorter = require('./sorter.js');
const { JWT_SECRET } = require('./constants.js');
const { ObjectId } = require('mongodb');


function lists(request, response, next) {
	return List.find({ owner: request.user._id }).then(lists =>
		response.render('lists', {
			url: request.url,
			user: request.user,
			lists,
			...(arguments[3] || {})
		})
	).catch(next);
}

function getLastModifiedList(lists) {
	const modified = {};
	for (const list of lists) {
		modified[list._id] = +(list.updatedAt || list.modifiedAt);
		for (const item of list.items) {
			modified[list._id] = Math.max(modified[list._id], +(item.updatedAt || list.modifiedAt));
		}
		for (const a of list.comparisons.keys()) {
			for (const b of list.comparisons.get(a).keys()) {
				modified[list._id] = Math.max(modified[list._id], +list.comparisons.get(a).get(b).createdAt);
			}
		}
	}
	return Object.entries(modified).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function homepage(request, response) {
	return response.render('index', {
		url: request.url,
		user: request.user
	});
}

function createList(request, response, next) {
	if (request.body.name === '') return lists(request, response, next, { message: 'List name cannot be empty' });

	return new List({
		owner: request.user._id,
		name: request.body.name,
	}).save().then(({ _id }) =>
		response.redirect('/list/' + _id.toString() + '#sorted-tab')
	).catch(next);
}

function createItems(request, response, next) {
	const names = request.body.names?.split('\n').map(line => line.trim()).filter(Boolean) || [];
	if (!names.length) return getList(request, response, next, { message: 'At least one item name required' });

	List.updateOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, {
		$push: {
			items: {
				$each: names.map(name => ({
					name: name,
				}))
			}
		}
	}).then(() =>
		response.redirect('/list/' + request.params.list + '#sorted-tab')
	).catch(next);
}

const calculateProgress = (sorter) => sorter.size ? (sorter.current.item) / sorter.size : 1;

function getList(request, response, next) {
	return List.findOne({ _id: new ObjectId(request.params.list)}).then(list => {
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

		return response.render('list/index', {
			url: request.url,
			user: request.user,
			isOwner,
			list,
			denormalizedComparisons: denormalizedComparisons.sort((a, b) => b.createdAt - a.createdAt),
			listProgress: calculateProgress(sorter),
			order: sorter.getOrder(),
			...arguments[3] || {}
		});
	}).catch(next);
}


function compareItems(request, response, next) {
	return List.updateOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, {
		$set: {
			[`comparisons.${request.params.a}.${request.params.b}`]: {
				result: +request.body.result
			},
		}
	}).then(() =>
		response.redirect('/list/' + request.params.list + '/comparisons')
	).catch(next);
}

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

function getNextComparison(request, response, next) {
	return List.findOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}).then(list => {
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
	}).catch(next);
}

function logout(_, response) {
	response.clearCookie('token');
	return response.redirect('/');
}

function signup(request, response, next) {
	return User.findOne({
		username: new RegExp('^' + request.body.username + '$', 'i'),
	}).then(async existing => {
		if (existing) {
			return response.render('signup', {
				url: request.url,
				user: request.user,
				message: 'Username already exists'
			});
		}
		const userData = {
			username: request.body.username,
			password: await bcrypt.hash(request.body.password, 10),
			createdAt: new Date(),
		};

		const user = await new User(userData).save();

		await List.updateMany({
			owner: request.user._id
		}, {
			$set: {
				owner: user.insertedId
			}
		});

		const token = jwt.sign({ _id: user.insertedId, username: userData.username, createdAt: userData.createdAt }, JWT_SECRET, { expiresIn: '1d' });
		response.cookie('token', token);

		const lastModifiedID = getLastModifiedList(await List.find({
			owner: user._id
		}));
		if (lastModifiedID) return response.redirect(`/list/${lastModifiedID}#sorted-tab`);
		return response.redirect('/');
	}).catch(next);
}

function login(request, response, next) {
	User.findOne({ username: new RegExp('^' + request.body.username + '$', 'i') }).then(async user => {
		if (!user) {
			return response.render('login', {
				url: request.url,
				user: request.user,
				message: 'Username not found'
			});
		}
		if (!await bcrypt.compare(request.body.password, user.password)) {
			return response.render('login', {
				url: request.url,
				user: request.user,
				message: 'Wrong password'
			});
		}

		await List.updateMany({ owner: request.user._id }, {
			owner: user._id
		});

		const token = jwt.sign({ _id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
		response.cookie('token', token);

		const lastModifiedID = getLastModifiedList(await List.find({
			owner: user._id
		}));
		if (lastModifiedID) return response.redirect(`/list/${lastModifiedID}#sorted-tab`);
		return response.redirect('/');
	}).catch(next);
}

function deleteList(request, response, next) {
	return List.deleteOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}).then(() =>
		response.redirect('/')
	).catch(next);
}

function deleteItem(request, response, next) {
	return List.findOneAndUpdate({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, {
		$pull: {
			items: { _id: new ObjectId(request.params.item) },
		},
		$unset: {
			[`comparisons.${request.params.item}`]: 1,
		}
	}).then(({ comparisons }) => {
		const $unset = generateNestedUnsets(request.params.item, comparisons);
		return Object.keys($unset).length ? List.updateOne({
			_id: new ObjectId(request.params.list),
			owner: request.user._id,
		}, {
			$unset,
		}) : null;
	}).then(() =>
		response.redirect('/list/' + request.params.list + '#unsorted-tab')
	).catch(next);
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

function resetItem(request, response, next) {
	return List.findOneAndUpdate({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, {
		$unset: {
			[`comparisons.${request.params.item}`]: 1,
		}
	}).then(({ comparisons }) => {
		const $unset = generateNestedUnsets(request.params.item, comparisons);

		return Object.keys($unset).length ? List.updateOne({
			_id: new ObjectId(request.params.list),
			owner: request.user._id,
		}, {
			$unset
		}) : null;
	})
		.then(() => response.redirect('/list/' + request.params.list + '#sorted-tab'))
		.catch(next);
}

function resetComparison(request, response, next) {
	return List.findOneAndUpdate({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, {
		$unset: {
			[`comparisons.${request.params.a}.${request.params.b}`]: 1,
		}
	})
		.then(() => response.redirect('/list/' + request.params.list + '#comparisons-tab'))
		.catch(next);
}

function resetListComparisons(request, response, next) {
	return List.findOneAndUpdate({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, {
		$set: {
			comparisons: {},
		}
	}).then(() =>
		response.redirect('/list/' + request.params.list + '#sorted-tab')
	).catch(next);
}

function patchList(request, response, next) {
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

	return List.updateOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, updateFilter).then(() =>
		response.redirect('/list/' + request.params.list + '#sorted-tab')
	).catch(next);
}

function renderItemRenamePage(request, response, next) {
	return List.findOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}).then(list => {
		if (!list) return response.redirect('/');
		const itemID = new ObjectId(request.params.item);
		const item = list.items.find(item => item._id.equals(itemID));
		if (!item) return response.redirect('/');
		return response.render('list/rename-item', {
			url: request.url,
			user: request.user,
			list: list,
			item,
			...arguments[3] || {}
		});
	}).catch(next);
}

function patchItem(request, response, next) {
	if (request.body.name === '') return renderItemRenamePage(request, response, next, { message: 'New item name cannot be empty' });
	return List.updateOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
		items: { $elemMatch: { _id: new ObjectId(request.params.item) } }
	}, {
		$set: {
			'items.$.name': request.body.name
		}
	}).then(() =>
		response.redirect('/list/' + request.params.list + '#unsorted-tab')
	).catch(next);
}

module.exports = { login, logout, signup, createList, createItems, deleteList, deleteItem, resetItem, resetComparison, resetListComparisons, compareItems, getNextComparison, getList, homepage, lists, renderItemRenamePage, patchItem, patchList };