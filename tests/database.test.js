const CONSTANTS = require('../config/constants.js');
const getClient = require('../models/database.js');
const { createMemoryServer } = require('./helpers.js');

describe('database', () => {
	describe('can be connected to', () => {
		createMemoryServer(CONSTANTS);
		it('', () => getClient());
	});

	it('throws error', async () => {
		CONSTANTS.MONGODB_URL = 'mongodb://localhost:27017/pairwise-sorter-test';
		expect.assertions(1);
		try {
			return await getClient(true, { serverSelectionTimeoutMS: 1000 });
		} catch (err) {
			return expect(err.message).toEqual('Error: connect ECONNREFUSED 127.0.0.1:27017');
		}
	});
});