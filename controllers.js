const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const getClient = require('./database.js');
const PairwiseSorter = require('./sorter.js');
const { JWT_SECRET } = require('./constants.js');
const { ObjectId } = require('mongodb');


module.exports.lists = function lists(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').find({
		owner: request.user._id
	}).toArray()).then(lists =>
		response.render('lists', {
			user: request.user,
			lists
		})).catch(next);
};

module.exports.homepage = function homepage(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').find({
		owner: request.user._id
	}).toArray()).then(lists => {
		const modified = {};
		for (const list of lists) {
			modified[list._id] = +list.modifiedAt;
			for (const item of list.items) {
				modified[list._id] = Math.max(modified[list._id], +item.modifiedAt);
			}
			for (const a in list.comparisons) {
				for (const b in list.comparisons[a]) {
					modified[list._id] = Math.max(modified[list._id], +list.comparisons[a][b].modifiedAt);
				}
			}
		}
		const lastModifiedID = Object.entries(modified).sort((a, b) => b[1] - a[1])[0]?.[0];
		if (lastModifiedID) return response.redirect('/list/' + lastModifiedID);
		return response.render('index', {
			user: request.user
		});
	}).catch(next);
};

module.exports.createList = function createList(request, response, next) {
	const now = new Date();
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').insertOne({
		owner: request.user._id,
		name: request.body.name,
		createdAt: now,
		modifiedAt: now,
		items: [],
		comparisons: {}
	})).then(({ insertedId }) =>
		response.redirect('/list/' + insertedId.toString())
	).catch(next);
};

module.exports.createItem = function createItem(request, response, next) {
	const now = new Date();
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').updateOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, {
		$push: {
			items: {
				_id: new ObjectId(),
				name: request.body.name,
				createdAt: now,
				modifiedAt: now,
			}
		},
		$set: {
			modifiedAt: now
		}
	})).then(() =>
		response.redirect('/list/' + request.params.list)
	).catch(next);
};

const calculateProgress = (sorter) => sorter.size ? (sorter.current.item) / sorter.size : 1;

module.exports.getList = function getList(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').findOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id
	})).then(list => {
		if (!list) return response.status(404).end();
		const sorter = listToSorter(list);
		return response.render('list', {
			user: request.user,
			list,
			listProgress: calculateProgress(sorter),
			order: sorter.getOrder(),
		});
	}
	).catch(next);
};


module.exports.compareItems = function compareItems(request, response, next) {
	const now = new Date();
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').updateOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, {
		$set: {
			[`comparisons.${request.params.a}.${request.params.b}`]: {
				result: +request.params.result,
				createdAt: now,
				modifiedAt: now,
			},
		}
	})).then(() =>
		response.redirect('/list/' + request.params.list + '/compare')
	).catch(next);
};

function listToSorter(list) {
	const sorter = new PairwiseSorter(list.items.length);

	//let oldCT = sorter.current.try;
	for (let question = sorter.getQuestion(); question; /*oldCT = sorter.current.try, */question = sorter.getQuestion()) {
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

	//if (sorter.current.try !== oldCT) {
	//		sorter.current.try = oldCT;
	//	}

	return sorter;
}

module.exports.getNextComparison = function getNextComparison(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').findOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	})).then(list => {
		const sorter = listToSorter(list);
		const question = sorter.getQuestion();
		if (!question) return response.redirect('/list/' + request.params.list);
		return response.render('compare', {
			user: request.user,
			list,
			listProgress: calculateProgress(sorter),
			comparison: {
				a: list.items[question[0]],
				b: list.items[question[1]],
			}
		});
	}).catch(next);
};

module.exports.logout = function logout(_, response) {
	response.clearCookie('token');
	return response.redirect('/');
};

module.exports.signup = function signup(request, response, next) {
	return getClient().then(async client => {
		const existing = await client.db('pairwise-sorter').collection('users').findOne({
			username: new RegExp('^' + request.body.username + '$', 'i'),
		});
		if (existing) {
			return response.render('signup', {
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
		const token = jwt.sign({ _id: user.insertedId, username: userData.username, createdAt: userData.createdAt }, JWT_SECRET, { expiresIn: '1d' });
		response.cookie('token', token);
		return response.redirect('/');
	}).catch(next);
};

module.exports.login = function login(request, response, next) {
	return getClient().then(async client => {
		const user = await client.db('pairwise-sorter').collection('users').findOne({
			username: new RegExp('^' + request.body.username + '$', 'i'),
		});
		if (!user) {
			return response.render('login', {
				user: request.user,
				message: 'Username not found'
			});
		}
		if (!await bcrypt.compare(request.body.password, user.password)) {
			return response.render('login', {
				user: request.user,
				message: 'Wrong password'
			});
		}
		const token = jwt.sign({ _id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
		response.cookie('token', token);
		return response.redirect('/');
	}).catch(next);
};

module.exports.deleteList = function deleteList(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').deleteOne({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	})).then(() =>
		response.redirect('/')
	).catch(next);
};

module.exports.deleteItem = function deleteItem(request, response, next) {
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
		response.redirect('/list/' + request.params.list)
	).catch(next);
};

function generateNestedUnsets(deleting, comparisons) {
	const $unset = {};
	for (const key in comparisons) {
		if (deleting in comparisons[key]) {
			$unset[`comparisons.${key}.${deleting}`] = 1;
		}
	}
	return $unset;
}

module.exports.resetItem = function resetItem(request, response, next) {
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
		.then(() => response.redirect('/list/' + request.params.list))
		.catch(next);
};

module.exports.resetListComparisons = function resetListComparisons(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').findOneAndUpdate({
		_id: new ObjectId(request.params.list),
		owner: request.user._id,
	}, {
		$set: {
			comparisons: {},
		}
	})).then(() =>
		response.redirect('/list/' + request.params.list)
	).catch(next);
};