import React from 'react';

export default ({ list, isOwner }) => <ul class="list-group" id="unsorted-tab">
	{list.items.map(item =>
		<li key={item._id} class="list-group-item d-flex justify-content-between align-items-center">
			{item.name}
			{isOwner
				? <div class="btn-group" role="group" aria-label="Item Actions">
					<a class="btn btn-primary" href={`/list/${list._id}/${item._id}`}>Rename</a>
					<a class="btn btn-warning" href={`/list/${list._id}/${item._id}/comparisons?_method=PUT`}>Reset</a>
					<a class="btn btn-danger" href={`/list/${list._id}/${item._id}?_method=DELETE`}>Delete</a>
				</div>
				: null
			}
		</li>)}
</ul>;


