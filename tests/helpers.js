const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports.createMemoryServer = function createMemoryServer(constants){
	let mongod = null;
	let oldMONGODB_URL = constants.MONGODB_URL;
	beforeAll(async () => {
		mongod = await MongoMemoryServer.create();
		constants.MONGODB_URL = mongod.getUri() + 'pairwise-sorter-test';
	});
	afterAll(() => {
		constants.MONGODB_URL = oldMONGODB_URL;
		mongod.stop();
	});
};