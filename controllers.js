const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const getClient = require('./database.js');
const PairwiseSorter = require('./sorter.js');
const { JWT_SECRET } = require('./constants.js');
const { ObjectId } = require('mongodb');


function lists(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').find({
		owner: request.user._id
	}).toArray()).then(lists =>
		response.render('lists', {
			url: request.url,
			user: request.user,
			lists,
			...(arguments[3] || {})
		})).catch(next);
}

function getLastModifiedList(lists) {
	const modified = {};
	for (const list of lists) {
		modified[list._id] = +list.modifiedAt;
		for (const item of list.items) {
			modified[list._id] = Math.max(modified[list._id], +item.modifiedAt);
		}
		for (const a in list.comparisons) {
			for (const b in list.comparisons[a]) {
				modified[list._id] = Math.max(modified[list._id], +list.comparisons[a][b].createdAt);
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
	const now = new Date();
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').insertOne({
		owner: request.user._id,
		name: request.body.name,
		createdAt: now,
		modifiedAt: now,
		items: [],
		comparisons: {}
	})).then(({ insertedId }) =>
		response.redirect('/list/' + insertedId.toString() + '#sorted-tab')
	).catch(next);
}

function createItems(request, response, next) {
	const names = request.body.names?.split('\n').map(line => line.trim()).filter(Boolean) || [];
	if (!names.length) return getList(request, response, next, { message: 'At least one item name required' });

	const now = new Date();
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').updateOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, {
		$push: {
			items: {
				$each: names.map(name => ({
					_id: new ObjectId(),
					name: name,
					createdAt: now,
					modifiedAt: now,
				}))
			}
		},
		$set: {
			modifiedAt: now
		}
	})).then(() =>
		response.redirect('/list/' + request.params.list + '#sorted-tab')
	).catch(next);
}

const calculateProgress = (sorter) => sorter.size ? (sorter.current.item) / sorter.size : 1;

function getList(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').findOne({
		_id: new ObjectId(request.params.list)
	})).then(list => {
		if (!list) return response.status(404).end();

		const isOwner = list.owner.equals(request.user._id);
		if (!isOwner && !list.public) return response.status(403).end();

		const sorter = listToSorter(list);

		const denormalizedComparisons = [];
		for (const a in list.comparisons) {
			for (const b in list.comparisons[a]) {
				denormalizedComparisons.push({
					a, b,
					...list.comparisons[a][b]
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
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').updateOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, {
		$set: {
			[`comparisons.${request.params.a}.${request.params.b}`]: {
				result: +request.params.result,
				createdAt: new Date(),
			},
		}
	})).then(() =>
		response.redirect('/list/' + request.params.list + '/compare')
	).catch(next);
}

function listToSorter(list) {
	const sorter = new PairwiseSorter(list.items.length);

	for (let question = sorter.getQuestion(); question; question = sorter.getQuestion()) {
		const [ai, bi] = question;
		const a = list.items[ai];
		const b = list.items[bi];
		if (list.comparisons[a._id] && list.comparisons[a._id][b._id]) {
			sorter.addAnswer(list.comparisons[a._id][b._id].result);
		} else if (list.comparisons[b._id] && list.comparisons[b._id][a._id]) {
			sorter.addAnswer(list.comparisons[b._id][a._id].result);
		} else {
			break;
		}
	}

	return sorter;
}

function getNextComparison(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').findOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	})).then(list => {
		const sorter = listToSorter(list);
		const question = sorter.getQuestion();
		if (!question) return response.redirect('/list/' + request.params.list + '#sorted-tab');
		return response.render('compare', {
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
	return getClient().then(async client => {
		const existing = await client.db('pairwise-sorter').collection('users').findOne({
			username: new RegExp('^' + request.body.username + '$', 'i'),
		});
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

		const user = await client.db('pairwise-sorter').collection('users').insertOne(userData);

		await client.db('pairwise-sorter').collection('lists').updateMany({
			owner: request.user._id
		}, {
			$set: {
				owner: user.insertedId
			}
		});

		const token = jwt.sign({ _id: user.insertedId, username: userData.username, createdAt: userData.createdAt }, JWT_SECRET, { expiresIn: '1d' });
		response.cookie('token', token);

		const lastModifiedID = getLastModifiedList(await client.db('pairwise-sorter').collection('lists').find({
			owner: user._id
		}).toArray());
		if (lastModifiedID) return response.redirect(`/list/${lastModifiedID}#sorted-tab`);
		return response.redirect('/');
	}).catch(next);
}

function login(request, response, next) {
	return getClient().then(async client => {
		const user = await client.db('pairwise-sorter').collection('users').findOne({
			username: new RegExp('^' + request.body.username + '$', 'i'),
		});
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

		await client.db('pairwise-sorter').collection('lists').updateMany({
			owner: request.user._id
		}, {
			$set: {
				owner: user._id
			}
		});

		const token = jwt.sign({ _id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
		response.cookie('token', token);

		const lastModifiedID = getLastModifiedList(await client.db('pairwise-sorter').collection('lists').find({
			owner: user._id
		}).toArray());
		if (lastModifiedID) return response.redirect(`/list/${lastModifiedID}#sorted-tab`);
		return response.redirect('/');
	}).catch(next);
}

function deleteList(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').deleteOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	})).then(() =>
		response.redirect('/')
	).catch(next);
}

function deleteItem(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').findOneAndUpdate({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, {
		$pull: {
			items: { _id: new ObjectId(request.params.item) },
		},
		$unset: {
			[`comparisons.${request.params.item}`]: 1,
		}
	}).then(({ value: { comparisons } }) => {
		const $unset = generateNestedUnsets(request.params.item, comparisons);
		return Object.keys($unset).length ? client.db('pairwise-sorter').collection('lists').updateOne({
			_id: new ObjectId(request.params.list),
			owner: request.user._id,
		}, {
			$unset,
		}) : null;
	})).then(() =>
		response.redirect('/list/' + request.params.list + '#unsorted-tab')
	).catch(next);
}

function generateNestedUnsets(deleting, comparisons) {
	const $unset = {};
	for (const key in comparisons) {
		if (deleting in comparisons[key]) {
			$unset[`comparisons.${key}.${deleting}`] = 1;
		}
	}
	return $unset;
}

function resetItem(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').findOneAndUpdate({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, {
		$unset: {
			[`comparisons.${request.params.item}`]: 1,
		}
	}).then(({ value: { comparisons } }) => {
		const $unset = generateNestedUnsets(request.params.item, comparisons);

		return Object.keys($unset).length ? client.db('pairwise-sorter').collection('lists').updateOne({
			_id: new ObjectId(request.params.list),
			owner: request.user._id,
		}, {
			$unset
		}) : null;
	}))
		.then(() => response.redirect('/list/' + request.params.list + '#sorted-tab'))
		.catch(next);
}

