const bcrypt = require('bcrypt');
const List = require('../models/List');
const User = require('../models/User');


function getLastModifiedList(lists) {
	const modified = {};
	for (const list of lists) {
		modified[list._id] = +(list.updatedAt || list.modifiedAt);
		for (const item of list.items) {
			modified[list._id] = Math.max(modified[list._id], +(item.updatedAt || list.modifiedAt));
		}
		for (const a of list.comparisons.keys()) {
			for (const b of list.comparisons.get(a).keys()) {
				modified[list._id] = Math.max(modified[list._id], +list.comparisons.get(a).get(b).createdAt);
			}
		}
	}
	return Object.entries(modified).sort((a, b) => b[1] - a[1])[0]?.[0];
}

async function logout(request, response, next) {
	if (request.user.hasOnlyOAuth) await request.user.remove();
	request.logout((err) => err ? next(err) : response.redirect('/'));
}

async function login(request, response) {
	await List.updateMany({ owner: request.oldSessionId }, {
		owner: request.user._id
	});

	const lastModifiedID = getLastModifiedList(await List.find({
		owner: request.user._id
	}));
	if (lastModifiedID) return response.redirect(`/list/${lastModifiedID}#sorted-tab`);
	return response.redirect('/');
}

async function signup(request, response, next) {
	const existing = await User.findOne({
		username: new RegExp('^' + request.body.username + '$', 'i'),
	});

	if (existing) {
		return response.render('signup', {
			url: request.url,
			user: request.user,
			message: 'Username already exists'
		});
	}

	let user;
	if (request.user.hasOnlyOAuth){
		request.user.username = request.body.username;
		user = await request.user.save();
	} else {
		user = await new User({ username: request.body.username, password: await bcrypt.hash(request.body.password, 10) }).save();
	}

	await List.updateMany({
		owner: request.user._id
	}, {
		$set: {
			owner: user._id
		}
	});

	const lastModifiedID = getLastModifiedList(await List.find({
		owner: user._id
	}));

	request.login(user, err => {
		if (err) return next(err);

		if (lastModifiedID) return response.redirect(`/list/${lastModifiedID}#sorted-tab`);
		return response.redirect('/');
	});
}

module.exports = { logout, login, signup };