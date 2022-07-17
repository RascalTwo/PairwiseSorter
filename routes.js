const express = require('express');
const { handleToken, requireToken } = require('./middlewares.js');
const { homepage, lists, createList, createItem, compareItems, getList, getNextComparison, logout, login, signup } = require('./controllers.js');
const router = express.Router();

router.get('/', handleToken, homepage);
router.get('/lists', handleToken, lists);


router.post('/list', requireToken, createList);
router.get('/list/:list', requireToken, getList);
router.post('/list/:list/item', requireToken, createItem);
router.get('/list/:list/compare', requireToken, getNextComparison);
router.post('/list/:list/:a/:b/:result', requireToken, compareItems);


router.get('/logout', logout);

router.get('/login', handleToken, (request, response) => response.render('login', { user: request.user }));
router.post('/login', handleToken, login);

router.get('/signup', handleToken, (request, response) => response.render('signup', { user: request.user }));
router.post('/signup', handleToken, signup);


module.exports = router;