jest.mock('dotenv', () => ({ config: jest.fn() }));

describe('constants', () => {
	describe('default values', () => {
		beforeEach(() => jest.resetModules());
		test('PORT default', () =>
			expect(require('../config/constants.js').PORT).toEqual(1337)
		);
		test('MONGODB_URL default', () =>
			expect(require('../config/constants.js').MONGODB_URL).toEqual('mongodb://localhost:27017/pairwise-sorter')
		);
		test('SESSION_SECRET default', () =>
			expect(require('../config/constants.js').SESSION_SECRET).toEqual('secret')
		);
	});
});
