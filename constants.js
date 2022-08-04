require('dotenv').config();

const PORT = process.env.PORT || 1337;
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/pairwise-sorter';
const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';
const NODE_ENV = process.env.NODE_ENV;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;


module.exports = { PORT, MONGODB_URL, SESSION_SECRET, NODE_ENV, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET };