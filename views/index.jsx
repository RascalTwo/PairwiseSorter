import React from 'react';
import Main from './Main';
import Card from './components/Card';

function durationToLargestUnit(duration) {
	for (const [unit, value] of Object.entries({
		'year': Math.floor(duration / 31536000),
		'month': Math.floor((duration % 31536000) / 2628000),
		'day': Math.floor((duration % 2628000) / 86400),
		'hour': Math.floor((duration % 86400) / 3600),
		'minute': Math.floor((duration % 3600) / 60),
		'second': Math.floor(duration % 60),
	})) {
		if (value) return [-value, unit];
	}
}

export default function Index({ lists, ...mainProps}) {
	const now = Date.now();
	return <Main {...mainProps}>
		<p className="container text-center">Allows you to sort a list of items by comparing items in pairs efficiently!</p>
		<div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
			{lists.map(list =>
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
						<ul className="list-group">
							{list.order.slice(0, 3).map(i => list.items[i]).filter(Boolean).map(({ _id, name }) =>
								<li key={_id} className="list-group-item text-truncate" data-bs-toggle="tooltip" data-bs-title={name} title={name}>{name}</li>
							)}
						</ul>
					</p>}

					footer={<>
						<span></span>
						{new Intl.RelativeTimeFormat().format(...durationToLargestUnit(Math.floor(((now - list.updatedAt.getTime()) / 1000))))}
					</>}
				/>)}
		</div>
	</Main>;
}