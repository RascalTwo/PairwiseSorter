import React from 'react';
import Main from './Main';
import Card from './components/Card';
import TimeAgo from './components/TimeAgo';
import ItemContent from './components/ItemContent';


export default function User({ visitingUser, ...mainProps }) {
	return <Main {...mainProps}>
		<h1>{visitingUser.username}</h1>

		{mainProps.user.username === visitingUser.username
			? <details>
					<summary>External Accounts</summary>
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
					<br/>
				</details>
			: null
		}

		<div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
			{visitingUser.lists.map(list =>
				<Card
					key={list._id}
					header={<>
						<a href={`/list/${list._id}#sorted-tab`} className="text-truncate" data-bs-toggle="tooltip" data-bs-title={list.name} title={list.name}>{list.name}</a>

						{list.items.length
							? <div>
								{list.progress % 1 ? <span className="badge bg-warning rounded-pill">{(list.progress * 100).toFixed(0)}%</span> : null}
								<span className="badge bg-primary rounded-pill">{list.items.length}</span>
							</div>
							: null
						}
					</>}
					body={<p className="card-text">
						<ul className="list-group" data-html-generating-code={list.htmlGeneratingCode ? Buffer.from(list.htmlGeneratingCode).toString('base64') : undefined}>
							{list.order.map(i => list.items[i]).filter(item => item && !item.completedAt).slice(0, 3).map(({ _id, name }) =>
								<li key={_id} className="list-group-item text-truncate" data-bs-toggle="tooltip" data-bs-title={name} title={name}><ItemContent name={name} htmlGenerated={!!list.htmlGeneratingCode}/></li>
							)}
						</ul>
					</p>}

					footer={<>
						<span></span>
						<TimeAgo date={list.updatedAt} />
					</>}
				/>)}
		</div>
	</Main>;
}