const List = require('../models/List');
const { listToSorter, calculateProgress } = require('../helpers.js');


async function homepage(request, response) {
	const lists = await List.find({ public: true });
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

async function lists(request, response) {
	const lists = await List.find({ owner: request.user._id });
	response.render('lists', {
		url: request.url,
		user: request.user,
		lists,
		...(arguments[3] || {})
	});
}


module.exports = { homepage, lists };