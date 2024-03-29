const mongoose = require('mongoose');

const CONSTANTS = require('../config/constants.js');

let client = null;

/**
 * @param {boolean} reconnect
 * @param {import('mongoose').ConnectOptions} options
 * @returns {Promise<MongoClient>}
 */
module.exports = async (reconnect = false, options = {}) => {
	if (!client || reconnect) {
		if (client) await client.connection.close();

		client = await mongoose.connect(CONSTANTS.MONGODB_URL, options);
	}

	return client;
};