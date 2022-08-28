const List = require('../models/List');
const { listToSorter, calculateProgress } = require('../helpers.js');


async function renderHomepage(request, response) {
	const lists = await List.find({ public: true }).populate('owner');
	return response.render('index', {
		url: request.url,
		user: request.user,
		lists: lists.map(list => {
			const sorter = listToSorter(list);

			return {
				...list.toObject(),
				progress: calculateProgress(sorter),
				order: sorter.getOrder(),
			};
		})
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