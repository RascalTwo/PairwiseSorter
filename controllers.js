const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const getClient = require('./database.js');
const PairwiseSorter = require('./sorter.js');
const { JWT_SECRET } = require('./constants.js');

module.exports.lists = function lists(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').find({
		owner: request.user.id
	}).toArray()).then(lists =>
		response.render('lists', {
			user: request.user,
			lists
		})).catch(next);
};

module.exports.homepage = function homepage(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').find({
		owner: request.user.id
	}).toArray()).then(lists => {
		const modified = {};
		for (const list of lists) {
			modified[list.id] = list.modifiedAt;
			for (const item of list.items) {
				modified[list.id] = Math.min(modified[list.id], item.modifiedAt);
			}
			for (const a in list.comparisons) {
				for (const b in list.comparisons[a]) {
					modified[list.id] = Math.min(modified[list.id], list.comparisons[a][b].modifiedAt);
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
		owner: request.user.id,
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
		_id: request.params.list,
		owner: request.user.id,
	}, {
		$push: {
			items: {
				id: request.body.id,
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

module.exports.getList = function getList(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').findOne({
		_id: request.params.list,
		owner: request.user.id
	})).then(list => {
		if (!list) return response.status(404).end();
		const sorter = listToSorter(list);
		return response.render('list', {
			user: request.user,
			list,
			listProgress: sorter.current.item / list.items.length,
		});
	}
	).catch(next);
};


module.exports.compareItems = function compareItems(request, response, next) {
	const now = new Date();
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').updateOne({
		_id: request.params.list,
		owner: request.user.id,
	}, {
		$set: {
			[`comparisons.${request.params.a}.${request.params.b}`]: {
				result: request.params.result,
				createdAt: now,
				modifiedAt: now,
			},
		}
	})).then(() =>
		response.redirect('/list/' + request.params.list)
	).catch(next);
};

function listToSorter(list) {
	const sorter = new PairwiseSorter(list.items.length);

	let oldCT = sorter.current.try;
	for (let question = sorter.getQuestion(); question; oldCT = sorter.current.try, question = sorter.getQuestion()) {
		const [ai, bi] = question;
		const a = list.items[ai];
		const b = list.items[bi];
		if (list.comparisons[a.id] && list.comparisons[a.id][b.id]) {
			sorter.addAnswer(list.comparisons[a.id][b.id].result);
		} else if (list.comparisons[b.id] && list.comparisons[b.id][a.id]) {
			sorter.addAnswer(list.comparisons[b.id][a.id].result);
		} break;
	}

	if (sorter.current.try !== oldCT) {
		sorter.current.try = oldCT;
	}

	return sorter;
}

module.exports.getNextComparison = function getNextComparison(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').findOne({
		_id: request.params.list,
		owner: request.user.id,
	})).then(list => {
		const sorter = listToSorter(list);
		const question = sorter.getQuestion();
		return response.render('compare', {
			user: request.user,
			comparison: question ? {
				a: list.items[question[0]],
				b: list.items[question[1]],
			} : null,
		});
	}).catch(next);
};

module.exports.logout = function logout(request, response) {
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