const { MongoMemoryServer } = require('mongodb-memory-server');

const CONSTANTS = require('../constants.js');
const getClient = require('../database.js');

describe('database', () => {
	let mongod = null;
	beforeAll(async () => {
		mongod = await MongoMemoryServer.create();
	});
	afterAll(() => mongod.stop());
	describe('can be connected to', () => {
		let oldMONGODB_URL = CONSTANTS.MONGODB_URL;
		beforeAll(() => {
			CONSTANTS.MONGODB_URL = mongod.getUri();
		});
		afterAll(() => {
			CONSTANTS.MONGODB_URL = oldMONGODB_URL;
		});
		it('', () => getClient());
	});

	it('throws error', async () => {
		expect.assertions(1);
		try {
			return await getClient(true, { serverSelectionTimeoutMS: 1000 });
		} catch (err) {
			return expect(err.message).toEqual('Error: connect ECONNREFUSED 127.0.0.1:27017');
		}
	});
});