const express = require('express');
const { createEngine } = require('express-react-views');
const methodOverride = require('method-override');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { ObjectId } = require('mongodb');
const MongoStore = require('connect-mongo');
const expressSession = require('express-session');
const setupPassport = require('./passport');
const middlewares = require('./middlewares/index.js');
const { SESSION_SECRET, MONGODB_URL, NODE_ENV } = require('./config/constants');

const app = express();

try{
	if (NODE_ENV === 'testing') require('@cypress/code-coverage/middleware/express')(app);
} catch (e) { console.error(e) }

app.engine('jsx', createEngine({ beautify: process.env.NODE_ENV !== 'production' }));
app.set('view engine', 'jsx');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride((request) => {
	if (request.body && typeof request.body === 'object' && '_method' in request.body) {
		const method = request.body._method;
		delete request.body._method;
		return method;
	}
	if ('_method' in request.query) {
		const method = request.query._method;
		delete request.query._method;

		if (!('body' in request)) request.body = {};
		Object.assign(request.body, request.query);
		request.query = {};

		return method;
	}
}, { methods: ['GET', 'POST'] }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
if (NODE_ENV === 'testing') app.use(express.static('./public-instrumented'));
app.use(express.static('./public'));
app.use(cookieParser());
app.use(expressSession({
	genid: () => new ObjectId().toString(),
	secret: SESSION_SECRET, // TODO - move to env variable
	resave: true,
	saveUninitialized: true,
	store: NODE_ENV === 'production' ? MongoStore.create({ mongoUrl: MONGODB_URL }) : new (require('session-file-store')(expressSession))({ path: './dev-sessions'})
}));
setupPassport(app);

app.use(middlewares.createAnonymousUser);
app.use(middlewares.trackOldSessionID);
app.use(middlewares.exposeUserAndURLToView);

app.use(require('./routers/index.js'));
app.use(require('./routers/user.js'));
app.use(require('./routers/list.js'));

module.exports = app;