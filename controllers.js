const getClient = require('./database.js');

module.exports.getMe = function getMe(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').find({
		owner: request.user.id
	}).toArray()).then(lists =>
		response.json({
			token: request.token,
			lists: lists.map(list => ({
				id: list._id,
				name: list.name,
				items: list.items
			}))
		})
	).catch(next);
};

module.exports.createList = function createList(request, response, next) {
	return getClient().then(client => client.db('pairwise-sorter').collection('lists').insertOne({
		owner: request.user.id,
		name: request.body.name,
		items: []
	})).then(({ insertedId }) =>
		response.json(insertedId)
	).catch(next);
};