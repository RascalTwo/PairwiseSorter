const PromiseRouter = require('express-promise-router');

const { homepage, lists } = require('../controllers/index.js');
const { redirectPartialOAuthUsers } = require('../middlewares/index.js');
const router = PromiseRouter();

router.use(redirectPartialOAuthUsers);

router.get('/', homepage);
router.get('/lists', lists);

module.exports = router;