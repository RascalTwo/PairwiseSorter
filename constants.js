require('dotenv').config();

const PORT = process.env.PORT || 1337;
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/pairwise-sorter';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

module.exports = { PORT, MONGODB_URL, JWT_SECRET };