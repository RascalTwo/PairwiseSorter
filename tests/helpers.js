const { MongoMemoryServer } = require('mongodb-memory-server');


module.exports = function createMemoryServer(constants){
	let mongod = null;
	let oldMONGODB_URL = constants.MONGODB_URL;
	beforeAll(async () => {
		mongod = await MongoMemoryServer.create();
		constants.MONGODB_URL = mongod.getUri();
	});
	afterAll(() => {
		constants.MONGODB_URL = oldMONGODB_URL;
		mongod.stop();
	});
};