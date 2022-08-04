const request = require('supertest');
const app = require('../server.js');
const getClient = require('../models/database.js');
const { createMemoryServer, createNewToken } = require('./helpers.js');
const CONSTANTS = require('../constants.js');

const jwt = require('jsonwebtoken');


createMemoryServer(CONSTANTS);
describe('/api/me', () => {

	it('returns generated token', () =>
		request(app)
			.get('/api/me')
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect(200)
			.expect(response => {
				expect(typeof response.body?.token).toEqual('string');
				expect(typeof jwt.decode(response.body.token)._id).toEqual('string');
			})
	);

	it('returns passed token', () => {
		const { token } = createNewToken();
		return request(app)
			.get('/api/me')
			.set('Authorization', 'Bearer ' + token)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect(200)
			.expect(response => expect(response.body).toMatchObject({ token }));
	}
	);

	it('returns existing list', async () => {
		const { id: ownerID, token } = createNewToken();

		const { insertedId: id } = await (await getClient()).db('pairwise-sorter').collection('lists').insertOne({
			owner: ownerID,
			name: 'test',
			items: []
		});
		return request(app)
			.get('/api/me')
			.set('Authorization', 'Bearer ' + token)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect(200)
			.expect(response =>
				expect(response.body).toMatchObject({
					token,
					lists: [{ id, name: 'test', items: [] }]
				})
			);
	});
});

describe('POST /api/list', () => {
	it('creates list', () => {
		const { token } = createNewToken();
		return request(app)
			.post('/api/list')
			.send({ name: 'list' })
			.set('Authorization', 'Bearer ' + token)
			.expect(response =>
				expect(typeof response.body).toEqual('string')
			);
	});
});