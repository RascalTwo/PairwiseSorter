const server = require('./server.js');
const { PORT } = require('./constants.js');
const getClient = require('./models/database.js');


getClient().then(() =>
	server.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}/`))
);

