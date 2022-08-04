import React from 'react';

export default ({ text, action }) => <>
	<h1 className="text-center">{text}</h1>
	<form action={'/' + action} method="POST">
		<label for="username" className="form-label">Username</label>
		<input className="form-control" id="username" name="username" required />

		<label for="password" className="form-label">Password</label>
		<input type="password" className="form-control" id="password" name="password" required />

		<button className="btn btn-primary">{text}</button>
	</form>
	<a href="/login/google">Google</a>
</>;