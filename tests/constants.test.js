const { PORT, MONGODB_URL } = require('../constants.js');

describe('constant values', () => {
	test('PORT default', () => {
		expect(PORT).toEqual(1337);
	});
	test('MONGODB_URL default', () => {
		expect(MONGODB_URL).toEqual('mongodb://localhost:27017/pairwisesorter');
	});
});