const PromiseRouter = require('express-promise-router');

const { createList, createItems, compareItems, getList, getNextComparison, deleteList, deleteItem, resetItem, resetListComparisons, resetComparison, renderItemRenamePage, patchItem, patchList } = require('../controllers/list.js');
const { redirectPartialOAuthUsers } = require('../middlewares/index.js');
const router = PromiseRouter();


router.use(redirectPartialOAuthUsers);

router.post('/list', createList);

router.route('/list/:list')
	.get(getList)
	.post(createItems)
	.patch(patchList)
	.delete(deleteList);

router.route('/list/:list/comparisons')
	.get(getNextComparison)
	.put(resetListComparisons);

router.route('/list/:list/:item')
	.get(renderItemRenamePage)
	.patch(patchItem)
	.delete(deleteItem);

router.put('/list/:list/:item/comparisons', resetItem);

router.route('/list/:list/:a/:b')
	.post(compareItems)
	.delete(resetComparison);


module.exports = router;