# [Pairwise Sorter](https://pairwisesorter-production.up.railway.app/)

[![Website](https://img.shields.io/website?url=https://pairwisesorter-production.up.railway.app/&label=Website)](https://pairwisesorter-production.up.railway.app/)

Allows you to sort a list of items by efficiently comparing items in pairs!

**Link to project:** https://pairwisesorter-production.up.railway.app/

## How It's Made

**Tech used:** HTML, CSS, JavaScript, Express, Node.js, MongoDB, EJS, ESLint

At the core is using a efficient implementation of a comparison-based sorting althrothim to ask as few questions as possible, combined with the ability to save and share the lists with others if you desire.

## Usage

As this is a Node.js project, after cloning run `npm install` to install all the required dependancies.

After that, set your environment variables to include the URL to your instance of MongoDB and a random string to use as the JWT token secret

```
MONGODB_URL = mongodb://localhost:27017/pairwise-sorter
JWT_SECRET = secret
```

### Scripts

- `start`
  - Start the server
- `lint`
  - Run ESLint on files
- `dev`
  - Start server with `nodemon`
