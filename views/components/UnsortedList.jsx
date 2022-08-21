import React from 'react';
import ItemContent from './ItemContent';

export default ({ list, isOwner }) => <ul className="list-group" id="unsorted-tab">
	{list.items.map(item =>
		<li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
			<ItemContent name={item.name} />
			{isOwner
				? <div className="btn-group" role="group" aria-label="Item Actions">
					<a className="btn btn-primary" href={`/list/${list._id}/${item._id}`}>Rename</a>
					<a className="btn btn-warning" href={`/list/${list._id}/${item._id}/comparisons?_method=PUT`}>Reset</a>
					<a className="btn btn-danger" href={`/list/${list._id}/${item._id}?_method=DELETE`}>Delete</a>
				</div>
				: null
			}
		</li>)}
</ul>;


