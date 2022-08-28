import React from 'react';
import Main from './Main';
import Card from './components/Card';
import TimeAgo from './components/TimeAgo';
import ItemContent from './components/ItemContent';


export default function Index({ lists, ...mainProps}) {
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
						<ul className="list-group" data-html-generating-code={list.htmlGeneratingCode ? Buffer.from(list.htmlGeneratingCode).toString('base64') : undefined}>
							{list.order.slice(0, 3).map(i => list.items[i]).filter(Boolean).map(({ _id, name }) =>
								<li key={_id} className="list-group-item text-truncate" data-bs-toggle="tooltip" data-bs-title={name} title={name}><ItemContent name={name} /></li>
							)}
						</ul>
					</p>}

					footer={<>
						<a href={`/user/${list.owner.username}`}>{list.owner.username}</a>
						<TimeAgo date={list.updatedAt} />
					</>}
				/>)}
		</div>
	</Main>;
}