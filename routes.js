const express = require('express');
const { handleToken, requireToken } = require('./middlewares.js');
const { homepage, lists, createList, createItems, compareItems, getList, getNextComparison, logout, login, signup, deleteList, deleteItem, resetItem, resetListComparisons, resetComparison, renderItemRenamePage, patchItem, patchList } = require('./controllers.js');
const router = express.Router();

router.get('/', handleToken, homepage);
router.get('/lists', handleToken, lists);


router.post('/list', requireToken, createList);

router.route('/list/:list')
	.get(handleToken, getList)
	.post(requireToken, createItems)
	.patch(requireToken, patchList)
	.delete(requireToken, deleteList);

router.route('/list/:list/comparisons')
	.all(requireToken)
	.get(getNextComparison)
	.put(resetListComparisons);

router.route('/list/:list/:item')
	.all(requireToken)
	.get(renderItemRenamePage)
	.patch(patchItem)
	.delete(deleteItem);

router.put('/list/:list/:item/comparisons', requireToken, resetItem);

router.route('/list/:list/:a/:b')
	.all(requireToken)
	.post(compareItems)
	.delete(resetComparison);


router.get('/logout', logout);

router.route('/login')
	.all(handleToken)
	.get((request, response) => response.render('login', {
		url: request.url,
		user: request.user
	}))
	.post(login);

router.route('/signup')
	.all(handleToken)
	.get((request, response) => response.render('signup', {
		url: request.url,
		user: request.user
	}))
	.post(signup);


module.exports = router;