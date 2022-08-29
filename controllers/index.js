const List = require('../models/List');


async function renderHomepage(request, response) {
	const lists = await List.find({ public: true }).populate('owner');
	return response.render('index', {
		url: request.url,
		user: request.user,
		lists: lists.map(list => ({
			...list.toObject(),
			...list.getSortInfo({ progress: true, order: true })
		}))
	});
}

async function renderLists(request, response) {
	const lists = await List.find({ owner: request.user._id });
	response.render('lists', {
		url: request.url,
		user: request.user,
		lists,
		...(arguments[3] || {})
	});
}


module.exports = { renderHomepage, renderLists };