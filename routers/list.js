const PromiseRouter = require('express-promise-router');

const listController = require('../controllers/list.js');
const { redirectPartialOAuthUsers } = require('../middlewares/index.js');
const router = PromiseRouter();


router.use(redirectPartialOAuthUsers);

router.post('/list', listController.create);

router.route('/list/:list')
	.get(listController.render)
	.post(listController.createItems)
	.put(listController.bulkEditItems)
	.patch(listController.update)
	.delete(listController.del);

router.get('/list/:list/search', listController.renderSearch);

router.route('/list/:list/comparisons')
	.get(listController.renderNextComparison)
	.put(listController.resetComparisons);

router.route('/list/:list/:item')
	.get(listController.renderItemRename)
	.patch(listController.updateItem)
	.delete(listController.delItem);

router.patch('/list/:list/:item/completed', listController.toggleItemCompleted)

router.put('/list/:list/:item/comparisons', listController.resetItem);

router.route('/list/:list/:a/:b')
	.post(listController.compareItems)
	.delete(listController.resetItemComparison);


module.exports = router;