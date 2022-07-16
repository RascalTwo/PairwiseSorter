const { MongoClient } = require('mongodb');

const CONSTANTS = require('./constants.js');

let client = null;

module.exports = async (reconnect = false, options = {}) => {
	if (!client || reconnect) {
		if (client) await client.close();

		client = new MongoClient(CONSTANTS.MONGODB_URL, options);
		await client.connect();
	}

	return client;
};