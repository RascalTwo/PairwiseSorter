const express = require('express');
const { handleToken, requireToken } = require('./middlewares.js');
const { getMe, createList } = require('./controllers.js');
const router = express.Router();

router.get('/me', handleToken, getMe);
router.post('/list', requireToken, createList);

module.exports = router;