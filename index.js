const createServer = require('./server.js');
const { PORT } = require('./config/constants.js');
const getClient = require('./models/database.js');


getClient().then(mongooseClient =>
	createServer(mongooseClient.connection.getClient()).listen(PORT, () => console.log(`Listening at http://localhost:${PORT}/`))
);

