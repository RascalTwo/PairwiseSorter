const CONSTANTS = require('../constants.js');
const getClient = require('../database.js');
const createMemoryServer = require('./helpers.js');

describe('database', () => {
	describe('can be connected to', () => {
		createMemoryServer(CONSTANTS);
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