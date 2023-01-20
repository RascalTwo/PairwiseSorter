const { MongoMemoryServer } = require('mongodb-memory-server');
const createServer = require('../server.js');
const constants = require('../config/constants.js');
const getClient = require('../models/database.js');


MongoMemoryServer.create().then(mongod => {
	constants.MONGODB_URL = mongod.getUri() + 'pairwise-sorter-test';

	return getClient();
}).then(mongooseClient =>
	createServer(mongooseClient.connection.getClient()).listen(constants.PORT, () => console.log(`Listening at http://localhost:${constants.PORT}/`))
);