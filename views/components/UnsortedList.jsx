import React from 'react';
import ItemContent from './ItemContent';

export default ({ list, isOwner }) => <ul className="list-group" id="unsorted-tab">
	{list.items.map(item =>
		<li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
			<ItemContent name={item.name} htmlGenerated={!!list.htmlGeneratingCode} />
			{isOwner
				? <div className="btn-group" role="group" aria-label="Item Actions">
					<a className="btn btn-primary" href={`/list/${list._id}/${item._id}`}>Rename</a>
					<a className="btn btn-warning" href={`/list/${list._id}/${item._id}/comparisons?_method=PUT`} data-confirm={`reset all comparisons with ${item.name}`}>Reset</a>
					<a className="btn btn-danger" href={`/list/${list._id}/${item._id}?_method=DELETE`} data-confirm={`delete ${item.name}`}>Delete</a>
					<a className="btn btn-info" href={`/list/${list._id}/${item._id}/completed?_method=PATCH&value=${!item.completedAt}`}>Mark {item.completedAt ? 'Incomplete' : 'Complete'}</a>
				</div>
				: null
			}
		</li>)}
</ul>;


