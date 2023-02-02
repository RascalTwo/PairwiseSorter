import React from 'react';
import Card from './Card';

export default ({ user, text, action, oauthAvailable }) => <>
	<h1 className="text-center">{text}</h1>

	<div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
		{!user.hasOnlyOAuth
			? Object.entries(oauthAvailable)
				.filter(([_, available]) => available)
				.map(([slug]) =>
					<Card
						key={slug}
						header={slug[0].toUpperCase() + slug.slice(1)}
						body={<a href={`/login/${slug}`} className="btn btn-primary">Connect</a>}
					/>
				)
			: null
		}
	</div>

	<form action={'/' + action} method="POST">
		<label htmlFor="username" className="form-label">Username</label>
		<input className="form-control" id="username" name="username" autoComplete="username" required />

		{!user.hasOnlyOAuth
			? <>
				<label htmlFor="password" className="form-label">Password</label>
				<input type="password" className="form-control" id="password" name="password" autoComplete="new-password" required />
			</>
			: null
		}

		<button className="btn btn-primary">{text}</button>
	</form>
</>;