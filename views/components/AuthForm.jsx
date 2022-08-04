import React from 'react';

export default ({ text, action, has }) => <>
	<h1 className="text-center">{text}</h1>
	<form action={'/' + action} method="POST">
		<label htmlFor="username" className="form-label">Username</label>
		<input className="form-control" id="username" name="username" required />

		<label htmlFor="password" className="form-label">Password</label>
		<input type="password" className="form-control" id="password" name="password" required />

		<button className="btn btn-primary">{text}</button>
	</form>
	{Object.entries(has)
		.filter(([_, has]) => has)
		.map(([key]) =>
			<a href={`/login/${key}`}>{key[0].toUpperCase() + key.slice(1)}</a>
		)}
</>;