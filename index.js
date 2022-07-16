const server = require('./server.js');
const { PORT } = require('./constants.js')

server.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}/`));
