import React from 'react';

export default ({ list, order }) => <ul class="list-group" id="sorted-tab">
	{order.map(i => list.items[i]).filter(Boolean).map(({ _id, name }) =>
		<li key={_id} class="list-group-item">{name}</li>
	)}
</ul>;
