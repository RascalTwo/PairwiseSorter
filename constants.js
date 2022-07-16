require('dotenv').config();

const PORT = process.env.PORT || 1337;
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/pairwisesorter';

module.exports = { PORT, MONGODB_URL };