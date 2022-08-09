const { MongoMemoryServer } = require('mongodb-memory-server');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const CONSTANTS = require('../config/constants.js');

module.exports.createMemoryServer = function createMemoryServer(constants){
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

module.exports.createNewToken =  function createNewToken(){
	const id = new ObjectId();
	return { id, token: jwt.sign({ id }, CONSTANTS.JWT_SECRET) };
};
