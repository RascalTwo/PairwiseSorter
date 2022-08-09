const fs = require('fs');

if (!fs.existsSync('config/.env')) {
	fs.copyFileSync('config/.env.example', 'config/.env');
	console.log('Created config/.env file from config/.env.example');
}
