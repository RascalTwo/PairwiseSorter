const express = require('express');
const { handleToken, requireToken } = require('./middlewares.js');
const { homepage, lists, createList, createItems, compareItems, getList, getNextComparison, logout, login, signup, deleteList, deleteItem, resetItem, resetListComparisons, resetComparison, setListPublicity, renameList, renderRenamePage, renderItemRenamePage, renameItem } = require('./controllers.js');
const router = express.Router();

router.get('/', handleToken, homepage);
router.get('/lists', handleToken, lists);


router.post('/list', requireToken, createList);
router.get('/list/:list', handleToken, getList);
router.get('/list/:list/delete', requireToken, deleteList);
router.post('/list/:list/item', requireToken, createItems);
router.get('/list/:list/compare', requireToken, getNextComparison);
router.get('/list/:list/reset', requireToken, resetListComparisons);
router.get('/list/:list/rename', requireToken, renderRenamePage);
router.post('/list/:list/rename', requireToken, renameList);
router.get('/list/:list/public/:public', requireToken, setListPublicity);
router.get('/list/:list/:item/delete', requireToken, deleteItem);
router.get('/list/:list/:item/reset', requireToken, resetItem);
router.get('/list/:list/:item/rename', requireToken, renderItemRenamePage);
router.post('/list/:list/:item/rename', requireToken, renameItem);
router.get('/list/:list/:a/:b/reset', requireToken, resetComparison);
router.get('/list/:list/:a/:b/:result', requireToken, compareItems);


router.get('/logout', logout);

router.get('/login', handleToken, (request, response) => response.render('login', {
	url: request.url,
	user: request.user
}));
router.post('/login', handleToken, login);

router.get('/signup', handleToken, (request, response) => response.render('signup', {
	url: request.url,
	user: request.user
}));
router.post('/signup', handleToken, signup);


module.exports = router;