function resetComparison(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').findOneAndUpdate({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, {
		$unset: {
			[`comparisons.${request.params.a}.${request.params.b}`]: 1,
		}
	}))
		.then(() => response.redirect('/list/' + request.params.list + '#comparisons-tab'))
		.catch(next);
}

function resetListComparisons(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').findOneAndUpdate({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, {
		$set: {
			comparisons: {},
		}
	})).then(() =>
		response.redirect('/list/' + request.params.list + '#sorted-tab')
	).catch(next);
}

function setListPublicity(request, response, next) {
	const public = request.params.public === 'true';

	const updateFilter = {
		$set: {
			modifiedAt: new Date()
		}
	};
	if (public) {
		updateFilter.$set.public = true;
	} else {
		updateFilter.$unset = { public: 1 };
	}

	return getClient().then(client => client.db('pairwise-sorter').collection('lists').updateOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, updateFilter)).then(() =>
		response.redirect('/list/' + request.params.list + '#sorted-tab')
	).catch(next);
}

function renderRenamePage(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').findOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	})).then(list => {
		if (!list) return response.redirect('/');
		return response.render('list/rename', {
			url: request.url,
			user: request.user,
			list: list,
			...arguments[3] || {}
		});
	}).catch(next);
}

function renameList(request, response, next) {
	if (request.body.name === '') return renderRenamePage(request, response, next, { message: 'New list name cannot be empty' });
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').updateOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, {
		$set: {
			name: request.body.name,
			modifiedAt: new Date()
		}
	})).then(() =>
		response.redirect('/list/' + request.params.list + '#sorted-tab')
	).catch(next);
}

function renderItemRenamePage(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').findOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	})).then(list => {
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

function renameItem(request, response, next) {
	if (request.body.name === '') return renderItemRenamePage(request, response, next, { message: 'New item name cannot be empty' });
	const itemID = new ObjectId(request.params.item);
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').updateOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
		items: { $elemMatch: { _id: itemID } }
	}, {
		$set: {
			modifiedAt: new Date(),
			'items.$.name': request.body.name,
		}
	})).then(() =>
		response.redirect('/list/' + request.params.list + '#unsorted-tab')
	).catch(next);
}

module.exports = { login, logout, signup, createList, createItems, deleteList, deleteItem, resetItem, resetComparison, resetListComparisons, setListPublicity, compareItems, getNextComparison, getList, homepage, lists, renameList, renderRenamePage, renderItemRenamePage, renameItem };