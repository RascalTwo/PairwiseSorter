import React from 'react';
import Main from './Main';

export default function Index({ lists, ...mainProps}) {
	return <Main {...mainProps}>
		<form action="/list" method="POST">
			<label for="name" class="form-label">New List Name</label>
			<input class="form-control" id="name" name="name" required />
			<button class="btn btn-primary">Create List</button>
		</form>
		<div class="list-group">
			{lists.map(list => <a
				key={list._id}
				class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
				href={`/list/${list._id}#sorted-tab`}
			>
				{list.name}
				{list.items.length
					? <span class="badge bg-primary rounded-pill">{list.items.length}</span>
					: null
				}
			</a>)}
		</div>
	</Main>;
}
