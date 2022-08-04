const request = require('supertest');
const app = require('../../server.js');
const getClient = require('../../models/database.js');
const CONSTANTS = require('../../constants.js');
const { createMemoryServer } = require('../helpers.js');
describe('homepage', () => {
	createMemoryServer(CONSTANTS);
	it.only('redirects to last modified list', async () => {
		const client = (await getClient()).db('pairwise-sorter');
		const { insertedIds } = await client.collection('lists').insertMany([{
			name: 'test',
			createdAt: new Date('2020-01-01'),
			modifiedAt: new Date('2020-01-02'),
			items: [],
		}, {
			name: 'test2',
			createdAt: new Date('2020-01-01'),
			modifiedAt: new Date('2020-01-03'),
			items: [{
				id: 't',
				name: 'test',
			}],
			comparisons: {
				a: { b: -1 }
			}
		}]);
		return request(app)
			.get('/')
			.expect(302)
			.expect('Location', '/list/' + insertedIds[1].toString());
	});
});