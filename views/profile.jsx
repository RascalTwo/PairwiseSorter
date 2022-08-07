import React from 'react';
import Main from './Main';
import Card from './components/Card';

export default function Profile(mainProps) {
	return <Main {...mainProps}>
		<h1>{mainProps.user.username}</h1>

		<h2>External Accounts</h2>
		<div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
			{Object.entries(mainProps.oauthAvailable)
				.filter(([_, available]) => available)
				.map(([slug]) =>
					<Card
						key={slug}
						header={slug[0].toUpperCase() + slug.slice(1)}
						body={mainProps.user.connected[slug + 'Id']
							? <a href={`/logout/${slug}`} className="btn btn-danger">Disconnect</a>
							: <a href={`/login/${slug}`} className="btn btn-primary">Connect</a>
						}
					/>)}
		</div>
	</Main>;
}