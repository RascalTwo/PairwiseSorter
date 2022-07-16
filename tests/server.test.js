const request = require('supertest');
const app = require('../server.js');

describe('server', () => {
	it('has a homepage', () =>
		request(app)
			.get('/')
			.expect('Content-Type', 'text/html; charset=utf-8')
			.expect(200)
	);

	it('serves static assets', () =>
		request(app)
			.get('/index.css')
			.expect('Content-Type', 'text/css; charset=UTF-8')
			.expect(200)
	);
});