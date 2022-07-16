const request = require('supertest');
const app = require('../server.js');

describe('server', () => {
	it('has a homepage', () =>
		request(app)
			.get('/')
			.expect('Content-Type', 'text/html; charset=UTF-8')
			.expect(200)
	);
});