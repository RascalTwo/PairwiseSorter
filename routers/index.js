const PromiseRouter = require('express-promise-router');

const controller = require('../controllers/index.js');
const { redirectPartialOAuthUsers } = require('../middlewares/index.js');
const router = PromiseRouter();

router.use(redirectPartialOAuthUsers);

router.get('/', controller.renderHomepage);
router.get('/lists', controller.renderLists);

module.exports = router;