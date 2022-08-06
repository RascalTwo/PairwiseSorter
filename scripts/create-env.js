const fs = require('fs');

if (!fs.existsSync('.env')) {
	fs.copyFileSync('.env.example', '.env');
	console.log('Created .env file from .env.example');
}
